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

/**
 * @file src/fs.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const { debug } = require('../utils/log')('hopp:fs');

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
  const cacheCall = (0, _utils.fn)(fnCall);

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
const openFile = exports.openFile = promisify(_fs2.default.open, 'open');
const readdir = exports.readdir = promisify(_fs2.default.readdir, 'readdir');
const readFile = exports.readFile = promisify(_fs2.default.readFile, 'readFile');
const writeFile = exports.writeFile = promisify(_fs2.default.writeFile, 'writeFile');

/**
 * Create temporary file.
 */
const tmpFile = exports.tmpFile = () => new Promise((resolve, reject) => {
  _tmp2.default.file((err, fdpath, fd) => {
    if (err) reject(err);else resolve([fd, fdpath]);
  });
});

/**
 * mkdir -p
 */
const mkdirp = exports.mkdirp = (0, _utils.fn)(async (directory, cwd) => {
  // explode into separate
  directory = directory.split(_path2.default.sep);

  // walk
  for (let dir of directory) {
    if (dir) {
      try {
        await mkdir(cwd + _path2.default.sep + dir);
      } catch (err) {
        if (String(err).indexOf('EEXIST') === -1) {
          throw err;
        }
      }
    }

    cwd += _path2.default.sep + dir;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsInJlcXVpcmUiLCJ1c2VDYWNoZSIsInByb21pc2lmeSIsImZuIiwibmFtZSIsImZuQ2FsbCIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFwcGx5IiwiY29uY2F0IiwiZXJyIiwiY2FjaGVDYWxsIiwiZGlzYWJsZUZTQ2FjaGUiLCJleGlzdHMiLCJkaXIiLCJyZXMiLCJzdGF0IiwibWtkaXIiLCJvcGVuRmlsZSIsIm9wZW4iLCJyZWFkZGlyIiwicmVhZEZpbGUiLCJ3cml0ZUZpbGUiLCJ0bXBGaWxlIiwiZmlsZSIsImZkcGF0aCIsImZkIiwibWtkaXJwIiwiZGlyZWN0b3J5IiwiY3dkIiwic3BsaXQiLCJzZXAiLCJTdHJpbmciLCJpbmRleE9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFUQTs7Ozs7O0FBV0EsTUFBTSxFQUFFQSxLQUFGLEtBQVlDLFFBQVEsY0FBUixFQUF3QixTQUF4QixDQUFsQjs7QUFFQSxJQUFJQyxXQUFXLElBQWY7O0FBRUE7Ozs7O0FBS0EsU0FBU0MsU0FBVCxDQUFtQkMsRUFBbkIsRUFBdUJDLElBQXZCLEVBQTZCO0FBQzNCOzs7QUFHQSxRQUFNQyxTQUFTLFlBQVk7QUFDekIsVUFBTUMsT0FBTyxHQUFHQyxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxDQUFiO0FBQ0FWLFVBQU0sUUFBTixFQUFnQkssSUFBaEIsRUFBc0JFLElBQXRCO0FBQ0EsV0FBTyxJQUFJSSxPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQ3RDVCxTQUFHVSxLQUFILENBQVMsSUFBVCxFQUFlUCxLQUFLUSxNQUFMLENBQVksQ0FBQyxVQUFVQyxHQUFWLEVBQWU7QUFDekMsWUFBSUEsR0FBSixFQUFTSCxPQUFPRyxHQUFQLEVBQVQsS0FDS0osUUFBUUUsS0FBUixDQUFjLElBQWQsRUFBb0IsR0FBR04sS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsRUFBeUIsQ0FBekIsQ0FBcEI7QUFDTixPQUgwQixDQUFaLENBQWY7QUFJRCxLQUxNLENBQVA7QUFNRCxHQVREOztBQVdBOzs7QUFHQSxRQUFNTyxZQUFZLGVBQUtYLE1BQUwsQ0FBbEI7O0FBRUE7OztBQUdBLFNBQU8sWUFBWTtBQUNqQixRQUFJSixRQUFKLEVBQWMsT0FBT2UsVUFBVUgsS0FBVixDQUFnQixJQUFoQixFQUFzQkosU0FBdEIsQ0FBUDtBQUNkLFdBQU9KLE9BQU9RLEtBQVAsQ0FBYSxJQUFiLEVBQW1CSixTQUFuQixDQUFQO0FBQ0QsR0FIRDtBQUlEOztBQUVEOzs7QUFHTyxNQUFNUSwwQ0FBaUIsTUFBTTtBQUNsQ2xCLFFBQU0sb0JBQU47QUFDQUUsYUFBVyxLQUFYO0FBQ0QsQ0FITTs7QUFLUDs7OztBQUlPLE1BQU1pQiwwQkFBU0MsT0FBTyxJQUFJVCxPQUFKLENBQVlVLE9BQU8sYUFBR0YsTUFBSCxDQUFVQyxHQUFWLEVBQWVDLEdBQWYsQ0FBbkIsQ0FBdEI7QUFDQSxNQUFNQyxzQkFBT25CLFVBQVUsYUFBR21CLElBQWIsRUFBbUIsTUFBbkIsQ0FBYjtBQUNBLE1BQU1DLHdCQUFRcEIsVUFBVSxhQUFHb0IsS0FBYixFQUFvQixPQUFwQixDQUFkO0FBQ0EsTUFBTUMsOEJBQVdyQixVQUFVLGFBQUdzQixJQUFiLEVBQW1CLE1BQW5CLENBQWpCO0FBQ0EsTUFBTUMsNEJBQVV2QixVQUFVLGFBQUd1QixPQUFiLEVBQXNCLFNBQXRCLENBQWhCO0FBQ0EsTUFBTUMsOEJBQVd4QixVQUFVLGFBQUd3QixRQUFiLEVBQXVCLFVBQXZCLENBQWpCO0FBQ0EsTUFBTUMsZ0NBQVl6QixVQUFVLGFBQUd5QixTQUFiLEVBQXdCLFdBQXhCLENBQWxCOztBQUVQOzs7QUFHTyxNQUFNQyw0QkFBVSxNQUFNLElBQUlsQixPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQzVELGdCQUFJaUIsSUFBSixDQUFTLENBQUNkLEdBQUQsRUFBTWUsTUFBTixFQUFjQyxFQUFkLEtBQXFCO0FBQzVCLFFBQUloQixHQUFKLEVBQVNILE9BQU9HLEdBQVAsRUFBVCxLQUNLSixRQUFRLENBQUNvQixFQUFELEVBQUtELE1BQUwsQ0FBUjtBQUNOLEdBSEQ7QUFJRCxDQUw0QixDQUF0Qjs7QUFPUDs7O0FBR08sTUFBTUUsMEJBQVMsZUFBSyxPQUFPQyxTQUFQLEVBQWtCQyxHQUFsQixLQUEwQjtBQUNuRDtBQUNBRCxjQUFZQSxVQUFVRSxLQUFWLENBQWdCLGVBQUtDLEdBQXJCLENBQVo7O0FBRUE7QUFDQSxPQUFLLElBQUlqQixHQUFULElBQWdCYyxTQUFoQixFQUEyQjtBQUN6QixRQUFJZCxHQUFKLEVBQVM7QUFDUCxVQUFJO0FBQ0YsY0FBTUcsTUFBTVksTUFBTSxlQUFLRSxHQUFYLEdBQWlCakIsR0FBdkIsQ0FBTjtBQUNELE9BRkQsQ0FFRSxPQUFPSixHQUFQLEVBQVk7QUFDWixZQUFJc0IsT0FBT3RCLEdBQVAsRUFBWXVCLE9BQVosQ0FBb0IsUUFBcEIsTUFBa0MsQ0FBQyxDQUF2QyxFQUEwQztBQUN4QyxnQkFBTXZCLEdBQU47QUFDRDtBQUNGO0FBQ0Y7O0FBRURtQixXQUFPLGVBQUtFLEdBQUwsR0FBV2pCLEdBQWxCO0FBQ0Q7QUFDRixDQWxCcUIsQ0FBZiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2ZzLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCB0bXAgZnJvbSAndG1wJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGZuIGFzIHdyYXAgfSBmcm9tICcuLi91dGlscydcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvbG9nJykoJ2hvcHA6ZnMnKVxuXG5sZXQgdXNlQ2FjaGUgPSB0cnVlXG5cbi8qKlxuICogU2ltaWxhciB0byBibHVlYmlyZCdzIFByb21pc2UucHJvbWlzaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGFzeW5jLWNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRyYW5zZm9ybVxuICogQHJldHVybiB7RnVuY3Rpb259IGEgbmV3IHByb21pc2UtYmFzZWQgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGZuLCBuYW1lKSB7XG4gIC8qKlxuICAgKiBDcmVhdGUgZnVuY3Rpb24gY2FsbCB3cmFwcGVyLlxuICAgKi9cbiAgY29uc3QgZm5DYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBkZWJ1ZygnJXMoJWopJywgbmFtZSwgYXJncylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJncy5jb25jYXQoW2Z1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgZWxzZSByZXNvbHZlLmFwcGx5KG51bGwsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcbiAgICAgIH1dKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBkZXRlcm1pbmlzdGljIHdyYXBwZXIuXG4gICAqL1xuICBjb25zdCBjYWNoZUNhbGwgPSB3cmFwKGZuQ2FsbClcblxuICAvKipcbiAgICogUmV0dXJuIGNvbmRpdGlvbmFsIGNhY2hlLlxuICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodXNlQ2FjaGUpIHJldHVybiBjYWNoZUNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiBmbkNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG5cbi8qKlxuICogQWxsb3cgZGlzYWJsaW5nIG9mIGNhY2hlLlxuICovXG5leHBvcnQgY29uc3QgZGlzYWJsZUZTQ2FjaGUgPSAoKSA9PiB7XG4gIGRlYnVnKCdEaXNhYmxpbmcgZnMgY2FjaGUnKVxuICB1c2VDYWNoZSA9IGZhbHNlXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIG9ubHkgbmVlZGVkIG1ldGhvZHMgKGluc3RlYWQgb2YgdXNpbmcgbXpcbiAqIG9yIGRvaW5nIGEgcHJvbWlzaWZ5QWxsKS5cbiAqL1xuZXhwb3J0IGNvbnN0IGV4aXN0cyA9IGRpciA9PiBuZXcgUHJvbWlzZShyZXMgPT4gZnMuZXhpc3RzKGRpciwgcmVzKSlcbmV4cG9ydCBjb25zdCBzdGF0ID0gcHJvbWlzaWZ5KGZzLnN0YXQsICdzdGF0JylcbmV4cG9ydCBjb25zdCBta2RpciA9IHByb21pc2lmeShmcy5ta2RpciwgJ21rZGlyJylcbmV4cG9ydCBjb25zdCBvcGVuRmlsZSA9IHByb21pc2lmeShmcy5vcGVuLCAnb3BlbicpXG5leHBvcnQgY29uc3QgcmVhZGRpciA9IHByb21pc2lmeShmcy5yZWFkZGlyLCAncmVhZGRpcicpXG5leHBvcnQgY29uc3QgcmVhZEZpbGUgPSBwcm9taXNpZnkoZnMucmVhZEZpbGUsICdyZWFkRmlsZScpXG5leHBvcnQgY29uc3Qgd3JpdGVGaWxlID0gcHJvbWlzaWZ5KGZzLndyaXRlRmlsZSwgJ3dyaXRlRmlsZScpXG5cbi8qKlxuICogQ3JlYXRlIHRlbXBvcmFyeSBmaWxlLlxuICovXG5leHBvcnQgY29uc3QgdG1wRmlsZSA9ICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgdG1wLmZpbGUoKGVyciwgZmRwYXRoLCBmZCkgPT4ge1xuICAgIGlmIChlcnIpIHJlamVjdChlcnIpXG4gICAgZWxzZSByZXNvbHZlKFtmZCwgZmRwYXRoXSlcbiAgfSlcbn0pXG5cbi8qKlxuICogbWtkaXIgLXBcbiAqL1xuZXhwb3J0IGNvbnN0IG1rZGlycCA9IHdyYXAoYXN5bmMgKGRpcmVjdG9yeSwgY3dkKSA9PiB7XG4gIC8vIGV4cGxvZGUgaW50byBzZXBhcmF0ZVxuICBkaXJlY3RvcnkgPSBkaXJlY3Rvcnkuc3BsaXQocGF0aC5zZXApXG5cbiAgLy8gd2Fsa1xuICBmb3IgKGxldCBkaXIgb2YgZGlyZWN0b3J5KSB7XG4gICAgaWYgKGRpcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbWtkaXIoY3dkICsgcGF0aC5zZXAgKyBkaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKFN0cmluZyhlcnIpLmluZGV4T2YoJ0VFWElTVCcpID09PSAtMSkge1xuICAgICAgICAgIHRocm93IGVyclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3dkICs9IHBhdGguc2VwICsgZGlyXG4gIH1cbn0pIl19