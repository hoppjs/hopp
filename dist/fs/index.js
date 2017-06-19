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

const { debug } = require('../utils/log')('hopp:fs'); /**
                                                       * @file src/fs.js
                                                       * @license MIT
                                                       * @copyright 2017 Karim Alibhai.
                                                       */

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
const readdir = exports.readdir = promisify(_fs2.default.readdir, 'readdir');
const readFile = exports.readFile = promisify(_fs2.default.readFile, 'readFile');
const writeFile = exports.writeFile = promisify(_fs2.default.writeFile, 'writeFile');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsInJlcXVpcmUiLCJ1c2VDYWNoZSIsInByb21pc2lmeSIsImZuIiwibmFtZSIsImZuQ2FsbCIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFwcGx5IiwiY29uY2F0IiwiZXJyIiwiY2FjaGVDYWxsIiwiZGlzYWJsZUZTQ2FjaGUiLCJleGlzdHMiLCJkaXIiLCJyZXMiLCJzdGF0IiwibWtkaXIiLCJyZWFkZGlyIiwicmVhZEZpbGUiLCJ3cml0ZUZpbGUiLCJta2RpcnAiLCJkaXJlY3RvcnkiLCJjd2QiLCJzcGxpdCIsInNlcCIsIlN0cmluZyIsImluZGV4T2YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQSxNQUFNLEVBQUVBLEtBQUYsS0FBWUMsUUFBUSxjQUFSLEVBQXdCLFNBQXhCLENBQWxCLEMsQ0FWQTs7Ozs7O0FBWUEsSUFBSUMsV0FBVyxJQUFmOztBQUVBOzs7OztBQUtBLFNBQVNDLFNBQVQsQ0FBbUJDLEVBQW5CLEVBQXVCQyxJQUF2QixFQUE2QjtBQUMzQjs7O0FBR0EsUUFBTUMsU0FBUyxZQUFZO0FBQ3pCLFVBQU1DLE9BQU8sR0FBR0MsS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsQ0FBYjtBQUNBVixVQUFNLFFBQU4sRUFBZ0JLLElBQWhCLEVBQXNCRSxJQUF0QjtBQUNBLFdBQU8sSUFBSUksT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUN0Q1QsU0FBR1UsS0FBSCxDQUFTLElBQVQsRUFBZVAsS0FBS1EsTUFBTCxDQUFZLENBQUMsVUFBVUMsR0FBVixFQUFlO0FBQ3pDLFlBQUlBLEdBQUosRUFBU0gsT0FBT0csR0FBUCxFQUFULEtBQ0tKLFFBQVFFLEtBQVIsQ0FBYyxJQUFkLEVBQW9CLEdBQUdOLEtBQUgsQ0FBU0MsSUFBVCxDQUFjQyxTQUFkLEVBQXlCLENBQXpCLENBQXBCO0FBQ04sT0FIMEIsQ0FBWixDQUFmO0FBSUQsS0FMTSxDQUFQO0FBTUQsR0FURDs7QUFXQTs7O0FBR0EsUUFBTU8sWUFBWSxlQUFLWCxNQUFMLENBQWxCOztBQUVBOzs7QUFHQSxTQUFPLFlBQVk7QUFDakIsUUFBSUosUUFBSixFQUFjLE9BQU9lLFVBQVVILEtBQVYsQ0FBZ0IsSUFBaEIsRUFBc0JKLFNBQXRCLENBQVA7QUFDZCxXQUFPSixPQUFPUSxLQUFQLENBQWEsSUFBYixFQUFtQkosU0FBbkIsQ0FBUDtBQUNELEdBSEQ7QUFJRDs7QUFFRDs7O0FBR08sTUFBTVEsMENBQWlCLE1BQU07QUFDbENsQixRQUFNLG9CQUFOO0FBQ0FFLGFBQVcsS0FBWDtBQUNELENBSE07O0FBS1A7Ozs7QUFJTyxNQUFNaUIsMEJBQVNDLE9BQU8sSUFBSVQsT0FBSixDQUFZVSxPQUFPLGFBQUdGLE1BQUgsQ0FBVUMsR0FBVixFQUFlQyxHQUFmLENBQW5CLENBQXRCO0FBQ0EsTUFBTUMsc0JBQU9uQixVQUFVLGFBQUdtQixJQUFiLEVBQW1CLE1BQW5CLENBQWI7QUFDQSxNQUFNQyx3QkFBUXBCLFVBQVUsYUFBR29CLEtBQWIsRUFBb0IsT0FBcEIsQ0FBZDtBQUNBLE1BQU1DLDRCQUFVckIsVUFBVSxhQUFHcUIsT0FBYixFQUFzQixTQUF0QixDQUFoQjtBQUNBLE1BQU1DLDhCQUFXdEIsVUFBVSxhQUFHc0IsUUFBYixFQUF1QixVQUF2QixDQUFqQjtBQUNBLE1BQU1DLGdDQUFZdkIsVUFBVSxhQUFHdUIsU0FBYixFQUF3QixXQUF4QixDQUFsQjs7QUFFUDs7O0FBR08sTUFBTUMsMEJBQVMsZUFBSyxPQUFPQyxTQUFQLEVBQWtCQyxHQUFsQixLQUEwQjtBQUNuRDtBQUNBRCxjQUFZQSxVQUFVRSxLQUFWLENBQWdCLGVBQUtDLEdBQXJCLENBQVo7O0FBRUE7QUFDQSxPQUFLLElBQUlYLEdBQVQsSUFBZ0JRLFNBQWhCLEVBQTJCO0FBQ3pCLFFBQUlSLEdBQUosRUFBUztBQUNQLFVBQUk7QUFDRixjQUFNRyxNQUFNTSxNQUFNLGVBQUtFLEdBQVgsR0FBaUJYLEdBQXZCLENBQU47QUFDRCxPQUZELENBRUUsT0FBT0osR0FBUCxFQUFZO0FBQ1osWUFBSWdCLE9BQU9oQixHQUFQLEVBQVlpQixPQUFaLENBQW9CLFFBQXBCLE1BQWtDLENBQUMsQ0FBdkMsRUFBMEM7QUFDeEMsZ0JBQU1qQixHQUFOO0FBQ0Q7QUFDRjtBQUNGOztBQUVEYSxXQUFPLGVBQUtFLEdBQUwsR0FBV1gsR0FBbEI7QUFDRDtBQUNGLENBbEJxQixDQUFmIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZnMuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGZuIGFzIHdyYXAgfSBmcm9tICcuLi91dGlscydcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvbG9nJykoJ2hvcHA6ZnMnKVxuXG5sZXQgdXNlQ2FjaGUgPSB0cnVlXG5cbi8qKlxuICogU2ltaWxhciB0byBibHVlYmlyZCdzIFByb21pc2UucHJvbWlzaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGFzeW5jLWNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRyYW5zZm9ybVxuICogQHJldHVybiB7RnVuY3Rpb259IGEgbmV3IHByb21pc2UtYmFzZWQgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGZuLCBuYW1lKSB7XG4gIC8qKlxuICAgKiBDcmVhdGUgZnVuY3Rpb24gY2FsbCB3cmFwcGVyLlxuICAgKi9cbiAgY29uc3QgZm5DYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBkZWJ1ZygnJXMoJWopJywgbmFtZSwgYXJncylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJncy5jb25jYXQoW2Z1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgZWxzZSByZXNvbHZlLmFwcGx5KG51bGwsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcbiAgICAgIH1dKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBkZXRlcm1pbmlzdGljIHdyYXBwZXIuXG4gICAqL1xuICBjb25zdCBjYWNoZUNhbGwgPSB3cmFwKGZuQ2FsbClcblxuICAvKipcbiAgICogUmV0dXJuIGNvbmRpdGlvbmFsIGNhY2hlLlxuICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodXNlQ2FjaGUpIHJldHVybiBjYWNoZUNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiBmbkNhbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG5cbi8qKlxuICogQWxsb3cgZGlzYWJsaW5nIG9mIGNhY2hlLlxuICovXG5leHBvcnQgY29uc3QgZGlzYWJsZUZTQ2FjaGUgPSAoKSA9PiB7XG4gIGRlYnVnKCdEaXNhYmxpbmcgZnMgY2FjaGUnKVxuICB1c2VDYWNoZSA9IGZhbHNlXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIG9ubHkgbmVlZGVkIG1ldGhvZHMgKGluc3RlYWQgb2YgdXNpbmcgbXpcbiAqIG9yIGRvaW5nIGEgcHJvbWlzaWZ5QWxsKS5cbiAqL1xuZXhwb3J0IGNvbnN0IGV4aXN0cyA9IGRpciA9PiBuZXcgUHJvbWlzZShyZXMgPT4gZnMuZXhpc3RzKGRpciwgcmVzKSlcbmV4cG9ydCBjb25zdCBzdGF0ID0gcHJvbWlzaWZ5KGZzLnN0YXQsICdzdGF0JylcbmV4cG9ydCBjb25zdCBta2RpciA9IHByb21pc2lmeShmcy5ta2RpciwgJ21rZGlyJylcbmV4cG9ydCBjb25zdCByZWFkZGlyID0gcHJvbWlzaWZ5KGZzLnJlYWRkaXIsICdyZWFkZGlyJylcbmV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHByb21pc2lmeShmcy5yZWFkRmlsZSwgJ3JlYWRGaWxlJylcbmV4cG9ydCBjb25zdCB3cml0ZUZpbGUgPSBwcm9taXNpZnkoZnMud3JpdGVGaWxlLCAnd3JpdGVGaWxlJylcblxuLyoqXG4gKiBta2RpciAtcFxuICovXG5leHBvcnQgY29uc3QgbWtkaXJwID0gd3JhcChhc3luYyAoZGlyZWN0b3J5LCBjd2QpID0+IHtcbiAgLy8gZXhwbG9kZSBpbnRvIHNlcGFyYXRlXG4gIGRpcmVjdG9yeSA9IGRpcmVjdG9yeS5zcGxpdChwYXRoLnNlcClcblxuICAvLyB3YWxrXG4gIGZvciAobGV0IGRpciBvZiBkaXJlY3RvcnkpIHtcbiAgICBpZiAoZGlyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBta2Rpcihjd2QgKyBwYXRoLnNlcCArIGRpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoU3RyaW5nKGVycikuaW5kZXhPZignRUVYSVNUJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjd2QgKz0gcGF0aC5zZXAgKyBkaXJcbiAgfVxufSkiXX0=