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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9pbmRleC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVidWciLCJ1c2VDYWNoZSIsInByb21pc2lmeSIsImZuIiwibmFtZSIsImZuQ2FsbCIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFwcGx5IiwiY29uY2F0IiwiZXJyIiwiY2FjaGVDYWxsIiwiZGlzYWJsZUZTQ2FjaGUiLCJleGlzdHMiLCJkaXIiLCJyZXMiLCJzdGF0IiwibWtkaXIiLCJvcGVuRmlsZSIsIm9wZW4iLCJyZWFkZGlyIiwicmVhZEZpbGUiLCJ3cml0ZUZpbGUiLCJ0bXBGaWxlIiwiZmlsZSIsImZkcGF0aCIsImZkIiwibWtkaXJwIiwiZGlyZWN0b3J5IiwiY3dkIiwic3BsaXQiLCJzZXAiLCJTdHJpbmciLCJpbmRleE9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7MmNBVEE7Ozs7OztlQVdrQkEsUUFBUSxjQUFSLEVBQXdCLFNBQXhCLEM7SUFBVkMsSyxZQUFBQSxLOztBQUVSLElBQUlDLFdBQVcsSUFBZjs7QUFFQTs7Ozs7QUFLQSxTQUFTQyxTQUFULENBQW1CQyxFQUFuQixFQUF1QkMsSUFBdkIsRUFBNkI7QUFDM0I7OztBQUdBLE1BQU1DLFNBQVMsU0FBVEEsTUFBUyxHQUFZO0FBQUE7O0FBQ3pCLFFBQU1DLE9BQU8sR0FBR0MsS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsQ0FBYjtBQUNBVCxVQUFNLFFBQU4sRUFBZ0JJLElBQWhCLEVBQXNCRSxJQUF0QjtBQUNBLFdBQU8sSUFBSUksT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0Q1QsU0FBR1UsS0FBSCxRQUFlUCxLQUFLUSxNQUFMLENBQVksQ0FBQyxVQUFVQyxHQUFWLEVBQWU7QUFDekMsWUFBSUEsR0FBSixFQUFTSCxPQUFPRyxHQUFQLEVBQVQs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QUFBQTtBQUFBO0FBQUEsR0FBTDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFmIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZnMuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHRtcCBmcm9tICd0bXAnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZm4gYXMgd3JhcCB9IGZyb20gJy4uL3V0aWxzJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuLi91dGlscy9sb2cnKSgnaG9wcDpmcycpXG5cbmxldCB1c2VDYWNoZSA9IHRydWVcblxuLyoqXG4gKiBTaW1pbGFyIHRvIGJsdWViaXJkJ3MgUHJvbWlzZS5wcm9taXNpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiB0aGUgYXN5bmMtY2FsbGJhY2sgZnVuY3Rpb24gdG8gdHJhbnNmb3JtXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYSBuZXcgcHJvbWlzZS1iYXNlZCBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoZm4sIG5hbWUpIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBmdW5jdGlvbiBjYWxsIHdyYXBwZXIuXG4gICAqL1xuICBjb25zdCBmbkNhbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIGRlYnVnKCclcyglaiknLCBuYW1lLCBhcmdzKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChbZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICBlbHNlIHJlc29sdmUuYXBwbHkobnVsbCwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgICAgfV0pKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGRldGVybWluaXN0aWMgd3JhcHBlci5cbiAgICovXG4gIGNvbnN0IGNhY2hlQ2FsbCA9IHdyYXAoZm5DYWxsKVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gY29uZGl0aW9uYWwgY2FjaGUuXG4gICAqL1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmICh1c2VDYWNoZSkgcmV0dXJuIGNhY2hlQ2FsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIGZuQ2FsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH1cbn1cblxuLyoqXG4gKiBBbGxvdyBkaXNhYmxpbmcgb2YgY2FjaGUuXG4gKi9cbmV4cG9ydCBjb25zdCBkaXNhYmxlRlNDYWNoZSA9ICgpID0+IHtcbiAgZGVidWcoJ0Rpc2FibGluZyBmcyBjYWNoZScpXG4gIHVzZUNhY2hlID0gZmFsc2Vcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gb25seSBuZWVkZWQgbWV0aG9kcyAoaW5zdGVhZCBvZiB1c2luZyBtelxuICogb3IgZG9pbmcgYSBwcm9taXNpZnlBbGwpLlxuICovXG5leHBvcnQgY29uc3QgZXhpc3RzID0gZGlyID0+IG5ldyBQcm9taXNlKHJlcyA9PiBmcy5leGlzdHMoZGlyLCByZXMpKVxuZXhwb3J0IGNvbnN0IHN0YXQgPSBwcm9taXNpZnkoZnMuc3RhdCwgJ3N0YXQnKVxuZXhwb3J0IGNvbnN0IG1rZGlyID0gcHJvbWlzaWZ5KGZzLm1rZGlyLCAnbWtkaXInKVxuZXhwb3J0IGNvbnN0IG9wZW5GaWxlID0gcHJvbWlzaWZ5KGZzLm9wZW4sICdvcGVuJylcbmV4cG9ydCBjb25zdCByZWFkZGlyID0gcHJvbWlzaWZ5KGZzLnJlYWRkaXIsICdyZWFkZGlyJylcbmV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHByb21pc2lmeShmcy5yZWFkRmlsZSwgJ3JlYWRGaWxlJylcbmV4cG9ydCBjb25zdCB3cml0ZUZpbGUgPSBwcm9taXNpZnkoZnMud3JpdGVGaWxlLCAnd3JpdGVGaWxlJylcblxuLyoqXG4gKiBDcmVhdGUgdGVtcG9yYXJ5IGZpbGUuXG4gKi9cbmV4cG9ydCBjb25zdCB0bXBGaWxlID0gKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICB0bXAuZmlsZSgoZXJyLCBmZHBhdGgsIGZkKSA9PiB7XG4gICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICBlbHNlIHJlc29sdmUoW2ZkLCBmZHBhdGhdKVxuICB9KVxufSlcblxuLyoqXG4gKiBta2RpciAtcFxuICovXG5leHBvcnQgY29uc3QgbWtkaXJwID0gd3JhcChhc3luYyAoZGlyZWN0b3J5LCBjd2QpID0+IHtcbiAgLy8gZXhwbG9kZSBpbnRvIHNlcGFyYXRlXG4gIGRpcmVjdG9yeSA9IGRpcmVjdG9yeS5zcGxpdChwYXRoLnNlcClcblxuICAvLyB3YWxrXG4gIGZvciAobGV0IGRpciBvZiBkaXJlY3RvcnkpIHtcbiAgICBpZiAoZGlyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBta2Rpcihjd2QgKyBwYXRoLnNlcCArIGRpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoU3RyaW5nKGVycikuaW5kZXhPZignRUVYSVNUJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjd2QgKz0gcGF0aC5zZXAgKyBkaXJcbiAgfVxufSkiXX0=