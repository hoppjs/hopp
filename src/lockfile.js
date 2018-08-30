/**
 * @file src/lockfile.js
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { projectDir } from './args'
const lockpath = resolve(projectDir, 'hopp.lock')

const touched = {}
function cache(name, obj) {
  return new Proxy(obj, {
    get(obj, prop) {
      touched[name] = touched[name] || []
      touched[name].push(prop)
      return obj[prop]
    },
  })
}

function pick(obj, keys) {
  const r = {}
  for (const k of keys) {
    r[k] = obj[k]
  }
  return r
}

export const Keys = {
  statCache: 'a',
  readdirCache: 'b',
  lastModified: 'c',
}
const AVAILABLE_KEYS = Object.keys(Keys)

let lockfile

export function get(k) {
  if (!lockfile[k]) {
    lockfile[k] = {}
  }
  return lockfile[k]
}

export function set(k, v) {
  lockfile[k] = v
}

export function load() {
  try {
    lockfile = JSON.parse(readFileSync(lockpath, 'utf8'))
  } catch (err) {
    const serr = String(err)

    if (
      serr.indexOf('no such file or directory') !== -1 ||
      serr.indexOf('SyntaxError: Unexpected token') !== -1
    ) {
      lockfile = {}
    } else {
      throw err
    }
  }

  for (const k of AVAILABLE_KEYS) {
    lockfile[k] = cache(k, lockfile[k] || {})
  }
}

process.on('beforeExit', () => {
  try {
    const lock = {}
    for (const k of AVAILABLE_KEYS) {
      lock[k] = pick(lockfile[k], touched[k])
    }
    writeFileSync(lockpath, JSON.stringify(lock, null, 2))
  } catch (_) {}
})
