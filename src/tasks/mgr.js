/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

/**
 * Hopp class to manage tasks.
 */
export default class Hopp {
  constructor ( sources ) {
    this.callStack = []
  }

  dest (out) {
    this.output = out
    return this
  }

  start () {
    // TODO: actually start the task

    return Promise.resolve(1)
  }

  toJSON () {
    return {
      callStack: this.callStack
    }
  }

  fromJSON (json) {
    this.callStack = json.callStack
  }
}