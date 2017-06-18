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
import { disableFSCache } from '../fs'
import createLogger from '../utils/log'

const watchlog = createLogger('hopp:watch').log

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
        stream: fs.createReadStream(file, { encoding: 'utf8' })
      }))

      // TODO: pipe to plugin streams

      /**
       * Connect with destination.
       */
      const dest = path.resolve(directory, getPath(this.d.dest))
      await mkdirp(dest.replace(directory, ''), directory)

      files.map(file => {
        pump(file.stream, fs.createWriteStream(dest + '/' + path.basename(file.file)))
      })

      // launch
      files.val()
    }

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