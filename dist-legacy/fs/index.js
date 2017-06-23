'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkdirp = exports.tmpFile = exports.writeFile = exports.readFile = exports.readdir = exports.openFile = exports.mkdir = exports.stat = exports.exists = exports.disableFSCache = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/fs.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('../utils/log')('hopp:fs'),
    debug = _require.debug;

var useCache = true;

/**
 * Similar to bluebird's Promise.promisify.
 * @param {Function} fn the async-callback function to transform
 * @return {Function} a new promise-based function
 */
function promisify(fn, name) {
  /**
   * Create function call wrapper.
   */
  var fnCall = function fnCall() {
    var _this = this;

    var args = [].slice.call(arguments);
    debug('%s(%j)', name, args);
    return new Promise(function (resolve, reject) {
      fn.apply(_this, args.concat([function (err) {
        if (err) reject(err);else resolve.apply(null, [].slice.call(arguments, 1));
      }]));
    });
  };

  /**
   * Create deterministic wrapper.
   */
  var cacheCall = (0, _utils.fn)(fnCall);

  /**
   * Return conditional cache.
   */
  return function () {
    if (useCache) return cacheCall.apply(this, arguments);
    return fnCall.apply(this, arguments);
  };
}

/**
 * Allow disabling of cache.
 */
var disableFSCache = exports.disableFSCache = function disableFSCache() {
  debug('Disabling fs cache');
  useCache = false;
};

/**
 * Transform only needed methods (instead of using mz
 * or doing a promisifyAll).
 */
var exists = exports.exists = function exists(dir) {
  return new Promise(function (res) {
    return _fs2.default.exists(dir, res);
  });
};
var stat = exports.stat = promisify(_fs2.default.stat, 'stat');
var mkdir = exports.mkdir = promisify(_fs2.default.mkdir, 'mkdir');
var openFile = exports.openFile = promisify(_fs2.default.open, 'open');
var readdir = exports.readdir = promisify(_fs2.default.readdir, 'readdir');
var readFile = exports.readFile = promisify(_fs2.default.readFile, 'readFile');
var writeFile = exports.writeFile = promisify(_fs2.default.writeFile, 'writeFile');

/**
 * Create temporary file.
 */
var tmpFile = exports.tmpFile = function tmpFile() {
  return new Promise(function (resolve, reject) {
    _tmp2.default.file(function (err, fdpath, fd) {
      if (err) reject(err);else resolve([fd, fdpath]);
    });
  });
};

/**
 * mkdir -p
 */
var mkdirp = exports.mkdirp = (0, _utils.fn)(function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory, cwd) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, dir;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // explode into separate
            directory = directory.split(_path2.default.sep);

            // walk
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 4;
            _iterator = directory[Symbol.iterator]();

          case 6:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 22;
              break;
            }

            dir = _step.value;

            if (!dir) {
              _context.next = 18;
              break;
            }

            _context.prev = 9;
            _context.next = 12;
            return mkdir(cwd + _path2.default.sep + dir);

          case 12:
            _context.next = 18;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context['catch'](9);

            if (!(String(_context.t0).indexOf('EEXIST') === -1)) {
              _context.next = 18;
              break;
            }

            throw _context.t0;

          case 18:

            cwd += _path2.default.sep + dir;

          case 19:
            _iteratorNormalCompletion = true;
            _context.next = 6;
            break;

          case 22:
            _context.next = 28;
            break;

          case 24:
            _context.prev = 24;
            _context.t1 = _context['catch'](4);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 28:
            _context.prev = 28;
            _context.prev = 29;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 31:
            _context.prev = 31;

            if (!_didIteratorError) {
              _context.next = 34;
              break;
            }

            throw _iteratorError;

          case 34:
            return _context.finish(31);

          case 35:
            return _context.finish(28);

          case 36:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[4, 24, 28, 36], [9, 14], [29,, 31, 35]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
//# sourceMappingURL=index.js.map