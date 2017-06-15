/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

/**
 * Creates a Hopp-ish object that runs
 * subtasks in parallel.
 */
export default (name, tasks, taskTree) => ({
  /**
   * Starts all tasks concurrently.
   * 
   * @return {Promise} joins all task promises under .all()
   */
  start () {
    this.tasks = tasks

    // just async for now
    return Promise.all(tasks.map(
      task => taskTree[task].start(`${name}:${task}`)
    ))
  },

  /**
   * Converts tasks to JSON.
   * Just converts them into an array of
   * JSON objects.
   * 
   * @return {Array} 
   */
  toJSON () {
    return this.tasks
  }
})