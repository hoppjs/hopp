'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async lock => {
  if (_semver2.default.lt(lock.v, '1.0.0')) {
    return lock;
  }

  throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v);
}; /**
    * @file src/compat/else.js
    * @license MIT
    * @copyright 2017 10244872 Canada Inc.
    */
//# sourceMappingURL=else.js.map