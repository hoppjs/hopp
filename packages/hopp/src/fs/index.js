/**
 * @file src/fs.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import fs from 'fs'
import tmp from 'tmp'
import path from 'path'
import { fn as wrap } from '../utils'

const { debug } = require('../utils/log')('hopp:fs')

let useCache = true

/**
 * Similar to bluebird's Promise.promisify.
 * @param {Function} fn the async-callback function to transform
 * @return {Function} a new promise-based function
 */
function promisify (fn, name) {
  /**
   * Create function call wrapper.
   */
  const fnCall = function () {
    const args = [... arguments]

    debug('%s(%j)', name, args)
    return new Promise((resolve, reject) => {
      fn.apply(this, args.concat([function (err) {
        const fnargs = [... arguments]

        if (err) reject(err)
        else resolve.apply(null, fnargs.slice(1))
      }]))
    })
  }

  /**
   * Create deterministic wrapper.
   */
  const cacheCall = wrap(fnCall)

  /**
   * Return conditional cache.
   */
  return function () {
    const args = [... arguments]

    if (useCache) return cacheCall.apply(this, args)
    return fnCall.apply(this, args)
  }
}

/**
 * Allow disabling of cache.
 */
export const disableFSCache = () => {
  debug('Disabling fs cache')
  useCache = false
}

/**
 * Transform only needed methods (instead of using mz
 * or doing a promisifyAll).
 */
export const exists = async dir => {
  try {
    await stat(dir)
    return true
  } catch (err) {
    if (String(err).indexOf('ENOENT') === -1) {
      throw err
    }

    return false
  }
}
export const stat = promisify(fs.stat, 'stat')
export const mkdir = promisify(fs.mkdir, 'mkdir')
export const openFile = promisify(fs.open, 'open')
export const readdir = promisify(fs.readdir, 'readdir')
export const readFile = promisify(fs.readFile, 'readFile')
export const writeFile = promisify(fs.writeFile, 'writeFile')

/**
 * Create temporary file.
 */
export const tmpFile = () => new Promise((resolve, reject) => {
  tmp.file((err, fdpath, fd) => {
    if (err) reject(err)
    else resolve([fd, fdpath])
  })
})

/**
 * Create temporary file (sync).
 */
export const tmpFileSync = () => tmp.fileSync()

/**
 * mkdir -p
 */
export const mkdirp = wrap(async (directory, cwd) => {
  // explode into separate
  directory = directory.split(path.sep)

  // walk
  for (let dir of directory) {
    if (dir) {
      try {
        await mkdir(cwd + path.sep + dir)
      } catch (err) {
        if (String(err).indexOf('EEXIST') === -1) {
          throw err
        }
      }
    }

    cwd += path.sep + dir
  }
})

/**
 * mkdir -p (sync)
 */
export const mkdirpSync = (directory, cwd) => {
  // explode into separate
  directory = directory.split(path.sep)

  // walk
  for (let dir of directory) {
    if (dir) {
      try {
        debug('mkdirp(%s)', cwd + path.sep + dir)
        fs.mkdirSync(cwd + path.sep + dir)
      } catch (err) {
        if (String(err).indexOf('EEXIST') === -1) {
          throw err
        }
      }
    }

    cwd += path.sep + dir
  }
}
