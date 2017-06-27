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

exports.default = async lock => {
  if (_semver2.default.lt(lock.v, '1.0.0')) {
    lock.v = version;
    return lock;
  }

  throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v);
};
//# sourceMappingURL=else.js.map