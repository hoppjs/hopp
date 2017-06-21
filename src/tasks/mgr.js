/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import fs from 'fs'
import path from 'path'
import pump from 'pump'
import glob from '../fs/glob'
import * as cache from '../cache'
import mapStream from 'map-stream'
import getPath from '../fs/get-path'
import { _, createLogger } from '../utils'
import { disableFSCache, mkdirp, openFile, tmpFile } from '../fs'
import { buffer, createBundle, createReadStream } from '../streams'

const watchlog = createLogger('hopp:watch').log

/**
 * Plugins storage.
 */
const plugins = {}
const pluginCtx = {}
const pluginConfig = {}

/**
 * Loads a plugin, manages its env.
 */
const loadPlugin = (plugin, args) => {
  let mod = require(plugin)
  
  // expose module config
  pluginConfig[plugin] = mod.config || {}

  // if defined as an ES2015 module, assume that the
  // export is at 'default'
  if (mod.__esModule === true) {
    mod = mod.default
  }

  // create plugin logger
  const logger = createLogger(`hopp:${path.basename(plugin).substr(5)}`)

  // create a new context for this plugin
  pluginCtx[plugin] = {
    args,
    log: logger.log,
    debug: logger.debug,
    error: logger.error
  }

  // add plugins to loaded plugins
  plugins[plugin] = mod
}

/**
 * Test for undefined or null.
 */
function isUndefined(value) {
  return value === undefined || value === null
}

/**
 * Hopp class to manage tasks.
 */
export default class Hopp {
  /**
   * Creates a new task with the glob.
   * DOES NOT START THE TASK.
   * 
   * @param {Glob} src
   * @return {Hopp} new hopp object
   */
  constructor (src) {
    if (!(src instanceof Array)) {
      src = [src]
    }

    this.needsBundling = false
    this.needsRecaching = false

    this.d = {
      src,
      stack: []
    }
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */
  dest (out) {
    this.d.dest = out
    return this
  }

  /**
   * Run task in continuous mode.
   */
  watch (name, directory, recache = false) {
    name = `watch:${name}`

    const watchers = []

    this.d.src.forEach(src => {
      // figure out if watch should be recursive
      const recursive = src.indexOf('/**/') !== -1

      // get most definitive path possible
      let newpath = ''
      for (let sub of src.split('/')) {
        if (sub) {
          if (sub.indexOf('*') !== -1) {
            break
          }

          newpath += path.sep + sub
        }
      }
      newpath = path.resolve(directory, newpath.substr(1))

      // disable fs caching for watch
      disableFSCache()

      // start watch
      watchlog('Watching for %s ...', name)
      watchers.push(fs.watch(newpath, {
        recursive: src.indexOf('/**/') !== -1
      }, () => this.start(name, directory, recache, false)))
    })

    return new Promise(resolve => {
      process.on('SIGINT', () => {
        watchers.forEach(watcher => watcher.close())
        resolve()
      })
    })
  }

  /**
   * Handles bundling.
   */
  async startBundling(name, directory, modified, dest, useDoubleCache = true) {
    const { log, debug } = createLogger(`hopp:${name}`)
    debug('Switched to bundling mode')

    /**
     * Fetch sourcemap from cache.
     */
    const sourcemap = cache.sourcemap(name)

    /**
     * Get full list of current files.
     */
    const files = await glob(this.d.src, directory, useDoubleCache, true)

    /**
     * Create list of unmodified.
     */
    let freshBuild = true
    const unmodified = {}

    for (let file of files) {
      if (modified.indexOf(file) === -1) {
        unmodified[file] = true
        freshBuild = false
      }
    }

    /**
     * Get old bundle & create new one.
     */
    const originalFd = freshBuild ? null : await openFile(dest, 'r')
        , [tmpBundle, tmpBundlePath] = await tmpFile()
    
    /**
     * Create new bundle to forward to.
     */
    const bundle = createBundle(tmpBundle)

    /**
     * Since bundling starts streaming right away, we can count this
     * as the start of the build.
     */
    const start = Date.now()
    log('Starting task')

    /**
     * Add all files.
     */
    for (let file of files) {
      let stream

      if (unmodified[file]) {
        debug('forward: %s', file)
        stream = fs.createReadStream(null, {
          fd: originalFd,
          autoClose: false,
          start: sourcemap[file].start,
          end: sourcemap[file].end
        })
      } else {
        debug('transform: %s', file)
        stream = pump([
          createReadStream(file, dest + '/' + path.basename(file))
        ].concat(this.buildStack()))
      }

      bundle.add(file, stream)
    }

    /**
     * Wait for bundling to end.
     */
    await bundle.end(tmpBundlePath)

    /**
     * Move the bundle to the new location.
     */
    if (originalFd) originalFd.close()
    await mkdirp(path.dirname(dest).replace(directory, ''), directory)
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(tmpBundlePath).pipe(fs.createWriteStream(dest))

      stream.on('close', resolve)
      stream.on('error', reject)
    })

