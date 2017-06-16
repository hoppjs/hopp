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

  // glob eval all
  Promise.all(pattern.map(pttn => new Promise(res => {
    globCache = new glob.Glob(pttn, globCache !== undefined ? globCache : { cwd }, (err, results) => {
      if (err) reject(err)
      else {
        files = files.concat(results)
        res()
      }
    })
  }))).then(() => {
    resolve(files)
  })
})