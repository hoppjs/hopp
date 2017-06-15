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
import createLogger from './utils/log'
import createParallel from './tasks/parallel'

const { log, debug, error } = createLogger('hopp')

/**
 * Parse args
 */
const argv = (args => {
  const o = {
    _: []
  }

  for (let i = 2; i < args.length; i += 1) {
    let a = args[i]

    if (a === '-h' || a === '--help') o.help = true
    else if (a === '-V' || a === '--version') o.version = true
    else if (a === '-v' || a === '--verbose') o.verbose = true
    else if (a === '-d' || a === '--directory') o.directory = args[++i]
    else if (a[0] !== '-') o._.push(a)
  }

  return o
})(process.argv)

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

if (argv.version) {
  console.log(require('../package.json').version)
  process.exit(0)
}

/**
 * Currently the only way for help to be called.
 * Later, it should also happen on invalid args but we
 * don't have invalid arguments yet.
 * 
 * Invalid arguments is a flag misuse - never a missing
 * task. That error should be more minimal and separate.
 */
if (argv.help) {
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
  process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !! argv.verbose
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
  })(argv.directory || await hoppfile.find(path.dirname(__dirname)))

  /**
   * Set hoppfile location relative to the project.
   * 
   * This will cause errors later if the directory was supplied
   * manually but contains no hoppfile. We don't want to do a magic
   * lookup for the user because they overrode the magic with the
   * manual flag.
   */
  const file = projectDir + '/hoppfile.js'
  debug('Using hoppfile.js @ %s', file)

  /**
   * Load cache.
   */
  const lock = await cache.load(projectDir)

  /**
   * Create hopp instance creator.
   */
  const hopp = await createHopp(projectDir)

  /**
   * Cache the hopp handler to make `require()` work
   * in the hoppfile.
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
  const [fromCache, taskDefns] = await hoppfile.load(file)

  /**
   * Parse from cache.
   */
  if (fromCache) {
    // create copy of tasks, we don't want to modify
    // the actual goal list
    const fullList = [].slice.call(tasks)

    // loop until we walk the whole tree
    while (true) {
      let length = fullList.length

      // add task dependencies to list
      tasks.forEach(task => {
        if (taskDefns[task] instanceof Array) {
          fullList.push(task)
        }
      })

      // once length is unchanging, we've hit the bottom
      // of the tree
      if (length === fullList.length) {
        break
      }
    }

    // parse all tasks and their dependencies
    fromTree(taskDefns, fullList)
  }

  /**
   * Run tasks.
   */
  let goal

  if (tasks.length === 1) {
    let name = tasks[0]
    goal = taskDefns[tasks[0]]
    
    if (goal instanceof Array) {
      goal = createParallel(name, goal, taskDefns)
    }

    goal = (async () => {
      try {
        await goal.start(name)
      } catch (err) {
        createLogger(`hopp:${name}`).error(err.stack || err)
        throw ('Build failed.')
      }
    })()
  } else {
    goal = Promise.all(tasks.map(async name => {
      let task = taskDefns[name]

      if (task instanceof Array) {
        task = createParallel(name, task, taskDefns)
      }

      try {
        await task.start(name)
      } catch (err) {
        createLogger(`hopp:${name}`).error(err.stack || err)
        throw ('Build failed.')
      }
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
