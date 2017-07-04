/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import * as cache from '../cache'
import { deepEqual } from '../utils'
import { statSync, readFileSync } from 'fs'

export default file => {
  // if bad args die
  if (typeof file !== 'string') {
    throw new Error('Unknown arguments')
  }

  // get file stat
  const lmod = +statSync(file).mtime

  // try to load from cache
  const state = Object.create(null)
  ;[state.lmod, state.tasks] = cache.val('_') || []

  if (state.lmod === lmod) {
    return [true, Object.create(null), state.tasks]
  }

  // load via require
  const tasks = require(file)

  // figure out which tasks are bust
  state.tasks = state.tasks || {}
  const bustedTasks = {}

  // only try checking for single tasks
  for (let task in tasks) {
    if (state.tasks.hasOwnProperty(task)) {
      const json = tasks[task].toJSON()

      if (!(json instanceof Array) && !deepEqual(json, state.tasks[task])) {
        bustedTasks[task] = true
      }
    }
  }

  // cache exports
  cache.val(
    '_',

    /function|=>/.test(readFileSync(require.resolve(file), 'utf8'))

    // if any functions exist, we can't cache the file
      ? [
        0,
        null
      ]

      // otherwise, cache normally
      : [
        lmod,
        tasks
      ]
  )

  // return exports
  return [false, bustedTasks, tasks]
}
