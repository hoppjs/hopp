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

const { debug, log } = require('./utils/log')('hopp')
let lock

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
  if (!await exists(lockfile)) {
    return (lock = {p:{}})
  }

  // load lock file
  debug('Loading cache')
  try {
    return (lock = JSON.parse(await readFile(lockfile, 'utf8')))
  } catch (_) {
    log('Corrupted cache; ejecting.')
    return (lock = {p:{}})
  }
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
