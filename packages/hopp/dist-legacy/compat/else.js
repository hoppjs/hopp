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

var _require = require('../../package.json'),
    version = _require.version;

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(lock) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_semver2.default.lt(lock.v, '1.0.0-alpha.11')) {
              _context.next = 4;
              break;
            }

            lock.v = version;

            // below alpha 11, there are race conditions with
            // the state cache - so discard it and let it be
            // reconstructed
            delete lock.sc;

            return _context.abrupt('return', lock);

          case 4:
            if (!_semver2.default.lt(lock.v, '1.0.0')) {
              _context.next = 7;
              break;
            }

            lock.v = version;
            return _context.abrupt('return', lock);

          case 7:
            throw new Error('Sorry, this version of hopp does not support lockfiles from hopp v' + lock.v);

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

//# sourceMappingURL=else.js.map