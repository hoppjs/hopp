/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

export default tasks => ({
  start () {
    this.tasks = tasks

    // just async for now
    tasks.forEach(task => task.start())
  },

  toJSON () {
    return this.tasks
  }
})