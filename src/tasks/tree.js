/**
 * @file src/tasks/tree.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import Hopp from './mgr'
import createParallel from './parallel'

export default (tree, tasks) => {
  for (let task of tasks) {
    const json = tree[task]

    if (json instanceof Array) {
      tree[task] = createParallel(json.map(subtree => {
        const h = new Hopp()
        h.fromJSON(subtree)
        return h
      }))
    } else {
      tree[task] = new Hopp()
      tree[task].fromJSON(json)
    }
  }
}