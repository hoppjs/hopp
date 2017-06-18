'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeFile = exports.readFile = exports.readdir = exports.mkdir = exports.stat = exports.exists = exports.disableFSCache = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fn = require('./fn');

var _fn2 = _interopRequireDefault(_fn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/fs.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

var _require = require('./utils/log')('hopp:fs'),
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
  var cacheCall = (0, _fn2.default)(fnCall

  /**
   * Return conditional cache.
   */
  );return function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mcy5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVidWciLCJ1c2VDYWNoZSIsInByb21pc2lmeSIsImZuIiwibmFtZSIsImZuQ2FsbCIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFwcGx5IiwiY29uY2F0IiwiZXJyIiwiY2FjaGVDYWxsIiwiZGlzYWJsZUZTQ2FjaGUiLCJleGlzdHMiLCJkaXIiLCJyZXMiLCJzdGF0IiwibWtkaXIiLCJyZWFkZGlyIiwicmVhZEZpbGUiLCJ3cml0ZUZpbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7OztBQUNBOzs7Ozs7QUFQQTs7Ozs7O2VBU2tCQSxRQUFRLGFBQVIsRUFBdUIsU0FBdkIsQztJQUFWQyxLLFlBQUFBLEs7O0FBRVIsSUFBSUMsV0FBVyxJQUFmOztBQUVBOzs7OztBQUtBLFNBQVNDLFNBQVQsQ0FBbUJDLEVBQW5CLEVBQXVCQyxJQUF2QixFQUE2QjtBQUMzQjs7O0FBR0EsTUFBTUMsU0FBUyxTQUFUQSxNQUFTLEdBQVk7QUFBQTs7QUFDekIsUUFBTUMsT0FBTyxHQUFHQyxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxDQUFiO0FBQ0FULFVBQU0sUUFBTixFQUFnQkksSUFBaEIsRUFBc0JFLElBQXRCO0FBQ0EsV0FBTyxJQUFJSSxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3RDVCxTQUFHVSxLQUFILFFBQWVQLEtBQUtRLE1BQUwsQ0FBWSxDQUFDLFVBQVVDLEdBQVYsRUFBZTtBQUN6QyxZQUFJQSxHQUFKLEVBQVNILE9BQU9HLEdBQVAsRUFBVCxLQUNLSixRQUFRRSxLQUFSLENBQWMsSUFBZCxFQUFvQixHQUFHTixLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxFQUF5QixDQUF6QixDQUFwQjtBQUNOLE9BSDBCLENBQVosQ0FBZjtBQUlELEtBTE0sQ0FBUDtBQU1ELEdBVEQ7O0FBV0E7OztBQUdBLE1BQU1PLFlBQVksa0JBQUtYOztBQUV2Qjs7O0FBRmtCLEdBQWxCLENBS0EsT0FBTyxZQUFZO0FBQ2pCLFFBQUlKLFFBQUosRUFBYyxPQUFPZSxVQUFVSCxLQUFWLENBQWdCLElBQWhCLEVBQXNCSixTQUF0QixDQUFQO0FBQ2QsV0FBT0osT0FBT1EsS0FBUCxDQUFhLElBQWIsRUFBbUJKLFNBQW5CLENBQVA7QUFDRCxHQUhEO0FBSUQ7O0FBRUQ7OztBQUdPLElBQU1RLDBDQUFpQixTQUFqQkEsY0FBaUIsR0FBTTtBQUNsQ2pCLFFBQU0sb0JBQU47QUFDQUMsYUFBVyxLQUFYO0FBQ0QsQ0FITTs7QUFLUDs7OztBQUlPLElBQU1pQiwwQkFBUyxTQUFUQSxNQUFTO0FBQUEsU0FBTyxJQUFJUixPQUFKLENBQVk7QUFBQSxXQUFPLGFBQUdRLE1BQUgsQ0FBVUMsR0FBVixFQUFlQyxHQUFmLENBQVA7QUFBQSxHQUFaLENBQVA7QUFBQSxDQUFmO0FBQ0EsSUFBTUMsc0JBQU9uQixVQUFVLGFBQUdtQixJQUFiLEVBQW1CLE1BQW5CLENBQWI7QUFDQSxJQUFNQyx3QkFBUXBCLFVBQVUsYUFBR29CLEtBQWIsRUFBb0IsT0FBcEIsQ0FBZDtBQUNBLElBQU1DLDRCQUFVckIsVUFBVSxhQUFHcUIsT0FBYixFQUFzQixTQUF0QixDQUFoQjtBQUNBLElBQU1DLDhCQUFXdEIsVUFBVSxhQUFHc0IsUUFBYixFQUF1QixVQUF2QixDQUFqQjtBQUNBLElBQU1DLGdDQUFZdkIsVUFBVSxhQUFHdUIsU0FBYixFQUF3QixXQUF4QixDQUFsQiIsImZpbGUiOiJmcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2ZzLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCB3cmFwIGZyb20gJy4vZm4nXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHA6ZnMnKVxuXG5sZXQgdXNlQ2FjaGUgPSB0cnVlXG5cbi8qKlxuICogU2ltaWxhciB0byBibHVlYmlyZCdzIFByb21pc2UucHJvbWlzaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGFzeW5jLWNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRyYW5zZm9ybVxuICogQHJldHVybiB7RnVuY3Rpb259IGEgbmV3IHByb21pc2UtYmFzZWQgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGZuLCBuYW1lKSB7XG4gIC8qKlxuICAgKiBDcmVhdGUgZnVuY3Rpb24gY2FsbCB3cmFwcGVyLlxuICAgKi9cbiAgY29uc3QgZm5DYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBkZWJ1ZygnJXMoJWopJywgbmFtZSwgYXJncylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJncy5jb25jYXQoW2Z1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgZWxzZSByZXNvbHZlLmFwcGx5KG51bGwsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcbiAgICAgIH1dKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBkZXRlcm1pbmlzdGljIHdyYXBwZXIuXG4gICAqL1xuICBjb25zdCBjYWNoZUNhbGwgPSB3cmFwKGZuQ2FsbClcblxuICAvKipcbiAgICogUmV0dXJuIGNvbmRpdGlvbmFsIGNhY2hlLlxuICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodXNlQ2FjaGUpIHJldHVybiBjYWNoZUNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiBmbkNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG5cbi8qKlxuICogQWxsb3cgZGlzYWJsaW5nIG9mIGNhY2hlLlxuICovXG5leHBvcnQgY29uc3QgZGlzYWJsZUZTQ2FjaGUgPSAoKSA9PiB7XG4gIGRlYnVnKCdEaXNhYmxpbmcgZnMgY2FjaGUnKVxuICB1c2VDYWNoZSA9IGZhbHNlXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIG9ubHkgbmVlZGVkIG1ldGhvZHMgKGluc3RlYWQgb2YgdXNpbmcgbXpcbiAqIG9yIGRvaW5nIGEgcHJvbWlzaWZ5QWxsKS5cbiAqL1xuZXhwb3J0IGNvbnN0IGV4aXN0cyA9IGRpciA9PiBuZXcgUHJvbWlzZShyZXMgPT4gZnMuZXhpc3RzKGRpciwgcmVzKSlcbmV4cG9ydCBjb25zdCBzdGF0ID0gcHJvbWlzaWZ5KGZzLnN0YXQsICdzdGF0JylcbmV4cG9ydCBjb25zdCBta2RpciA9IHByb21pc2lmeShmcy5ta2RpciwgJ21rZGlyJylcbmV4cG9ydCBjb25zdCByZWFkZGlyID0gcHJvbWlzaWZ5KGZzLnJlYWRkaXIsICdyZWFkZGlyJylcbmV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHByb21pc2lmeShmcy5yZWFkRmlsZSwgJ3JlYWRGaWxlJylcbmV4cG9ydCBjb25zdCB3cml0ZUZpbGUgPSBwcm9taXNpZnkoZnMud3JpdGVGaWxlLCAnd3JpdGVGaWxlJykiXX0=