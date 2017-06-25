/**
 * @file src/compat/else.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import semver from 'semver'

const { version } = require('../../package.json')

export default async lock => {
  if (semver.lt(lock.v, '1.0.0')) {
    lock.v = version
    return lock
  }

  throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v)
}
