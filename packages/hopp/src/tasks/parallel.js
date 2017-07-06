/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import os from 'os'
import cluster from 'cluster'
import { createLogger } from '../utils'

const MAX_JOBS = os.cpus().length
const { debug } = createLogger('hopp')

let taskTree
let bustedTasks

/**
 * Run all tasks in parallel.
 */
function runParallel (jobs, tasks, name, directory) {
  return new Promise((resolve, reject) => {
    if (cluster.isMaster) {
      if (tasks.length < jobs) {
        debug('starting %s jobs, 1 task per job', tasks.length)

        for (let i = 0; i < tasks.length; i++) {
          cluster.fork({
            JOB_START: i,
            JOB_SIZE: 1
          })
        }
      } else {
        const tasksPerJob = Math.floor(tasks.length / jobs)
        debug('starting %s jobs, %s tasks per job', jobs, tasksPerJob)

        // start all but last job
        for (let i = 0; i < jobs; i++) {
          cluster.fork({
            JOB_START: i * tasksPerJob,
            JOB_SIZE: i === MAX_JOBS - 1 ? MAX_JOBS - (tasksPerJob * (i - 1)) : tasksPerJob
          })
        }
      }

      // wait for the end of all the jobs
      let ndone = 0

      cluster.on('exit', (id, code) => {
        ndone++

        // if any worker fails, reject the promise
        if (code !== 0) {
          return reject(new Error(`Job ${id} failed.`))
        }

        // once all workers successfully return, resolve promise
        if (ndone === Math.min(tasks.length, jobs)) {
          resolve()
        }
      })
    } else {
      const FIRST_JOB = parseInt(process.env.JOB_START, 10)
      const LAST_JOB = parseInt(process.env.JOB_START, 10) + parseInt(process.env.JOB_SIZE, 10)

      // grab slice of tasks that this worker should do
      const subtasks = tasks.slice(FIRST_JOB, LAST_JOB)

      // run in async
      runAsync(subtasks, name, directory)
        .then(() => process.exit(0))
        .catch(err => {
          console.error(err && err.stack ? err.stack : err)
          process.exit(-1)
        })
    }
  })
}

/**
 * Run all tasks in async.
 */
function runAsync (tasks, name, directory) {
  // just async for now
  debug('running %s tasks in async', tasks.length)
  return Promise.all(tasks.map(
    task => runTask(task, name, directory)
  ))
}

/**
 * Run individual task.
 */
function runTask (task, name, directory) {
  if (task.indexOf(':') !== -1) {
    throw new Error('You cannot use `:` in a task name. It is a restricted token.')
  }

  return taskTree[task].start(`${name}:${task}`, directory, !!bustedTasks[task])
}

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
    let jobs = parseInt(process.env.WEB_CONCURRENCY)

    // if jobs not specified, just stick to async
    if (isNaN(jobs)) return runAsync(tasks, name, directory)

    // disallow negatives
    if (jobs < 0) throw new Error('Negative number of jobs not supported.')

    // if zero, assume max
    if (jobs === 0) jobs = MAX_JOBS

    // run parallel
    return runParallel(jobs, tasks, name, directory)
  },

  /**
   * Watch all subtasks.
   */
  watch (name, directory) {
    return Promise.all(tasks.map(task => {
      if (task.indexOf(':') !== -1) {
        throw new Error('You cannot use `:` in a task name. It is a restricted token.')
      }

      return taskTree[task].watch(name + ':' + task, directory)
    }))
  },

  /**
   * Converts tasks to JSON.
   * Just converts them into an tasksay of
   * JSON objects.
   *
   * @return {tasksay}
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
