/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const { debug } = require('../utils/log')('hopp')

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
    this.src = src
    this.stack = []
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */
  dest (out) {
    this.dest = out
    return this
  }

  /**
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  start () {
    // TODO: actually start the task
    debug('Starting task: %s -> %s', this.src, this.dest)

    return Promise.resolve(1)
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON () {
    return {
      dest: this.dest,
      src: this.src,
      stack: this.stack
    }
  }

  /**
   * Deserializes a JSON object into a manager.
   * @param {Object} json
   * @return {Hopp} task manager
   */
  fromJSON (json) {
    this.dest = json.dest
    this.src = json.src
    this.stack = json.stack

    return this
  }
}