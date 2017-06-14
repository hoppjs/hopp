/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

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

    return Promise.resolve(1)
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON () {
    return {
      callStack: this.callStack
    }
  }

  /**
   * Deserializes a JSON object into a manager.
   * @param {Object} json
   * @return {Hopp} task manager
   */
  fromJSON (json) {
    this.callStack = json.callStack
    return this
  }
}