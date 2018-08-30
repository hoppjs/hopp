/**
 * @file src/fs.js
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import * as fs from 'fs'
import { ok as assert } from 'assert'

import * as lf from './lockfile'

const readFileCache = {}

// because babel transpiles the imports wrong
const fsStat = fs.stat
const fsStatSync = fs.statSync
const fsReadFile = fs.readFile
const fsReadFileSync = fs.readFileSync
const fsReaddir = fs.readdir

export function readFileSync(filepath, encoding = 'buffer') {
  assert(typeof filepath === 'string', 'Invalid or missing filepath')
  assert(typeof encoding === 'string', 'Invalid or missing encoding')

  if (!readFileCache[filepath]) {
    readFileCache[filepath] = {}
  } else if (readFileCache[filepath].error) {
    throw readFileCache[filepath].error
  } else if (readFileCache[filepath][encoding]) {
    return readFileCache[filepath][encoding]
  }

  try {
    const buffer = readFileCache[filepath].buffer = readFileCache[filepath].buffer || fsReadFileSync(filepath)
    const content = readFileCache[filepath][encoding] = buffer.toString(encoding)
    return content
  } catch (err) {
    readFileCache[filepath].error = err
    throw err
  }
}

export function readFile(filepath, encoding, cb) {
  if (typeof encoding === 'function') {
    return readFile(filepath, null, encoding)
  }
  encoding = encoding || 'buffer'

  assert(typeof filepath === 'string', 'Invalid or missing filepath')
  assert(typeof encoding === 'string', 'Invalid or missing encoding')
  assert(typeof cb === 'function', 'Invalid or missing callback')

  if (!readFileCache[filepath]) {
    readFileCache[filepath] = {}
  } else if (readFileCache[filepath].error) {
    throw readFileCache[filepath].error
  } else if (readFileCache[filepath][encoding]) {
    cb(readFileCache[filepath][encoding])
    return
  } else if (readFileCache[filepath].buffer) {
    cb(readFileCache[filepath].buffer.toString(encoding))
    return
  }

  fsReadFile(filepath, (err, buffer) => {
    if (err === null) {
      readFileCache[filepath].buffer = buffer
      const content = readFileCache[filepath][encoding] = buffer.toString(encoding)
      cb(null, content)
    } else {
      readFileCache[filepath].error = err
      cb(err)
    }
  })
}

export function readFileAsync(filepath, encoding) {
  return new Promise((resolve, reject) => readFile(filepath, encoding, (err, content) => {
    if (err) reject(err)
    else resolve(content)
  }))
}

export function statSync(filepath) {
  const statCache = lf.get(lf.Keys.statCache)
  
  const val = statCache[filepath]
  if (val) {
    return val
  }

  try {
    return (statCache[filepath] = { result: fsStatSync(filepath) }).result
  } catch (err) {
    statCache[filepath] = { error: err }
    throw err
  }
}

export function stat(filepath) {
  const statCache = lf.get(lf.Keys.statCache)
  
  const val = statCache[filepath]
  if (val) {
    return val
  }

  fsStat(filepath, (err, stat) => {
    statCache[filepath] = {
      error: err,
      result: stat,
    }
    cb(err, stat)
  })
}

export function statAsync(filepath) {
  return new Promise((resolve, reject) => fsStat(filepath, (err, content) => {
    if (err) reject(err)
    else resolve(content)
  }))
}

const readdirErrCache = {}
export function readdirAsync(dir) {
  // TODO: bust cache on the folder if the folder's mtime
  // changes

  if (dir[0] !== '/') {
    throw new Error(`Relative paths not allowed: ${dir}`)
  }

  if (readdirErrCache[dir]) {
    return readdirErrCache[dir]
  }

  const readdirCache = lf.get(lf.Keys.readdirCache)
  if (readdirCache[dir]) {
    return Promise.resolve(readdirCache[dir])
  }

  return new Promise((resolve, reject) => {
    fsReaddir(dir, (error, result) => {
      if (error) {
        readdirErrCache[dir] = error
        reject(error)
      } else {
        readdirCache[dir] = result
        resolve(result)
      }
    })
  })
}
