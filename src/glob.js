/**
 * @file src/glob.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import path from 'path'
import match from 'minimatch'
import * as cache from './cache'
import getPath from './get-path'
import { readdir, stat } from './fs'

const { debug } = require('./utils/log')('hopp:glob')

let statCache
const tempCache = {}

export default async (pattern, cwd, useDoubleCache = false, recache = false) => {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern]
  }

  // get cache
  if (statCache === undefined) {
    statCache = cache.val('sc') || {}
  }

  /**
   * Recursive walk.
   */
  async function walk(pttn, directory, recursive = false) {
    if (pttn.length === 0) {
      return
    }

    const curr = pttn.shift()
    let localResults = []

    debug('curr: %s, dir = %s, recur = %s, recache = %s', curr, directory, recursive, recache)

    for (let file of (await readdir(directory))) {
      // fix file path
      const filepath = directory + path.sep + file

      // get stat from temp cache (for non-watch tasks) or stat()
      let fstat

      if (useDoubleCache) {
        fstat = tempCache[filepath] = tempCache[filepath] || await stat(filepath)
      } else {
        fstat = await stat(filepath)
      }

      // has been modified
      if (match(file, curr)) {
        if (fstat.isFile()) {
          if (recache || !statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime) {
            statCache[filepath] = +fstat.mtime
            localResults.push(filepath)
          }
        } else {
          localResults = localResults.concat(await walk(pttn, filepath, recursive || curr === '**'))
        }
      } else if (fstat.isDirectory() && recursive) {
        localResults = localResults.concat(await walk([curr].concat(pttn), filepath, recursive))
      }
    }

    return localResults
  }

  /**
   * Run all patterns against directory.
   */
  let results = []
  for (let pttn of pattern) {
    if (pttn[0] === '/') {
      throw new Error('Not sure what to do with the / in your glob.')
    }

    results = results.concat(await walk(pttn.split('/'), cwd))
  }

  /**
   * Update cache.
   */
  cache.val('sc', statCache)

  /**
   * Return final results object.
   */
  return results
}