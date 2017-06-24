/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

let taskTree
let bustedTasks

/**
 * Creates a Hopp-ish object that runs
 * subtasks in parallel.
 */
const parallel = tasks => ({
  /**
   * Starts all tasks concurrently.
   *
   * @return {Promise} joins all task promises under .all()
   */
  start (name, directory) {
    // just async for now
    return Promise.all(tasks.map(
      task => taskTree[task].start(`${name}:${task}`, directory, !!bustedTasks[task])
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

parallel.defineTasks = (defns, busted) => {
  taskTree = defns
  bustedTasks = busted
}

export default parallel