    /**
     * Update sourcemap.
     */
    cache.sourcemap(name, bundle.map)

    log('Task ended (took %s ms)', Date.now() - start)
  }

  /**
   * Converts all plugins in the stack into streams.
   */
  buildStack () {
    let mode = 'stream'

    return this.d.stack.map(([plugin]) => {
      const pluginStream = mapStream((data, next) => {
        try {
          plugins[plugin](
            pluginCtx[plugin],
            data
          )
            .then(newData => next(null, newData))
            .catch(err => next(err))
        } catch (err) {
          next(err)
        }
      })

      /**
       * Enable buffer mode if required.
       */
      if (mode === 'stream' && pluginConfig[plugin].mode === 'buffer') {
        mode = 'buffer'
        return pump(buffer(), pluginStream)
      }

      /**
       * Otherwise keep pumping.
       */
      return pluginStream
    })
  }

  /**
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  async start (name, directory, recache = false, useDoubleCache = true) {
    const { log, debug } = createLogger(`hopp:${name}`)

    /**
     * Figure out if bundling is needed & load plugins.
     */
    if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || (this.d.stack.length > 0 && !this.loadedPlugins)) {
      this.loadedPlugins = true

      this.d.stack.forEach(([plugin, args]) => {
        if (!plugins.hasOwnProperty(plugin)) {
          loadPlugin(plugin, args)
        }

        this.needsBundling = !!(this.needsBundling || pluginConfig[plugin].bundle)
        this.needsRecaching = !!(this.needsRecaching || pluginConfig[plugin].recache)
      })
    }

    /**
     * Override recaching.
     */
    if (this.needsRecaching) {
      recache = true
    }

    /**
     * Get the modified files.
     */
    debug('task recache = %s', recache)
    let files = await glob(this.d.src, directory, useDoubleCache, recache)

    if (files.length > 0) {
      const dest = path.resolve(directory, getPath(this.d.dest))

      /**
       * Switch to bundling mode if need be.
       */
      if (this.needsBundling) {
        return await this.startBundling(name, directory, files, dest, useDoubleCache)
      }

      /**
       * Ensure dist directory exists.
       */
      await mkdirp(dest.replace(directory, ''), directory)

      /**
       * Create streams.
       */
      files = _(files).map(file => ({
        file,
        stream: [
          createReadStream(file, dest + '/' + path.basename(file))
        ]
      }))

      if (this.d.stack.length > 0) {
        /**
         * Create streams.
         */
        const stack = this.buildStack()

        /**
         * Connect plugin streams with pipelines.
         */
        files.map(file => {
          file.stream = file.stream.concat(stack)
          return file
        })
      }

      /**
       * Connect with destination.
       */
      files.map(file => {
        // strip out the actual body and write it
        file.stream.push(mapStream((data, next) => {
          if (typeof data !== 'object' || !data.hasOwnProperty('body')) {
            return next(new Error('A plugin has destroyed the stream by returning a non-object.'))
          }

          next(null, data.body)
        }))
        file.stream.push(fs.createWriteStream(dest + '/' + path.basename(file.file)))

        // promisify the current pipeline
        return new Promise((resolve, reject) => {
          // connect all streams together to form pipeline
          file.stream = pump(file.stream, err => {
            if (err) reject(err)
          })
          file.stream.on('close', resolve)
        })
      })

      // start & wait for all pipelines to end
      const start = Date.now()
      log('Starting task')
      await Promise.all(files.val())
      log('Task ended (took %s ms)', Date.now() - start)
    } else {
      log('Skipping task')
    }
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON () {
    return {
      dest: this.d.dest,
      src: this.d.src,
      stack: this.d.stack,
      needsBundling: this.needsBundling,
      needsRecaching: this.needsRecaching
    }
  }

  /**
   * Deserializes a JSON object into a manager.
   * @param {Object} json
   * @return {Hopp} task manager
   */
  fromJSON (json) {
    this.d.dest = json.dest
    this.d.src = json.src
    this.d.stack = json.stack
    this.needsBundling = json.needsBundling
    this.needsRecaching = json.needsRecaching

    return this
  }
}