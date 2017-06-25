/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import createWatch from './watch'
import createSteps from './steps'
import createLogger from '../utils/log'
import createParallel from './parallel'

let taskDefns
let bustedTasks

function fromArray (arr) {
  if (arr[0] === 'parallel') {
    return createParallel(arr[1])
  }

  if (arr[0] === 'steps') {
    return createSteps(arr[1])
  }

  return createWatch(arr[1])
}

export const defineTasks = (defns, busted) => {
  taskDefns = defns
  bustedTasks = busted

  createSteps.defineTasks(defns, busted)
  createParallel.defineTasks(defns, busted)
}

export const create = (tasks, projectDir, mode = 'start') => {
  let goal

  if (tasks.length === 1) {
    let name = tasks[0]
    goal = taskDefns[tasks[0]]

    if (goal instanceof Array) {
      goal = fromArray(goal)
    }

    goal = (async () => {
      try {
        await goal[mode](name, projectDir, !!bustedTasks[name])
      } catch (err) {
        createLogger(`hopp:${name}`).error(err && err.stack ? err.stack : err)
        throw ('Build failed.')
      }
    })()
  } else {
    goal = Promise.all(tasks.map(async name => {
      let task = taskDefns[name]

      if (task instanceof Array) {
        task = fromArray(task)
      }

      try {
        await task[mode](name, projectDir, !!bustedTasks[name])
      } catch (err) {
        createLogger(`hopp:${name}`).error(err.stack || err)
        throw ('Build failed.')
      }
    }))
  }

  return goal
}
