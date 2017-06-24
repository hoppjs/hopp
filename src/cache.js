/**
 * @file src/cache/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import {
  stat,
  mkdir,
  exists,
  readFile,
  writeFile,
} from './fs'
import path from 'path'
import semver from 'semver'

const { version } = require('../package.json')
const { debug, log } = require('./utils/log')('hopp')
let lock

/**
 * Define what an empty cache looks like.
 */
const createCache = () => ((lock = {
  v: version,
  p: {}
}))

/**
 * Loads a cache from the project.
 * @param {String} directory project directory
 * @return {Object} the loaded cache
 */
export const load = async directory => {
  // send back internal cache if reloading
  if (lock) return lock

  // verify directory
  if (typeof directory !== 'string' || !await exists(directory)) {
    throw new Error('Invalid directory given: ' + directory)
  }

  // set cache file
  const lockfile = `${directory}/hopp.lock`

  // bring cache into existence
  if (process.env.RECACHE === 'true' || !await exists(lockfile)) {
    return (lock = createCache())
  }

  // load lock file
  debug('Loading cache')
  try {
    lock = JSON.parse(await readFile(lockfile, 'utf8'))
    debug('loaded cache at v%s', lock.v)
  } catch (_) {
    log('Corrupted cache; ejecting.')
    return (lock = createCache())
  }

  // handle version change
  if (lock.v !== version) {
    log('Found stale cache; updating.')
    lock = await updateCache(lock)
  }

  return lock
}

/**
 * Adds/replaces a value in the cache.
 * @param {String} key
 * @param {Any} value anything stringifiable
 * @returns {Any?} value from cache
 */
export const val = (key, value) => {
  if (value === undefined) {
    return lock[key]
  }
  
  lock[key] = value
}

/**
 * Load/create cache for a plugin.
 * @param {}
 */
export const plugin = pluginName => {
  const plugins = val('p')

  if (!plugins.hasOwnProperty(pluginName)) {
    plugins[pluginName] = {}
  }

  return plugins[pluginName]
}

/**
 * Get/set a sourcemap.
 * @param {String} taskName name of the task
 * @param {Object} sm sourcemap to save for the task
 * @returns {Object} sourcemap from cache
 */
export const sourcemap = (taskName, sm) => {
  let sourcemap = val('sm')

  if (!sourcemap) {
    val('sm', sourcemap = {})
  }

  if (sm) {
    sourcemap[taskName] = sm
  } else {
    sourcemap[taskName] = sourcemap[taskName] || {}
  }

  return sourcemap
}

/**
 * Saves the lockfile again.
 * @param {*} directory 
 */
export const save = async directory => {
  debug('Saving cache')
  await writeFile(directory + '/hopp.lock', JSON.stringify(lock))
}

/**
 * Cache updater.
 */
async function updateCache(lock) {
  // handle newer lock files
  if (semver.gt(lock.v, version)) {
    throw new Error('Sorry, this project was built with a newer version of hopp. Please upgrade hopp by running: npm i -g hopp')
  }

  let compat

  // load converter  
  try {
    compat = require('./compat/' + lock.v)
  } catch (err) {
    debug('failed to update hoppfile: %s', err && err.stack ? err.stack : err)

    // error out for unsupported versions
    throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v)
  }

  // do convert
  return await compat(lock)
}