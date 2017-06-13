/**
 * @file index.js
 * @license MIT
 * @copyright 2017 Karim Alibhai
 */

import fs from 'fs'
import path from 'path'
import util from 'util'
import Module from 'module'
import * as cache from './cache'
import createHopp from './hopp'
import fromTree from './tasks/tree'
import * as hoppfile from './hoppfile'
import createParallel from './tasks/parallel'

const { log, debug, error } = require('./utils/log')('hopp')

/**
 * Parse args
 */
const argv = require('minimist')(process.argv.slice(2))

/**
 * Print help.
 */
function help() {
  console.log('usage: hopp [OPTIONS] [TASKS]')
  console.log('')
  console.log('  -d, --directory [dir]\tpath to project directory')
  console.log('  -v, --verbose\tenable debug messages')
  console.log('  -V, --version\tget version info')
  console.log('  -h, --help\tdisplay this message')

  process.exit(1)
}

if (argv.V || argv.version) {
  console.log(require('../package.json').version)
  process.exit(0)
}

if (argv.h || argv.help) {
  help()
}

/**
 * Set tasks.
 */
const tasks = argv._.length === 0 ? ['default'] : argv._

;(async () => {
  /**
   * Pass verbosity through to the env.
   */
  process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !! (argv.v || argv.verbose)
  debug('Setting HOPP_DEBUG = %j', process.env.HOPP_DEBUG)

  /**
   * If project directory not specified, do lookup for the
   * hoppfile.js
   */
  const projectDir = (directory => {
    // absolute paths don't need correcting
    if (directory[0] === '/') {
      return directory
    }

    // sort-of relatives should be made into relative
    if (directory[0] !== '.') {
      directory = './' + directory
    }

    // map to current directory
    return path.resolve(process.cwd(), directory)
  })(argv.d || argv.directory || await hoppfile.find(path.dirname(__dirname)))
  const file = projectDir + '/hoppfile.js'
  debug('Using hoppfile.js @ %s', file)

  /**
   * Load cache.
   */
  const lock = await cache.load(projectDir)

  /**
   * Create hopp instance.
   */
  const hopp = await createHopp(projectDir)
  debug('Created proxy object: %s', util.inspect(hopp, {
    colors: true,
    depth: Infinity
  }))

  /**
   * Cache it to make require work.
   */
  const _resolve = Module._resolveFilename
  Module._resolveFilename = (what, parent) => {
    return what === 'hopp' ? what : _resolve(what, parent)
  }

  require.cache.hopp = {
    id: 'hopp',
    filename: 'hopp',
    loaded: true,
    exports: hopp
  }

  /**
   * Load tasks from file.
   */
  let [fromCache, taskDefns] = await hoppfile.load(file)

  /**
   * Parse from cache.
   */
  if (fromCache) {
    fromTree(taskDefns, tasks)
  }

  /**
   * Run tasks.
   */
  let goal

  if (tasks.length === 1) {
    goal = taskDefns[tasks[0]]
    
    if (goal instanceof Array) {
      goal = createParallel(goal)
    }
    
    goal.start()
  } else {
    goal = Promise.all(tasks.map(task => {
      task = taskDefns[task]

      if (task instanceof Array) {
        task = createParallel(task)
      }

      return task.start()
    }))
  }

  /**
   * Wait for task completion.
   */
  await goal

  /**
   * Store cache for later.
   */
  await cache.save(projectDir)
})().catch(err => {
  error(err.stack || err)
  process.exit(-1)
})
