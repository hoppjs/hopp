'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.val = exports.load = undefined;

var _fs = require('./fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/cache/load.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
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
    return lock = {};
  }

  // load lock file
  debug('Loading cache');
  try {
    return lock = JSON.parse((await (0, _fs.readFile)(lockfile, 'utf8')));
  } catch (_) {
    log('Corrupted cache; ejecting.');
    return lock = {};
  }
};

/**
 * Adds/replaces a value in the cache.
 * @param {String} key
 * @param {Any} value anything stringifiable
 */
const val = exports.val = (key, value) => {
  if (value === undefined) {
    return lock[key];
  }

  lock[key] = value;
};

/**
 * Saves the lockfile again.
 * @param {*} directory 
 */
const save = exports.save = async directory => {
  debug('Saving cache');
  await (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJKU09OIiwicGFyc2UiLCJfIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJzYXZlIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBT0E7Ozs7OztBQWJBOzs7Ozs7QUFlQSxNQUFNLEVBQUVBLEtBQUYsRUFBU0MsR0FBVCxLQUFpQkMsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLENBQXZCO0FBQ0EsSUFBSUMsSUFBSjs7QUFFQTs7Ozs7QUFLTyxNQUFNQyxzQkFBTyxNQUFNQyxTQUFOLElBQW1CO0FBQ3JDO0FBQ0EsTUFBSUYsSUFBSixFQUFVLE9BQU9BLElBQVA7O0FBRVY7QUFDQSxNQUFJLE9BQU9FLFNBQVAsS0FBcUIsUUFBckIsSUFBaUMsRUFBQyxNQUFNLGdCQUFPQSxTQUFQLENBQVAsQ0FBckMsRUFBK0Q7QUFDN0QsVUFBTSxJQUFJQyxLQUFKLENBQVUsOEJBQThCRCxTQUF4QyxDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFNRSxXQUFZLEdBQUVGLFNBQVUsWUFBOUI7O0FBRUE7QUFDQSxNQUFJLEVBQUMsTUFBTSxnQkFBT0UsUUFBUCxDQUFQLENBQUosRUFBNkI7QUFDM0IsV0FBUUosT0FBTyxFQUFmO0FBQ0Q7O0FBRUQ7QUFDQUgsUUFBTSxlQUFOO0FBQ0EsTUFBSTtBQUNGLFdBQVFHLE9BQU9LLEtBQUtDLEtBQUwsRUFBVyxNQUFNLGtCQUFTRixRQUFULEVBQW1CLE1BQW5CLENBQWpCLEVBQWY7QUFDRCxHQUZELENBRUUsT0FBT0csQ0FBUCxFQUFVO0FBQ1ZULFFBQUksNEJBQUo7QUFDQSxXQUFRRSxPQUFPLEVBQWY7QUFDRDtBQUNGLENBekJNOztBQTJCUDs7Ozs7QUFLTyxNQUFNUSxvQkFBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sS0FBZ0I7QUFDakMsTUFBSUEsVUFBVUMsU0FBZCxFQUF5QjtBQUN2QixXQUFPWCxLQUFLUyxHQUFMLENBQVA7QUFDRDs7QUFFRFQsT0FBS1MsR0FBTCxJQUFZQyxLQUFaO0FBQ0QsQ0FOTTs7QUFRUDs7OztBQUlPLE1BQU1FLHNCQUFPLE1BQU1WLFNBQU4sSUFBbUI7QUFDckNMLFFBQU0sY0FBTjtBQUNBLFFBQU0sbUJBQVVLLFlBQVksWUFBdEIsRUFBb0NHLEtBQUtRLFNBQUwsQ0FBZWIsSUFBZixDQUFwQyxDQUFOO0FBQ0QsQ0FITSIsImZpbGUiOiJjYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2NhY2hlL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHtcbiAgc3RhdCxcbiAgbWtkaXIsXG4gIGV4aXN0cyxcbiAgcmVhZEZpbGUsXG4gIHdyaXRlRmlsZSxcbn0gZnJvbSAnLi9mcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmNvbnN0IHsgZGVidWcsIGxvZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5sZXQgbG9ja1xuXG4vKipcbiAqIExvYWRzIGEgY2FjaGUgZnJvbSB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3RvcnkgcHJvamVjdCBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIGxvYWRlZCBjYWNoZVxuICovXG5leHBvcnQgY29uc3QgbG9hZCA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIC8vIHNlbmQgYmFjayBpbnRlcm5hbCBjYWNoZSBpZiByZWxvYWRpbmdcbiAgaWYgKGxvY2spIHJldHVybiBsb2NrXG5cbiAgLy8gdmVyaWZ5IGRpcmVjdG9yeVxuICBpZiAodHlwZW9mIGRpcmVjdG9yeSAhPT0gJ3N0cmluZycgfHwgIWF3YWl0IGV4aXN0cyhkaXJlY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdG9yeSBnaXZlbjogJyArIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8vIHNldCBjYWNoZSBmaWxlXG4gIGNvbnN0IGxvY2tmaWxlID0gYCR7ZGlyZWN0b3J5fS9ob3BwLmxvY2tgXG5cbiAgLy8gYnJpbmcgY2FjaGUgaW50byBleGlzdGVuY2VcbiAgaWYgKCFhd2FpdCBleGlzdHMobG9ja2ZpbGUpKSB7XG4gICAgcmV0dXJuIChsb2NrID0ge30pXG4gIH1cblxuICAvLyBsb2FkIGxvY2sgZmlsZVxuICBkZWJ1ZygnTG9hZGluZyBjYWNoZScpXG4gIHRyeSB7XG4gICAgcmV0dXJuIChsb2NrID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShsb2NrZmlsZSwgJ3V0ZjgnKSkpXG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBsb2coJ0NvcnJ1cHRlZCBjYWNoZTsgZWplY3RpbmcuJylcbiAgICByZXR1cm4gKGxvY2sgPSB7fSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMvcmVwbGFjZXMgYSB2YWx1ZSBpbiB0aGUgY2FjaGUuXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge0FueX0gdmFsdWUgYW55dGhpbmcgc3RyaW5naWZpYWJsZVxuICovXG5leHBvcnQgY29uc3QgdmFsID0gKGtleSwgdmFsdWUpID0+IHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbG9ja1trZXldXG4gIH1cbiAgXG4gIGxvY2tba2V5XSA9IHZhbHVlXG59XG5cbi8qKlxuICogU2F2ZXMgdGhlIGxvY2tmaWxlIGFnYWluLlxuICogQHBhcmFtIHsqfSBkaXJlY3RvcnkgXG4gKi9cbmV4cG9ydCBjb25zdCBzYXZlID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgZGVidWcoJ1NhdmluZyBjYWNoZScpXG4gIGF3YWl0IHdyaXRlRmlsZShkaXJlY3RvcnkgKyAnL2hvcHAubG9jaycsIEpTT04uc3RyaW5naWZ5KGxvY2spKVxufSJdfQ==