/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import createWatch from './watch'
import createLogger from '../utils/log'
import createParallel from './parallel'

let taskDefns

function fromArray(arr, taskDefns) {
  if (arr[0] === 'parallel') {
    return createParallel(arr[1], taskDefns)
  }
  
  return createWatch(arr[1])
}

export const defineTasks = defns => {
  taskDefns = defns
  createParallel.defineTasks(defns)
}

export const create = (tasks, projectDir, mode = 'start') => {
  let goal

  if (tasks.length === 1) {
    let name = tasks[0]
    goal = taskDefns[tasks[0]]
    
    if (goal instanceof Array) {
      goal = fromArray(goal, taskDefns)
    }

    goal = (async () => {
      try {
        await goal[mode](name, projectDir)
      } catch (err) {
        createLogger(`hopp:${name}`).error(err.stack || err)
        throw ('Build failed.')
      }
    })()
  } else {
    goal = Promise.all(tasks.map(async name => {
      let task = taskDefns[name]

      if (task instanceof Array) {
        task = fromArray(task, taskDefns)
      }

      try {
        await task[mode](name, projectDir)
      } catch (err) {
        createLogger(`hopp:${name}`).error(err.stack || err)
        throw ('Build failed.')
      }
    }))
  }

  return goal
}