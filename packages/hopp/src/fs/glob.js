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

let gstatCache
const tempCache = {}

async function glob (task, pattern, cwd, useDoubleCache = false, recache = false) {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern]
  }

  // ensure global cache is present
  if (gstatCache === undefined) {
    gstatCache = cache.val('sc') || {}
    cache.val('sc', gstatCache)
  }

  // create local cache
  if (gstatCache[task] === undefined) {
    gstatCache[task] = {}
  }

  // set local cache
  let statCache = gstatCache[task]

  // allow overrides from the env
  recache = recache || process.env.RECACHE === 'true'

  /**
   * Recursive walk.
   */
  async function walk (relative, pttn, directory, recursive = false) {
    debug('walk(relative = %s, pttn = %s, directory = %s, recursive = %s) in %s [recache:%s, curr:%s]', relative, pttn, directory, recursive, cwd, recache, pttn[0])

    if (pttn.length === 0) {
      return []
    }

    pttn = pttn.slice()

    const curr = pttn.shift()
    let localResults = []

    for (let file of (await readdir(directory))) {
      // fix file path
      const filepath = directory + path.sep + file
      const relativepath = relative + path.sep + file

      // get stat from temp cache (for non-watch tasks) or stat()
      let fstat

      if (useDoubleCache) {
        fstat = tempCache[filepath] = tempCache[filepath] || await stat(filepath)
      } else {
        fstat = await stat(filepath)
      }

      debug('match(%s,%s) => %s [%s]', filepath, curr, match(file, curr), fstat.isFile() ? 'file' : 'dir')

      // has been modified
      debug('stat(%s) :: %s', +fstat.mtime, statCache[relativepath])

      if (match(file, curr)) {
        if (fstat.isFile()) {
          if (recache || !statCache.hasOwnProperty(relativepath) || statCache[relativepath] !== +fstat.mtime) {
            statCache[relativepath] = +fstat.mtime
            localResults.push(filepath)

            debug('add: %s', filepath)
          }
        } else {
          localResults = localResults.concat(await walk(relativepath, pttn, filepath, recursive || curr === '**'))
        }
      } else if (fstat.isDirectory() && recursive) {
        localResults = localResults.concat(await walk(relativepath, [curr].concat(pttn), filepath, recursive))
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

    const nm = glob.nonMagic(pttn)
    debug('nm = %j', nm)

    if (!nm) {
      results = results.concat(await walk(
        '.',
        pttn.split('/'),
        cwd
      ))
    } else {
      results = results.concat(await walk(
        nm,
        pttn.replace(nm, '').substr(1).split('/'),
        path.resolve(cwd, nm)
      ))
    }
  }

  /**
   * Return final results object.
   */
  return results
}

/**
 * Get non-magical start of glob.
 * @param {String} pattern glob pattern
 * @returns {String} definitive path
 */
glob.nonMagic = function (pattern) {
  let newpath = ''

  for (let sub of pattern.split('/')) {
    if (sub) {
      if (sub.indexOf('*') !== -1) {
        break
      }

      newpath += path.sep + sub
    }
  }

  return newpath.substr(1)
}

export default glob
