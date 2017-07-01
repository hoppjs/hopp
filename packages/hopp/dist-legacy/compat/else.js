'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('../../package.json'),
    version = _require.version; /**
                                 * @file src/compat/else.js
                                 * @license MIT
                                 * @copyright 2017 10244872 Canada Inc.
                                 */

exports.default = function () {
  var _ref = (0, _bluebird.method)(function (lock) {
    if (_semver2.default.lt(lock.v, '1.0.0-alpha.11')) {
      lock.v = version;

      // below alpha 11, there are race conditions with
      // the state cache - so discard it and let it be
      // reconstructed
      delete lock.sc;

      return lock;
    }

    if (_semver2.default.lt(lock.v, '1.0.0')) {
      lock.v = version;
      return lock;
    }

    throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

//# sourceMappingURL=else.js.map