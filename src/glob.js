/**
 * @file src/glob.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import glob from 'glob'
import * as cache from './cache'

let globCache

export default (pattern, cwd) => new Promise((resolve, reject) => {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern]
  }

  let files = []
  let gc = cache.val('gc') || {}

  // glob eval all
  Promise.all(pattern.map(pttn => new Promise(res => {
    const opts = globCache !== undefined ? globCache : { cwd, cache: gc }

    globCache = new glob.Glob(pttn, opts, (err, results) => {
      if (err) reject(err)
      else {
        files = files.concat(results)
        res()
      }
    })

    gc = globCache.cache
  }))).then(() => {
    cache.val('gc', gc)
    resolve(files)
  })
})