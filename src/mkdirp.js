/**
 * @file src/mkdirp.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import path from 'path'
import { mkdir } from './fs'

const { debug } = require('./utils/log')('hopp')

export default async (directory, cwd) => {
  // explode into separate
  directory = directory.split(path.sep)

  // walk
  for (let dir of directory) {
    if (dir) {
      try {
        debug('mkdir %s', cwd + path.sep + dir)
        await mkdir(cwd + path.sep + dir)
      } catch (_) {}

      cwd += path.sep + dir
    }
  }
}