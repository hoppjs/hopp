/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import fs from 'fs'
import _ from '../_'
import path from 'path'
import glob from '../glob'
import mkdirp from '../mkdirp'
import getPath from '../get-path'
import * as cache from '../cache'
import modified from '../modified'
import createLogger from '../utils/log'

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
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  async start (name, directory) {
    const { log, debug } = createLogger(`hopp:${name}`)
    const start = Date.now()
    log('Starting task')

    /**
     * Get the files.
     */
    const files = _(await modified(await glob(this.d.src, directory)))

        /**
         * Create streams.
         */
        .map(file => ({
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
      file.stream.pipe(
        fs.createWriteStream(dest + '/' + path.basename(file.file))
      )
    })

    // launch
    files.val()

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