/**
 * @file src/compat/else.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import semver from 'semver'

const { version } = require('../../package.json')

export default lock => {
  if (semver.lt(lock.v, '1.0.0-alpha.11')) {
    lock.v = version

    // below alpha 11, there are race conditions with
    // the state cache - so discard it and let it be
    // reconstructed
    delete lock.sc

    return lock
  }

  // final rule if all else passes is to just allow the
  // updating by changing the version number
  if (semver.lte(lock.v, version)) {
    lock.v = version
    return lock
  }

  throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v)
}
