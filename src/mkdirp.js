/**
 * @file src/mkdirp.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import path from 'path'
import { mkdir } from './fs'

const { debug } = require('./utils/log')('hopp')
const exists = {}

export default async (directory, cwd) => {
  // explode into separate
  directory = directory.split(path.sep)

  // walk
  for (let dir of directory) {
    if (dir && !exists[cwd + path.sep + dir]) {
      try {
        debug('mkdir %s', cwd + path.sep + dir)
        await mkdir(cwd + path.sep + dir)
      } catch (err) {
        if (String(err).indexOf('EEXIST') === -1) {
          throw err
        }
      }

      exists[cwd + path.sep + dir] = true
      cwd += path.sep + dir
    }
  }
}