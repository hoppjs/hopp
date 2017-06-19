/**
 * @file src/utils/deep-equal.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import { deepEqual } from 'assert'

export default (a, b) => {
  try {
    deepEqual(a, b)
    return true
  } catch (_) {
    return false
  }
}