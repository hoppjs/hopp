/**
 * @file src/utils/deep-equal.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
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
