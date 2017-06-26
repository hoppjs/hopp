'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/compat/else.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

const { version } = require('../../package.json');

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (lock) {
    if (_semver2.default.lt(lock.v, '1.0.0')) {
      lock.v = version;
      return lock;
    }

    throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();