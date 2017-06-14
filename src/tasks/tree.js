/**
 * @file src/tasks/tree.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import Hopp from './mgr'
import createParallel from './parallel'

/**
 * Transforms parts of the given JSON tree
 * into runnable tasks.
 * @param {Object} tree a tree of serialized tasks
 * @param {Array} tasks list of tasks to be transformed
 */
export default (tree, tasks) => {
  for (let task of tasks) {
    const json = tree[task]

    // for arrays, convert all subtasks and
    // create a parallel task to manage them
    if (json instanceof Array) {
      tree[task] = createParallel(json.map(
        sub => (new Hopp()).fromJSON(sub)
      ))
    }
    
    // for single tasks, just convert
    else {
      tree[task] = (new Hopp()).fromJSON(json)
    }
  }
}