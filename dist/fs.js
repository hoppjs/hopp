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

const { debug } = require('./utils/log')('hopp:fs');

let useCache = true;

/**
 * Similar to bluebird's Promise.promisify.
 * @param {Function} fn the async-callback function to transform
 * @return {Function} a new promise-based function
 */
function promisify(fn, name) {
  /**
   * Create function call wrapper.
   */
  const fnCall = function () {
    const args = [].slice.call(arguments);
    debug('%s(%j)', name, args);
    return new Promise((resolve, reject) => {
      fn.apply(this, args.concat([function (err) {
        if (err) reject(err);else resolve.apply(null, [].slice.call(arguments, 1));
      }]));
    });
  };

  /**
   * Create deterministic wrapper.
   */
  const cacheCall = (0, _fn2.default)(fnCall

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
const disableFSCache = exports.disableFSCache = () => {
  debug('Disabling fs cache');
  useCache = false;
};

/**
 * Transform only needed methods (instead of using mz
 * or doing a promisifyAll).
 */
const exists = exports.exists = dir => new Promise(res => _fs2.default.exists(dir, res));
const stat = exports.stat = promisify(_fs2.default.stat, 'stat');
const mkdir = exports.mkdir = promisify(_fs2.default.mkdir, 'mkdir');
const readdir = exports.readdir = promisify(_fs2.default.readdir, 'readdir');
const readFile = exports.readFile = promisify(_fs2.default.readFile, 'readFile');
const writeFile = exports.writeFile = promisify(_fs2.default.writeFile, 'writeFile');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mcy5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsInJlcXVpcmUiLCJ1c2VDYWNoZSIsInByb21pc2lmeSIsImZuIiwibmFtZSIsImZuQ2FsbCIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFwcGx5IiwiY29uY2F0IiwiZXJyIiwiY2FjaGVDYWxsIiwiZGlzYWJsZUZTQ2FjaGUiLCJleGlzdHMiLCJkaXIiLCJyZXMiLCJzdGF0IiwibWtkaXIiLCJyZWFkZGlyIiwicmVhZEZpbGUiLCJ3cml0ZUZpbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7OztBQUNBOzs7Ozs7QUFQQTs7Ozs7O0FBU0EsTUFBTSxFQUFFQSxLQUFGLEtBQVlDLFFBQVEsYUFBUixFQUF1QixTQUF2QixDQUFsQjs7QUFFQSxJQUFJQyxXQUFXLElBQWY7O0FBRUE7Ozs7O0FBS0EsU0FBU0MsU0FBVCxDQUFtQkMsRUFBbkIsRUFBdUJDLElBQXZCLEVBQTZCO0FBQzNCOzs7QUFHQSxRQUFNQyxTQUFTLFlBQVk7QUFDekIsVUFBTUMsT0FBTyxHQUFHQyxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxDQUFiO0FBQ0FWLFVBQU0sUUFBTixFQUFnQkssSUFBaEIsRUFBc0JFLElBQXRCO0FBQ0EsV0FBTyxJQUFJSSxPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQ3RDVCxTQUFHVSxLQUFILENBQVMsSUFBVCxFQUFlUCxLQUFLUSxNQUFMLENBQVksQ0FBQyxVQUFVQyxHQUFWLEVBQWU7QUFDekMsWUFBSUEsR0FBSixFQUFTSCxPQUFPRyxHQUFQLEVBQVQsS0FDS0osUUFBUUUsS0FBUixDQUFjLElBQWQsRUFBb0IsR0FBR04sS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsRUFBeUIsQ0FBekIsQ0FBcEI7QUFDTixPQUgwQixDQUFaLENBQWY7QUFJRCxLQUxNLENBQVA7QUFNRCxHQVREOztBQVdBOzs7QUFHQSxRQUFNTyxZQUFZLGtCQUFLWDs7QUFFdkI7OztBQUZrQixHQUFsQixDQUtBLE9BQU8sWUFBWTtBQUNqQixRQUFJSixRQUFKLEVBQWMsT0FBT2UsVUFBVUgsS0FBVixDQUFnQixJQUFoQixFQUFzQkosU0FBdEIsQ0FBUDtBQUNkLFdBQU9KLE9BQU9RLEtBQVAsQ0FBYSxJQUFiLEVBQW1CSixTQUFuQixDQUFQO0FBQ0QsR0FIRDtBQUlEOztBQUVEOzs7QUFHTyxNQUFNUSwwQ0FBaUIsTUFBTTtBQUNsQ2xCLFFBQU0sb0JBQU47QUFDQUUsYUFBVyxLQUFYO0FBQ0QsQ0FITTs7QUFLUDs7OztBQUlPLE1BQU1pQiwwQkFBU0MsT0FBTyxJQUFJVCxPQUFKLENBQVlVLE9BQU8sYUFBR0YsTUFBSCxDQUFVQyxHQUFWLEVBQWVDLEdBQWYsQ0FBbkIsQ0FBdEI7QUFDQSxNQUFNQyxzQkFBT25CLFVBQVUsYUFBR21CLElBQWIsRUFBbUIsTUFBbkIsQ0FBYjtBQUNBLE1BQU1DLHdCQUFRcEIsVUFBVSxhQUFHb0IsS0FBYixFQUFvQixPQUFwQixDQUFkO0FBQ0EsTUFBTUMsNEJBQVVyQixVQUFVLGFBQUdxQixPQUFiLEVBQXNCLFNBQXRCLENBQWhCO0FBQ0EsTUFBTUMsOEJBQVd0QixVQUFVLGFBQUdzQixRQUFiLEVBQXVCLFVBQXZCLENBQWpCO0FBQ0EsTUFBTUMsZ0NBQVl2QixVQUFVLGFBQUd1QixTQUFiLEVBQXdCLFdBQXhCLENBQWxCIiwiZmlsZSI6ImZzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZnMuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHdyYXAgZnJvbSAnLi9mbidcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcDpmcycpXG5cbmxldCB1c2VDYWNoZSA9IHRydWVcblxuLyoqXG4gKiBTaW1pbGFyIHRvIGJsdWViaXJkJ3MgUHJvbWlzZS5wcm9taXNpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiB0aGUgYXN5bmMtY2FsbGJhY2sgZnVuY3Rpb24gdG8gdHJhbnNmb3JtXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYSBuZXcgcHJvbWlzZS1iYXNlZCBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoZm4sIG5hbWUpIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBmdW5jdGlvbiBjYWxsIHdyYXBwZXIuXG4gICAqL1xuICBjb25zdCBmbkNhbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIGRlYnVnKCclcyglaiknLCBuYW1lLCBhcmdzKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChbZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICBlbHNlIHJlc29sdmUuYXBwbHkobnVsbCwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgICAgfV0pKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGRldGVybWluaXN0aWMgd3JhcHBlci5cbiAgICovXG4gIGNvbnN0IGNhY2hlQ2FsbCA9IHdyYXAoZm5DYWxsKVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gY29uZGl0aW9uYWwgY2FjaGUuXG4gICAqL1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmICh1c2VDYWNoZSkgcmV0dXJuIGNhY2hlQ2FsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIGZuQ2FsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH1cbn1cblxuLyoqXG4gKiBBbGxvdyBkaXNhYmxpbmcgb2YgY2FjaGUuXG4gKi9cbmV4cG9ydCBjb25zdCBkaXNhYmxlRlNDYWNoZSA9ICgpID0+IHtcbiAgZGVidWcoJ0Rpc2FibGluZyBmcyBjYWNoZScpXG4gIHVzZUNhY2hlID0gZmFsc2Vcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gb25seSBuZWVkZWQgbWV0aG9kcyAoaW5zdGVhZCBvZiB1c2luZyBtelxuICogb3IgZG9pbmcgYSBwcm9taXNpZnlBbGwpLlxuICovXG5leHBvcnQgY29uc3QgZXhpc3RzID0gZGlyID0+IG5ldyBQcm9taXNlKHJlcyA9PiBmcy5leGlzdHMoZGlyLCByZXMpKVxuZXhwb3J0IGNvbnN0IHN0YXQgPSBwcm9taXNpZnkoZnMuc3RhdCwgJ3N0YXQnKVxuZXhwb3J0IGNvbnN0IG1rZGlyID0gcHJvbWlzaWZ5KGZzLm1rZGlyLCAnbWtkaXInKVxuZXhwb3J0IGNvbnN0IHJlYWRkaXIgPSBwcm9taXNpZnkoZnMucmVhZGRpciwgJ3JlYWRkaXInKVxuZXhwb3J0IGNvbnN0IHJlYWRGaWxlID0gcHJvbWlzaWZ5KGZzLnJlYWRGaWxlLCAncmVhZEZpbGUnKVxuZXhwb3J0IGNvbnN0IHdyaXRlRmlsZSA9IHByb21pc2lmeShmcy53cml0ZUZpbGUsICd3cml0ZUZpbGUnKSJdfQ==