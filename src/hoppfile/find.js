/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import path from 'path'
import { readdir } from '../fs'

const { debug } = require('../utils/log')('hopp')

/**
 * Looks for hoppfile.js in {directory} and its parents.
 * @param {String} directory
 * @returns {String} the directory in which the file exists
 * @throws {Error} if file was not found
 */
export default async function find (directory) {
  const files = (await readdir(directory)).filter(f => f === 'hoppfile.js')

  debug('found %s hoppfiles in %s', files.length, directory)

  if (files.length === 0 && directory === '/') {
    throw new Error('Failed to find hoppfile.js')
  }

  return files.length === 1 ? directory : find(path.dirname(directory))
}
