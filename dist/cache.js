'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.plugin = exports.val = exports.load = undefined;

var _fs = require('./fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/cache/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const { debug, log } = require('./utils/log')('hopp');
let lock;

/**
 * Loads a cache from the project.
 * @param {String} directory project directory
 * @return {Object} the loaded cache
 */
const load = exports.load = async directory => {
  // send back internal cache if reloading
  if (lock) return lock;

  // verify directory
  if (typeof directory !== 'string' || !(await (0, _fs.exists)(directory))) {
    throw new Error('Invalid directory given: ' + directory);
  }

  // set cache file
  const lockfile = `${directory}/hopp.lock`;

  // bring cache into existence
  if (!(await (0, _fs.exists)(lockfile))) {
    return lock = { p: {} };
  }

  // load lock file
  debug('Loading cache');
  try {
    return lock = JSON.parse((await (0, _fs.readFile)(lockfile, 'utf8')));
  } catch (_) {
    log('Corrupted cache; ejecting.');
    return lock = { p: {} };
  }
};

/**
 * Adds/replaces a value in the cache.
 * @param {String} key
 * @param {Any} value anything stringifiable
 * @returns {Any?} value from cache
 */
const val = exports.val = (key, value) => {
  if (value === undefined) {
    return lock[key];
  }

  lock[key] = value;
};

/**
 * Load/create cache for a plugin.
 * @param {}
 */
const plugin = exports.plugin = pluginName => {
  const plugins = val('p');

  if (!plugins.hasOwnProperty(pluginName)) {
    plugins[pluginName] = {};
  }

  return plugins[pluginName];
};

/**
 * Get/set a sourcemap.
 * @param {String} taskName name of the task
 * @param {Object} sm sourcemap to save for the task
 * @returns {Object} sourcemap from cache
 */
const sourcemap = exports.sourcemap = (taskName, sm) => {
  let sourcemap = val('sm');

  if (!sourcemap) {
    val('sm', sourcemap = {});
  }

  if (sm) {
    sourcemap[taskName] = sm;
  } else {
    sourcemap[taskName] = sourcemap[taskName] || {};
  }

  return sourcemap;
};

/**
 * Saves the lockfile again.
 * @param {*} directory 
 */
const save = exports.save = async directory => {
  debug('Saving cache');
  await (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJwIiwiSlNPTiIsInBhcnNlIiwiXyIsInZhbCIsImtleSIsInZhbHVlIiwidW5kZWZpbmVkIiwicGx1Z2luIiwicGx1Z2luTmFtZSIsInBsdWdpbnMiLCJoYXNPd25Qcm9wZXJ0eSIsInNvdXJjZW1hcCIsInRhc2tOYW1lIiwic20iLCJzYXZlIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBT0E7Ozs7OztBQWJBOzs7Ozs7QUFlQSxNQUFNLEVBQUVBLEtBQUYsRUFBU0MsR0FBVCxLQUFpQkMsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLENBQXZCO0FBQ0EsSUFBSUMsSUFBSjs7QUFFQTs7Ozs7QUFLTyxNQUFNQyxzQkFBTyxNQUFNQyxTQUFOLElBQW1CO0FBQ3JDO0FBQ0EsTUFBSUYsSUFBSixFQUFVLE9BQU9BLElBQVA7O0FBRVY7QUFDQSxNQUFJLE9BQU9FLFNBQVAsS0FBcUIsUUFBckIsSUFBaUMsRUFBQyxNQUFNLGdCQUFPQSxTQUFQLENBQVAsQ0FBckMsRUFBK0Q7QUFDN0QsVUFBTSxJQUFJQyxLQUFKLENBQVUsOEJBQThCRCxTQUF4QyxDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFNRSxXQUFZLEdBQUVGLFNBQVUsWUFBOUI7O0FBRUE7QUFDQSxNQUFJLEVBQUMsTUFBTSxnQkFBT0UsUUFBUCxDQUFQLENBQUosRUFBNkI7QUFDM0IsV0FBUUosT0FBTyxFQUFDSyxHQUFFLEVBQUgsRUFBZjtBQUNEOztBQUVEO0FBQ0FSLFFBQU0sZUFBTjtBQUNBLE1BQUk7QUFDRixXQUFRRyxPQUFPTSxLQUFLQyxLQUFMLEVBQVcsTUFBTSxrQkFBU0gsUUFBVCxFQUFtQixNQUFuQixDQUFqQixFQUFmO0FBQ0QsR0FGRCxDQUVFLE9BQU9JLENBQVAsRUFBVTtBQUNWVixRQUFJLDRCQUFKO0FBQ0EsV0FBUUUsT0FBTyxFQUFDSyxHQUFFLEVBQUgsRUFBZjtBQUNEO0FBQ0YsQ0F6Qk07O0FBMkJQOzs7Ozs7QUFNTyxNQUFNSSxvQkFBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sS0FBZ0I7QUFDakMsTUFBSUEsVUFBVUMsU0FBZCxFQUF5QjtBQUN2QixXQUFPWixLQUFLVSxHQUFMLENBQVA7QUFDRDs7QUFFRFYsT0FBS1UsR0FBTCxJQUFZQyxLQUFaO0FBQ0QsQ0FOTTs7QUFRUDs7OztBQUlPLE1BQU1FLDBCQUFTQyxjQUFjO0FBQ2xDLFFBQU1DLFVBQVVOLElBQUksR0FBSixDQUFoQjs7QUFFQSxNQUFJLENBQUNNLFFBQVFDLGNBQVIsQ0FBdUJGLFVBQXZCLENBQUwsRUFBeUM7QUFDdkNDLFlBQVFELFVBQVIsSUFBc0IsRUFBdEI7QUFDRDs7QUFFRCxTQUFPQyxRQUFRRCxVQUFSLENBQVA7QUFDRCxDQVJNOztBQVVQOzs7Ozs7QUFNTyxNQUFNRyxnQ0FBWSxDQUFDQyxRQUFELEVBQVdDLEVBQVgsS0FBa0I7QUFDekMsTUFBSUYsWUFBWVIsSUFBSSxJQUFKLENBQWhCOztBQUVBLE1BQUksQ0FBQ1EsU0FBTCxFQUFnQjtBQUNkUixRQUFJLElBQUosRUFBVVEsWUFBWSxFQUF0QjtBQUNEOztBQUVELE1BQUlFLEVBQUosRUFBUTtBQUNORixjQUFVQyxRQUFWLElBQXNCQyxFQUF0QjtBQUNELEdBRkQsTUFFTztBQUNMRixjQUFVQyxRQUFWLElBQXNCRCxVQUFVQyxRQUFWLEtBQXVCLEVBQTdDO0FBQ0Q7O0FBRUQsU0FBT0QsU0FBUDtBQUNELENBZE07O0FBZ0JQOzs7O0FBSU8sTUFBTUcsc0JBQU8sTUFBTWxCLFNBQU4sSUFBbUI7QUFDckNMLFFBQU0sY0FBTjtBQUNBLFFBQU0sbUJBQVVLLFlBQVksWUFBdEIsRUFBb0NJLEtBQUtlLFNBQUwsQ0FBZXJCLElBQWYsQ0FBcEMsQ0FBTjtBQUNELENBSE0iLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9jYWNoZS9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCB7XG4gIHN0YXQsXG4gIG1rZGlyLFxuICBleGlzdHMsXG4gIHJlYWRGaWxlLFxuICB3cml0ZUZpbGUsXG59IGZyb20gJy4vZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCB7IGRlYnVnLCBsb2cgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxubGV0IGxvY2tcblxuLyoqXG4gKiBMb2FkcyBhIGNhY2hlIGZyb20gdGhlIHByb2plY3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0b3J5IHByb2plY3QgZGlyZWN0b3J5XG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBsb2FkZWQgY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWQgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICAvLyBzZW5kIGJhY2sgaW50ZXJuYWwgY2FjaGUgaWYgcmVsb2FkaW5nXG4gIGlmIChsb2NrKSByZXR1cm4gbG9ja1xuXG4gIC8vIHZlcmlmeSBkaXJlY3RvcnlcbiAgaWYgKHR5cGVvZiBkaXJlY3RvcnkgIT09ICdzdHJpbmcnIHx8ICFhd2FpdCBleGlzdHMoZGlyZWN0b3J5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkaXJlY3RvcnkgZ2l2ZW46ICcgKyBkaXJlY3RvcnkpXG4gIH1cblxuICAvLyBzZXQgY2FjaGUgZmlsZVxuICBjb25zdCBsb2NrZmlsZSA9IGAke2RpcmVjdG9yeX0vaG9wcC5sb2NrYFxuXG4gIC8vIGJyaW5nIGNhY2hlIGludG8gZXhpc3RlbmNlXG4gIGlmICghYXdhaXQgZXhpc3RzKGxvY2tmaWxlKSkge1xuICAgIHJldHVybiAobG9jayA9IHtwOnt9fSlcbiAgfVxuXG4gIC8vIGxvYWQgbG9jayBmaWxlXG4gIGRlYnVnKCdMb2FkaW5nIGNhY2hlJylcbiAgdHJ5IHtcbiAgICByZXR1cm4gKGxvY2sgPSBKU09OLnBhcnNlKGF3YWl0IHJlYWRGaWxlKGxvY2tmaWxlLCAndXRmOCcpKSlcbiAgfSBjYXRjaCAoXykge1xuICAgIGxvZygnQ29ycnVwdGVkIGNhY2hlOyBlamVjdGluZy4nKVxuICAgIHJldHVybiAobG9jayA9IHtwOnt9fSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMvcmVwbGFjZXMgYSB2YWx1ZSBpbiB0aGUgY2FjaGUuXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge0FueX0gdmFsdWUgYW55dGhpbmcgc3RyaW5naWZpYWJsZVxuICogQHJldHVybnMge0FueT99IHZhbHVlIGZyb20gY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbCA9IChrZXksIHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGxvY2tba2V5XVxuICB9XG4gIFxuICBsb2NrW2tleV0gPSB2YWx1ZVxufVxuXG4vKipcbiAqIExvYWQvY3JlYXRlIGNhY2hlIGZvciBhIHBsdWdpbi5cbiAqIEBwYXJhbSB7fVxuICovXG5leHBvcnQgY29uc3QgcGx1Z2luID0gcGx1Z2luTmFtZSA9PiB7XG4gIGNvbnN0IHBsdWdpbnMgPSB2YWwoJ3AnKVxuXG4gIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW5OYW1lKSkge1xuICAgIHBsdWdpbnNbcGx1Z2luTmFtZV0gPSB7fVxuICB9XG5cbiAgcmV0dXJuIHBsdWdpbnNbcGx1Z2luTmFtZV1cbn1cblxuLyoqXG4gKiBHZXQvc2V0IGEgc291cmNlbWFwLlxuICogQHBhcmFtIHtTdHJpbmd9IHRhc2tOYW1lIG5hbWUgb2YgdGhlIHRhc2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBzbSBzb3VyY2VtYXAgdG8gc2F2ZSBmb3IgdGhlIHRhc2tcbiAqIEByZXR1cm5zIHtPYmplY3R9IHNvdXJjZW1hcCBmcm9tIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCBzb3VyY2VtYXAgPSAodGFza05hbWUsIHNtKSA9PiB7XG4gIGxldCBzb3VyY2VtYXAgPSB2YWwoJ3NtJylcblxuICBpZiAoIXNvdXJjZW1hcCkge1xuICAgIHZhbCgnc20nLCBzb3VyY2VtYXAgPSB7fSlcbiAgfVxuXG4gIGlmIChzbSkge1xuICAgIHNvdXJjZW1hcFt0YXNrTmFtZV0gPSBzbVxuICB9IGVsc2Uge1xuICAgIHNvdXJjZW1hcFt0YXNrTmFtZV0gPSBzb3VyY2VtYXBbdGFza05hbWVdIHx8IHt9XG4gIH1cblxuICByZXR1cm4gc291cmNlbWFwXG59XG5cbi8qKlxuICogU2F2ZXMgdGhlIGxvY2tmaWxlIGFnYWluLlxuICogQHBhcmFtIHsqfSBkaXJlY3RvcnkgXG4gKi9cbmV4cG9ydCBjb25zdCBzYXZlID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgZGVidWcoJ1NhdmluZyBjYWNoZScpXG4gIGF3YWl0IHdyaXRlRmlsZShkaXJlY3RvcnkgKyAnL2hvcHAubG9jaycsIEpTT04uc3RyaW5naWZ5KGxvY2spKVxufVxuIl19