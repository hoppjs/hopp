/**
 * @file src/tasks/tree.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import Hopp from './mgr'

/**
 * Transforms parts of the given JSON tree
 * into runnable tasks.
 * @param {Object} tree a tree of serialized tasks
 * @param {Array} tasks list of tasks to be transformed
 */
export default (tree, tasks) => {
  for (let task of tasks) {
    const json = tree[task]

    // only convert single tasks, parallel get
    // converted later
    if (!(json instanceof Array)) {
      tree[task] = (new Hopp()).fromJSON(json)
    }
  }
}
