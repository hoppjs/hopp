/**
 * @file src/utils/index.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import _ from './_'
import fn from './fn'
import deepEqual from './deep-equal'

const createLogger = require('./log')

export {
  _,
  fn,
  deepEqual,
  createLogger
}