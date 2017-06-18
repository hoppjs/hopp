/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import fs from 'fs'
import _ from '../_'
import path from 'path'
import pump from 'pump'
import glob from '../glob'
import mkdirp from '../mkdirp'
import getPath from '../get-path'
import * as cache from '../cache'
import mapStream from 'map-stream'
import { disableFSCache } from '../fs'
import createLogger from '../utils/log'
import createReadStream from './read-stream'

const watchlog = createLogger('hopp:watch').log

/**
 * Plugins storage.
 */
const plugins = {}
const pluginCtx = {}

/**
 * Loads a plugin, manages its env.
 */
const loadPlugin = (plugin, args) => {
  let mod = require(plugin)

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
    log: logger.debug,
    error: logger.error
  }

  // return loaded plugin
  return mod
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
  watch (name, directory) {
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
      }, () => this.start(name, directory, false)))
    })

    return new Promise(resolve => {
      process.on('SIGINT', () => {
        watchers.forEach(watcher => watcher.close())
        resolve()
      })
    })
  }

  /**
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  async start (name, directory, useDoubleCache = true) {
    const { log, debug } = createLogger(`hopp:${name}`)
    const start = Date.now()
    log('Starting task')

    /**
     * Get the modified files.
     */
    let files = await glob(this.d.src, directory, useDoubleCache)

    if (files.length > 0) {
      /**
       * Create streams.
       */
      files = _(files).map(file => ({
        file,
        stream: [
          createReadStream(file)
        ]
      }))

      if (this.d.stack.length > 0) {
        /**
         * Try to load plugins.
         */
        let stack = _(this.d.stack)

        if (!this.plugins) {
          this.plugins = {}

          stack.map(([plugin, args]) => {
            if (!plugins.hasOwnProperty(plugin)) {
              plugins[plugin] = loadPlugin(plugin, args)
            }

            return [plugin, args]
          })
        }

        /**
         * Create streams.
         */
        stack = stack.map(([plugin]) =>
          mapStream((data, next) => {
            plugins[plugin](
              pluginCtx[plugin],
              data
            )
              .then(newData => next(null, newData))
              .catch(err => next(err))
          })
        ).val()

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
      const dest = path.resolve(directory, getPath(this.d.dest))
      await mkdirp(dest.replace(directory, ''), directory)

      files.map(file => {
        // strip out the actual body and write it
        file.stream.push(mapStream((data, next) => next(null, data.body)))
        file.stream.push(fs.createWriteStream(dest + '/' + path.basename(file.file)))

        // connect all streams together to form pipeline
        file.stream = pump(file.stream)

        // promisify the current pipeline
        return new Promise((resolve, reject) => {
          file.stream.on('error', reject)
          file.stream.on('close', resolve)
        })
      })

      // launch, create aggregate promise of all pipelines
      files = files.val()
    } else {
      log('Task ended (took %s ms)', Date.now() - start)
      return
    }

    await Promise.all(files)
    log('Task ended (took %s ms)', Date.now() - start)
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON () {
    return {
      dest: this.d.dest,
      src: this.d.src,
      stack: this.d.stack
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

    return this
  }
}