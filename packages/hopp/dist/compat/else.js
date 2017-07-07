'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { version } = require('../../package.json'); /**
                                                    * @file src/compat/else.js
                                                    * @license MIT
                                                    * @copyright 2017 10244872 Canada Inc.
                                                    */

exports.default = lock => {
  if (_semver2.default.lt(lock.v, '1.0.0-alpha.11')) {
    lock.v = version;

    // below alpha 11, there are race conditions with
    // the state cache - so discard it and let it be
    // reconstructed
    delete lock.sc;

    return lock;
  }

  // final rule if all else passes is to just allow the
  // updating by changing the version number
  if (_semver2.default.lte(lock.v, version)) {
    lock.v = version;
    return lock;
  }

  throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v);
};

//# sourceMappingURL=else.js.map