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
   * @param {Glob} sources
   * @return {Hopp} new hopp object
   */
  constructor (sources) {
    this.sources = sources
    this.callStack = []
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */
  dest (out) {
    this.output = out
    return this
  }

  /**
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  start () {
    // TODO: actually start the task
    debug('Starting task: %s -> %s', this.sources, this.output)

    return Promise.resolve(1)
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON () {
    return {
      output: this.output,
      sources: this.sources,
      callStack: this.callStack
    }
  }

  /**
   * Deserializes a JSON object into a manager.
   * @param {Object} json
   * @return {Hopp} task manager
   */
  fromJSON (json) {
    this.output = json.output
    this.sources = json.sources
    this.callStack = json.callStack

    return this
  }
}