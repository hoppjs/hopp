/**
 * @file src/utils/index.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import _ from './_'
import fn from './fn'
import deepEqual from './deep-equal'
import simplifyError from './error'

const createLogger = require('./log')

export {
  _,
  fn,
  deepEqual,
  createLogger,
  simplifyError
}
