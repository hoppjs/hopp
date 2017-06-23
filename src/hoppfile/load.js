/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import { stat } from '../fs'
import * as cache from '../cache'
import { deepEqual } from '../utils'

export default async file => {
  // if bad args die
  if ( typeof file !== 'string' ) {
    throw new Error('Unknown arguments')
  }

  // get file stat
  const lmod = +(await stat(file)).mtime

  // try to load from cache
  const state = {}
  ;[state.lmod, state.tasks] = cache.val('_') || []

  if (state.lmod === lmod) {
    return [true, {}, state.tasks]
  }

  // load via require
  const tasks = require(file)

  // figure out which tasks are bust
  state.tasks = state.tasks || {}
  const bustedTasks = {}

  // only try checking for single tasks
  for (let task in tasks) {
    if (tasks.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
      const json = tasks[task].toJSON()

      if (!(json instanceof Array) && !deepEqual(json, state.tasks[task])) {
        bustedTasks[task] = true
      }
    }
  }

  // cache exports
  cache.val('_', [
    lmod,
    tasks
  ])

  // return exports
  return [false, bustedTasks, tasks]
}
