/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import fs from 'fs'
import path from 'path'
import pump from 'pump'
import glob from '../fs/glob'
import through2 from 'through2'
import * as cache from '../cache'
import getPath from '../fs/get-path'
import { _, createLogger, simplifyError } from '../utils'
import { buffer, Bundle, createReadStream, map as mapStream } from '../streams'
import { disableFSCache, mkdirp, mkdirpSync, openFile, tmpFile, tmpFileSync } from '../fs'

const { debug } = createLogger('hopp')
const watchlog = createLogger('hopp:watch').log

/**
 * Plugins storage.
 */
const plugins = Object.create(null)
const pluginConfig = Object.create(null)

/**
 * The stat cache.
 */
let gstatCache

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
    this.pluginCtx = Object.create(null)

    // store args separate from context to avoid arg collisions
    // when a plugin has many methods
    this.pluginArgs = Object.create(null)

    // persistent info
    this.d = {
      src,
      stack: [],
      rename: []
    }

    // do local create
    for (const plugin in Hopp.fn) {
      this[plugin] = Hopp.fn[plugin].bind(this)

      for (const method in Hopp.fn[plugin]) {
        this[plugin][method] = Hopp.fn[plugin][method].bind(this)
      }
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
   * Allow renaming of destination files.
   * @param {Object|Function} mapper renaming options or renaming function
   * @returns {Hopp} current object for chaining
   */
  rename (mapper) {
    if (typeof mapper !== 'function' && typeof mapper !== 'object') {
      throw new Error('Rename must be given a function or object.')
    }

    this.d.rename.push(mapper)
    return this
  }

  /**
   * Actually do the renaming.
   * @param {String} filename the original name
   * @param {String} dirname the destination directory
   * @param {String} source the absolute source filename
   * @returns {String} renamed filename
   */
  doRename (filename, dirname, source) {
    let dest = dirname + '/' + filename

    for (const mapper of this.d.rename) {
      dest = this.applyRename(mapper, path.basename(dest), path.dirname(dest), source)
    }

    return dest
  }

  /**
   * Apply a single rename.
   * @param {Object|Function} mapper renaming object or function
   * @param {String} filename the original name
   * @param {String} dirname the destination directory
   * @param {String} source the absolute source filename
   * @returns {String} renamed filename
   */
  applyRename (mapper, filename, dirname, source) {
    // if no rename is defined, just use current filename
    if (!mapper) return dirname + '/' + filename

    // functions are easy, but they break caching
    if (typeof mapper === 'function') {
      return mapper(filename, dirname, source)
    }

    // remove extension
    let ext = filename.substr(1 + filename.lastIndexOf('.'))
    filename = filename.substr(0, filename.lastIndexOf('.'))

    // add prefix
    if (mapper.prefix) {
      filename = mapper.prefix + filename
    }

    // add suffix, before extension
    if (mapper.suffix) {
      filename += mapper.suffix
    }

    // change extension
    if (mapper.ext) {
      ext = mapper.ext
    }

    // output final filename into same dest directory
    return dirname + '/' + filename + '.' + ext
  }

  /**
   * Run task in continuous mode.
   */
  watch (name, directory, recache = false) {
    name = `watch:${name}`

    const watchers = []

    this.d.src.forEach(src => {
      // get most definitive path possible
      let newpath = path.resolve(directory, glob.nonMagic(src))

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
    const files = await glob(name, this.d.src, directory, useDoubleCache, true)

    /**
     * Create list of unmodified.
     */
    let freshBuild = true
    const unmodified = Object.create(null)

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
          createReadStream(file, dest + '/' + path.basename(file), directory)
        ].concat(this.buildStack(name)))
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
  buildStack (name) {
    const that = this

    let mode = 'stream'

    return this.d.stack.map(([plugin, method, plugName]) => {
      const pluginStream = through2.obj(async function (data, _, done) {
        try {
          /**
           * Grab args.
           */
          const args = (that.pluginArgs[plugName] || {})[method] || []

          /**
           * Try and get proper method - assume
           * default by default.
           */
          const handler = plugins[plugin][method || 'default'](
            Object.assign(
              {},
              that.pluginCtx[plugin],
              { args }
            ),
            data
          )

          // for async functions/promises
          if ('then' in handler) {
            try {
              this.push(await handler)
              done()
            } catch (err) {
              done(simplifyError(err, new Error()))
            }
          } else if ('next' in handler) {
            let retval

            // for async generators
            do {
              retval = await handler.next()
              this.push(retval.value)
            } while (!retval.done)

            done()
          } else {
            // otherwise, fail
            done(new Error('Unknown return value received from ' + plugin))
          }
        } catch (err) {
          done(simplifyError(err, new Error()))
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
  loadPlugin (taskName, plugin, plugName, directory) {
    let mod = plugins[plugin]

    if (!mod) {
      // convert plugin path from relative back to absolute
      try {
        let pathToPlugin = plugin

        if (plugin[0] !== '/') {
          const localPlugins = cache.valOr('lp', Object.create(null))
          pathToPlugin = localPlugins[plugin] || path.join(directory, 'node_modules', plugin)
        }

        mod = require(pathToPlugin)
      } catch (err) {
        debug('failed to load plugin: %s', err && err.stack ? err.stack : err)
        throw new Error('Failed to load plugin: ' + plugin)
      }

      // expose module config
      pluginConfig[plugin] = mod.config || Object.create(null)

      // add plugins to loaded plugins
      plugins[plugin] = mod
    }

    // create plugin logger
    const logger = createLogger(`${taskName}:${plugName}}`)

    // load/create cache for plugin
    const pluginCache = cache.plugin(plugin)

    // create a new context for this plugin
    this.pluginCtx[plugin] = {
      args: [],
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
    const { log, debug, error } = createLogger(name)

    /**
     * Add timeout for safety.
     */
    const safeTimeout = setTimeout(() => {
      error('Timeout exceeded! Task was hung.')
      process.exit(-1)
    }, 6e4)

    /**
     * Figure out if bundling is needed & load plugins.
     */
    if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || isUndefined(this.readonly) || (this.d.stack.length > 0 && !this.loadedPlugins)) {
      this.loadedPlugins = true

      this.d.stack.forEach(([plugin, _, plugName]) => {
        if (!this.pluginCtx[plugin]) {
          this.loadPlugin(name, plugin, plugName, directory)
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
    let files = await glob(name, this.d.src, directory, useDoubleCache, recache)

    /**
     * Quit now if we want to build skipping.
     */
    if (process.env.SKIP_BUILD === 'true') {
      log('Updated cache')
      return
    }

    if (files.length > 0) {
      const dest = this.d.dest ? path.resolve(directory, getPath(this.d.dest)) : ''

      /**
       * Switch to bundling mode if need be.
       */
      if (this.needsBundling) {
        await this.startBundling(name, directory, files, dest, useDoubleCache)
        clearTimeout(safeTimeout)
        return
      }

      /**
       * Ensure dist directory exists.
       */
      if (!this.readonly || !this.d.dest) {
        await mkdirp(dest.replace(directory, ''), directory)
      }

      /**
       * Create streams.
       */
      files = _(files).map(file => {
        const outfile = this.doRename(path.basename(file), dest, file)

        return {
          file,
          outfile,
          stream: [
            createReadStream(file, outfile, directory)
          ]
        }
      })

      /**
       * Connect plugin streams with pipelines.
       */
      if (this.d.stack.length > 0) {
        files.map(file => {
          file.stream = file.stream.concat(this.buildStack(name))
          return file
        })
      }

      /**
       * Connect with destination.
       */
      files.map(file => {
        if (!this.readonly || !this.d.dest) {
          // strip out the actual body and write it
          file.stream.push(mapStream((data, next) => {
            if (typeof data !== 'object' || !data.hasOwnProperty('body')) {
              return next(new Error('A plugin has destroyed the stream by returning a non-object.'))
            }

            next(null, data.body)
          }))

          // add the writestream at the end
          let output

          if (!this.d.dest) {
            const { fd: tmp, name: tmppath } = tmpFileSync()
            output = fs.createWriteStream(null, {
              fd: tmp
            })

            file.promise = didFail => new Promise((resolve, reject) => {
              output.on('close', () => {
                if (!didFail()) {
                  const newStream =
                    fs.createReadStream(tmppath)
                      .pipe(fs.createWriteStream(file.file))

                  newStream.on('error', reject)
                  newStream.on('close', resolve)
                }
              })
            })
          } else {
            debug('Set output: %s', file.outfile)
            mkdirpSync(path.dirname(file.outfile).replace(directory, ''), directory)
            output = fs.createWriteStream(file.outfile)
          }

          file.stream.push(output)
        }

        // promisify the current pipeline
        return new Promise((resolve, reject) => {
          let resolved = false
          let didFail = false

          // connect all streams together to form pipeline
          file.stream = pump(file.stream, err => {
            didFail = !!err

            if (err) reject(simplifyError(err, new Error()))
            else if (!resolved && !file.promise) resolve()
          })

          if (file.promise) {
            file
              .promise(() => didFail)
              .then(() => {
                resolved = true
                resolve()
              }, reject)
          }
        }).then(async () => {
          // ensure global cache is present
          if (gstatCache === undefined) {
            gstatCache = cache.valOr('sc', Object.create(null))
          }

          // shorten task name based on hopp's internal convention
          const taskName = name.split(':').pop()

          // create local cache
          if (gstatCache[taskName] === undefined) {
            gstatCache[taskName] = Object.create(null)
          }

          const localCache = gstatCache[taskName]

          // update file stat
          localCache['./' + path.relative(directory, file.file)] = +fs.statSync(file.file).mtime
        })
      })

      // start & wait for all pipelines to end
      const start = Date.now()
      log('Starting task for %s files', files.length)
      await Promise.all(files.val())
      log('Task ended (took %s ms)', Date.now() - start)

      // clear the timeout
      clearTimeout(safeTimeout)
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
      d: this.d,
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
    this.d = json.d
    this.needsBundling = json.needsBundling
    this.needsRecaching = json.needsRecaching
    this.readonly = json.readonly

    return this
  }
}

/**
 * Extended prototype for plugins to be appended to.
 */
Hopp.fn = Object.create(null)
