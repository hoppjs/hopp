/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

/**
 * Creates a Hopp-ish object that runs
 * subtasks in parallel.
 */
export default (tasks, taskTree) => ({
  /**
   * Starts all tasks concurrently.
   * 
   * @return {Promise} joins all task promises under .all()
   */
  start (name, directory) {
    // just async for now
    return Promise.all(tasks.map(
      task => taskTree[task].start(`${name}:${task}`, directory)
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
    return ['parallel', tasks]
  }
})