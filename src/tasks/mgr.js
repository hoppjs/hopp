/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import fs from 'fs'
import path from 'path'
import pump from 'pump'
import glob from '../fs/glob'
import through from 'through'
import * as cache from '../cache'
import mapStream from 'map-stream'
import getPath from '../fs/get-path'
import { _, createLogger } from '../utils'
import { disableFSCache, mkdirp, openFile, tmpFile } from '../fs'
import { buffer, Bundle, createReadStream } from '../streams'

const { debug } = createLogger('hopp')
const watchlog = createLogger('hopp:watch').log

/**
 * Plugins storage.
 */
const plugins = {}
const pluginConfig = {}

/**
 * Test for undefined or null.
 */
function isUndefined (value) {
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

    // store context local to each task
    this.pluginCtx = {}

    // persistent info
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
  async startBundling (name, directory, modified, dest, useDoubleCache = true) {
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
    const [tmpBundle, tmpBundlePath] = await tmpFile()

    /**
     * Create new bundle to forward to.
     */
    const bundle = new Bundle(directory, tmpBundle)

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
          start: sourcemap[file.replace(directory, '.')].start,
          end: sourcemap[file.replace(directory, '.')].end
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
    const that = this
    let mode = 'stream'

    return this.d.stack.map(([plugin]) => {
      const pluginStream = through(async function (data) {
        try {
          const handler = plugins[plugin](
            that.pluginCtx[plugin],
            data
          )

          // for async functions/promises
          if (handler instanceof Promise) {
            handler
              .then(newData => this.emit('data', newData))
              .catch(err => this.emit('error', err))
          } else if ('next' in handler) {
            let retval

            // for async generators
            do {
              retval = await handler.next()
              this.emit('data', retval.value)
            } while (!retval.done)
          } else {
            // otherwise, fail
            this.emit('error', new Error('Unknown return value received from ' + plugin))
          }
        } catch (err) {
          this.emit('error', err)
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
   * Loads a plugin, manages its env.
   */
  loadPlugin (taskName, plugin, args, directory) {
    let mod = plugins[plugin]

    if (!mod) {
      // convert plugin path from relative back to absolute
      try {
        mod = require(path.join(directory, 'node_modules', plugin))
      } catch (err) {
        debug('failed to load plugin: %s', err && err.stack ? err.stack : err)
        throw new Error('Failed to load plugin: %s', plugin)
      }

      // expose module config
      pluginConfig[plugin] = mod.config || {}

      // if defined as an ES2015 module, assume that the
      // export is at 'default'
      if (mod.__esModule === true) {
        mod = mod.default
      }

      // add plugins to loaded plugins
      plugins[plugin] = mod
    }

    // create plugin logger
    const logger = createLogger(`hopp:${taskName}:${path.basename(plugin).substr(5)}`)

    // load/create cache for plugin
    const pluginCache = cache.plugin(plugin)

    // create a new context for this plugin
    this.pluginCtx[plugin] = {
      args,
      cache: pluginCache,
      log: logger.log,
      debug: logger.debug,
      error: logger.error
    }
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
    if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || isUndefined(this.readonly) || (this.d.stack.length > 0 && !this.loadedPlugins)) {
      this.loadedPlugins = true

      this.d.stack.forEach(([plugin, args]) => {
        if (!this.pluginCtx.hasOwnProperty(plugin)) {
          this.loadPlugin(name, plugin, args, directory)
        }

        this.needsBundling = !!(this.needsBundling || pluginConfig[plugin].bundle)
        this.needsRecaching = !!(this.needsRecaching || pluginConfig[plugin].recache)
        this.readonly = !!(this.readonly || pluginConfig[plugin].readonly)

        if (this.needsBundling && this.readonly) {
          throw new Error('Task chain enabled bundling and readonly mode at the same time. Not sure what to do.')
        }
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
        return this.startBundling(name, directory, files, dest, useDoubleCache)
      }

      /**
       * Ensure dist directory exists.
       */
      if (!this.readonly) {
        await mkdirp(dest.replace(directory, ''), directory)
      }

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
        if (!this.readonly) {
          // strip out the actual body and write it
          file.stream.push(mapStream((data, next) => {
            if (typeof data !== 'object' || !data.hasOwnProperty('body')) {
              return next(new Error('A plugin has destroyed the stream by returning a non-object.'))
            }

            next(null, data.body)
          }))

          // add the readstream at the end
          file.stream.push(fs.createWriteStream(dest + '/' + path.basename(file.file)))
        }

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
      needsRecaching: this.needsRecaching,
      readonly: this.readonly
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
    this.readonly = json.readonly

    return this
  }
}
