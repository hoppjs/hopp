'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkdirp = exports.writeFile = exports.readFile = exports.readdir = exports.mkdir = exports.stat = exports.exists = exports.disableFSCache = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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
var readdir = exports.readdir = promisify(_fs2.default.readdir, 'readdir');
var readFile = exports.readFile = promisify(_fs2.default.readFile, 'readFile');
var writeFile = exports.writeFile = promisify(_fs2.default.writeFile, 'writeFile');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9pbmRleC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVidWciLCJ1c2VDYWNoZSIsInByb21pc2lmeSIsImZuIiwibmFtZSIsImZuQ2FsbCIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFwcGx5IiwiY29uY2F0IiwiZXJyIiwiY2FjaGVDYWxsIiwiZGlzYWJsZUZTQ2FjaGUiLCJleGlzdHMiLCJkaXIiLCJyZXMiLCJzdGF0IiwibWtkaXIiLCJyZWFkZGlyIiwicmVhZEZpbGUiLCJ3cml0ZUZpbGUiLCJta2RpcnAiLCJkaXJlY3RvcnkiLCJjd2QiLCJzcGxpdCIsInNlcCIsIlN0cmluZyIsImluZGV4T2YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7MmNBUkE7Ozs7OztlQVVrQkEsUUFBUSxjQUFSLEVBQXdCLFNBQXhCLEM7SUFBVkMsSyxZQUFBQSxLOztBQUVSLElBQUlDLFdBQVcsSUFBZjs7QUFFQTs7Ozs7QUFLQSxTQUFTQyxTQUFULENBQW1CQyxFQUFuQixFQUF1QkMsSUFBdkIsRUFBNkI7QUFDM0I7OztBQUdBLE1BQU1DLFNBQVMsU0FBVEEsTUFBUyxHQUFZO0FBQUE7O0FBQ3pCLFFBQU1DLE9BQU8sR0FBR0MsS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsQ0FBYjtBQUNBVCxVQUFNLFFBQU4sRUFBZ0JJLElBQWhCLEVBQXNCRSxJQUF0QjtBQUNBLFdBQU8sSUFBSUksT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0Q1QsU0FBR1UsS0FBSCxRQUFlUCxLQUFLUSxNQUFMLENBQVksQ0FBQyxVQUFVQyxHQUFWLEVBQWU7QUFDekMsWUFBSUEsR0FBSixFQUFTSCxPQUFPRyxHQUFQLEVBQVQsS0FDS0osUUFBUUUsS0FBUixDQUFjLElBQWQsRUFBb0IsR0FBR04sS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsRUFBeUIsQ0FBekIsQ0FBcEI7QUFDTixPQUgwQixDQUFaLENBQWY7QUFJRCxLQUxNLENBQVA7QUFNRCxHQVREOztBQVdBOzs7QUFHQSxNQUFNTyxZQUFZLGVBQUtYLE1BQUwsQ0FBbEI7O0FBRUE7OztBQUdBLFNBQU8sWUFBWTtBQUNqQixRQUFJSixRQUFKLEVBQWMsT0FBT2UsVUFBVUgsS0FBVixDQUFnQixJQUFoQixFQUFzQkosU0FBdEIsQ0FBUDtBQUNkLFdBQU9KLE9BQU9RLEtBQVAsQ0FBYSxJQUFiLEVBQW1CSixTQUFuQixDQUFQO0FBQ0QsR0FIRDtBQUlEOztBQUVEOzs7QUFHTyxJQUFNUSwwQ0FBaUIsU0FBakJBLGNBQWlCLEdBQU07QUFDbENqQixRQUFNLG9CQUFOO0FBQ0FDLGFBQVcsS0FBWDtBQUNELENBSE07O0FBS1A7Ozs7QUFJTyxJQUFNaUIsMEJBQVMsU0FBVEEsTUFBUztBQUFBLFNBQU8sSUFBSVIsT0FBSixDQUFZO0FBQUEsV0FBTyxhQUFHUSxNQUFILENBQVVDLEdBQVYsRUFBZUMsR0FBZixDQUFQO0FBQUEsR0FBWixDQUFQO0FBQUEsQ0FBZjtBQUNBLElBQU1DLHNCQUFPbkIsVUFBVSxhQUFHbUIsSUFBYixFQUFtQixNQUFuQixDQUFiO0FBQ0EsSUFBTUMsd0JBQVFwQixVQUFVLGFBQUdvQixLQUFiLEVBQW9CLE9BQXBCLENBQWQ7QUFDQSxJQUFNQyw0QkFBVXJCLFVBQVUsYUFBR3FCLE9BQWIsRUFBc0IsU0FBdEIsQ0FBaEI7QUFDQSxJQUFNQyw4QkFBV3RCLFVBQVUsYUFBR3NCLFFBQWIsRUFBdUIsVUFBdkIsQ0FBakI7QUFDQSxJQUFNQyxnQ0FBWXZCLFVBQVUsYUFBR3VCLFNBQWIsRUFBd0IsV0FBeEIsQ0FBbEI7O0FBRVA7OztBQUdPLElBQU1DLDBCQUFTO0FBQUEsdURBQUssaUJBQU9DLFNBQVAsRUFBa0JDLEdBQWxCO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDekI7QUFDQUQsd0JBQVlBLFVBQVVFLEtBQVYsQ0FBZ0IsZUFBS0MsR0FBckIsQ0FBWjs7QUFFQTtBQUp5QjtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUtUSCxTQUxTOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS2hCUixlQUxnQjs7QUFBQSxpQkFNbkJBLEdBTm1CO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxtQkFRYkcsTUFBTU0sTUFBTSxlQUFLRSxHQUFYLEdBQWlCWCxHQUF2QixDQVJhOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBVWZZLG9CQUFZQyxPQUFaLENBQW9CLFFBQXBCLE1BQWtDLENBQUMsQ0FWcEI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7O0FBZ0J2QkosbUJBQU8sZUFBS0UsR0FBTCxHQUFXWCxHQUFsQjs7QUFoQnVCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBTDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFmIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZnMuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGZuIGFzIHdyYXAgfSBmcm9tICcuLi91dGlscydcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvbG9nJykoJ2hvcHA6ZnMnKVxuXG5sZXQgdXNlQ2FjaGUgPSB0cnVlXG5cbi8qKlxuICogU2ltaWxhciB0byBibHVlYmlyZCdzIFByb21pc2UucHJvbWlzaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGFzeW5jLWNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRyYW5zZm9ybVxuICogQHJldHVybiB7RnVuY3Rpb259IGEgbmV3IHByb21pc2UtYmFzZWQgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGZuLCBuYW1lKSB7XG4gIC8qKlxuICAgKiBDcmVhdGUgZnVuY3Rpb24gY2FsbCB3cmFwcGVyLlxuICAgKi9cbiAgY29uc3QgZm5DYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBkZWJ1ZygnJXMoJWopJywgbmFtZSwgYXJncylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJncy5jb25jYXQoW2Z1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgZWxzZSByZXNvbHZlLmFwcGx5KG51bGwsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcbiAgICAgIH1dKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBkZXRlcm1pbmlzdGljIHdyYXBwZXIuXG4gICAqL1xuICBjb25zdCBjYWNoZUNhbGwgPSB3cmFwKGZuQ2FsbClcblxuICAvKipcbiAgICogUmV0dXJuIGNvbmRpdGlvbmFsIGNhY2hlLlxuICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodXNlQ2FjaGUpIHJldHVybiBjYWNoZUNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiBmbkNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG5cbi8qKlxuICogQWxsb3cgZGlzYWJsaW5nIG9mIGNhY2hlLlxuICovXG5leHBvcnQgY29uc3QgZGlzYWJsZUZTQ2FjaGUgPSAoKSA9PiB7XG4gIGRlYnVnKCdEaXNhYmxpbmcgZnMgY2FjaGUnKVxuICB1c2VDYWNoZSA9IGZhbHNlXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIG9ubHkgbmVlZGVkIG1ldGhvZHMgKGluc3RlYWQgb2YgdXNpbmcgbXpcbiAqIG9yIGRvaW5nIGEgcHJvbWlzaWZ5QWxsKS5cbiAqL1xuZXhwb3J0IGNvbnN0IGV4aXN0cyA9IGRpciA9PiBuZXcgUHJvbWlzZShyZXMgPT4gZnMuZXhpc3RzKGRpciwgcmVzKSlcbmV4cG9ydCBjb25zdCBzdGF0ID0gcHJvbWlzaWZ5KGZzLnN0YXQsICdzdGF0JylcbmV4cG9ydCBjb25zdCBta2RpciA9IHByb21pc2lmeShmcy5ta2RpciwgJ21rZGlyJylcbmV4cG9ydCBjb25zdCByZWFkZGlyID0gcHJvbWlzaWZ5KGZzLnJlYWRkaXIsICdyZWFkZGlyJylcbmV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHByb21pc2lmeShmcy5yZWFkRmlsZSwgJ3JlYWRGaWxlJylcbmV4cG9ydCBjb25zdCB3cml0ZUZpbGUgPSBwcm9taXNpZnkoZnMud3JpdGVGaWxlLCAnd3JpdGVGaWxlJylcblxuLyoqXG4gKiBta2RpciAtcFxuICovXG5leHBvcnQgY29uc3QgbWtkaXJwID0gd3JhcChhc3luYyAoZGlyZWN0b3J5LCBjd2QpID0+IHtcbiAgLy8gZXhwbG9kZSBpbnRvIHNlcGFyYXRlXG4gIGRpcmVjdG9yeSA9IGRpcmVjdG9yeS5zcGxpdChwYXRoLnNlcClcblxuICAvLyB3YWxrXG4gIGZvciAobGV0IGRpciBvZiBkaXJlY3RvcnkpIHtcbiAgICBpZiAoZGlyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBta2Rpcihjd2QgKyBwYXRoLnNlcCArIGRpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoU3RyaW5nKGVycikuaW5kZXhPZignRUVYSVNUJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjd2QgKz0gcGF0aC5zZXAgKyBkaXJcbiAgfVxufSkiXX0=