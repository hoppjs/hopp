/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import createWatch from './watch'
import createSteps from './steps'
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
  /**
   * If single task, don't bother wrapping with .all().
   */
  if (tasks.length === 1) {
    let name = tasks[0]
    let goal = taskDefns[tasks[0]]

    if (goal instanceof Array) {
      goal = fromArray(goal)
    }

    if (!goal) {
      throw new Error(`${name}: no such task.`)
    }

    if (!(mode in goal)) {
      throw new Error(`Cannot run task ${name} in ${mode} mode!`)
    }

    return goal[mode](name, projectDir, !!bustedTasks[name])
  }

  /**
   * Otherwise wrap all.
   */
  return Promise.all(tasks.map(async name => {
    let task = taskDefns[name]

    if (task instanceof Array) {
      task = fromArray(task)
    }

    if (!task) {
      throw new Error(`${name}: no such task.`)
    }

    if (!(mode in task)) {
      throw new Error(`Cannot run task ${name} in ${mode} mode!`)
    }

    return task[mode](name, projectDir, !!bustedTasks[name])
  }))
}
