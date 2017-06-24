/**
 * @file src/glob.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import path from 'path'
import match from 'minimatch'
import * as cache from '../cache'
import { readdir, stat } from './'

const { debug } = require('../utils/log')('hopp:glob')

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

  // allow overrides from the env
  recache = recache || process.env.RECACHE === 'true'

  /**
   * Recursive walk.
   */
  async function walk (relative, pttn, directory, recursive = false) {
    if (pttn.length === 0) {
      return
    }

    const curr = pttn.shift()
    let localResults = []

    debug('cwd = %s, relative = %s, curr: %s, dir = %s, recur = %s, recache = %s', cwd, relative, curr, directory, recursive, recache)

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
          if (recache || !statCache.hasOwnProperty(relative) || statCache[relative] !== +fstat.mtime) {
            statCache[relative] = +fstat.mtime
            localResults.push(filepath)
          }
        } else {
          localResults = localResults.concat(await walk(relative + path.sep + file, pttn, filepath, recursive || curr === '**'))
        }
      } else if (fstat.isDirectory() && recursive) {
        localResults = localResults.concat(await walk(relative + path.sep + file, [curr].concat(pttn), filepath, recursive))
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

    results = results.concat(await walk('.', pttn.split('/'), cwd))
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
