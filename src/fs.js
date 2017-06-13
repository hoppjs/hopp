/**
 * @file src/fs.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import fs from 'fs'

function promisify(fn) {
  return function () {
    const args = [].slice.call(arguments)
    return new Promise((resolve, reject) => {
      fn.apply(this, args.concat([function (err) {
        if (err) reject(err)
        else resolve.apply(null, [].slice.call(arguments, 1))
      }]))
    })
  }
}

export const exists = dir => new Promise(res => fs.exists(dir, res))
export const stat = promisify(fs.stat)
export const mkdir = promisify(fs.mkdir)
export const readdir = promisify(fs.readdir)
export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)