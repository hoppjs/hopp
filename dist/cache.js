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
 * Creates a new cache.
 * @param {String} lockfile location of lockfile
 * @return {Object} contents of new cache
 */
async function createCache(lockfile) {
  debug('Creating empty cache'

  // return empty cache
  );return lock = {
    s: {}
  };
}

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
    return await createCache(lockfile);
  }

  // load lock file
  debug('Loading cache');
  try {
    return lock = JSON.parse((await (0, _fs.readFile)(lockfile, 'utf8')));
  } catch (_) {
    log('Corrupted cache; ejecting.');
    return await createCache(lockfile);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwiY3JlYXRlQ2FjaGUiLCJsb2NrZmlsZSIsInMiLCJsb2FkIiwiZGlyZWN0b3J5IiwiRXJyb3IiLCJKU09OIiwicGFyc2UiLCJfIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJzYXZlIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBT0E7Ozs7OztBQWJBOzs7Ozs7QUFlQSxNQUFNLEVBQUVBLEtBQUYsRUFBU0MsR0FBVCxLQUFpQkMsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLENBQXZCO0FBQ0EsSUFBSUMsSUFBSjs7QUFFQTs7Ozs7QUFLQSxlQUFlQyxXQUFmLENBQTRCQyxRQUE1QixFQUF1QztBQUNyQ0wsUUFBTTs7QUFFTjtBQUZBLElBR0EsT0FBUUcsT0FBTztBQUNiRyxPQUFHO0FBRFUsR0FBZjtBQUdEOztBQUVEOzs7OztBQUtPLE1BQU1DLHNCQUFPLE1BQU1DLFNBQU4sSUFBbUI7QUFDckM7QUFDQSxNQUFJTCxJQUFKLEVBQVUsT0FBT0EsSUFBUDs7QUFFVjtBQUNBLE1BQUksT0FBT0ssU0FBUCxLQUFxQixRQUFyQixJQUFpQyxFQUFDLE1BQU0sZ0JBQU9BLFNBQVAsQ0FBUCxDQUFyQyxFQUErRDtBQUM3RCxVQUFNLElBQUlDLEtBQUosQ0FBVSw4QkFBOEJELFNBQXhDLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1ILFdBQVksR0FBRUcsU0FBVSxZQUE5Qjs7QUFFQTtBQUNBLE1BQUksRUFBQyxNQUFNLGdCQUFPSCxRQUFQLENBQVAsQ0FBSixFQUE2QjtBQUMzQixXQUFPLE1BQU1ELFlBQVlDLFFBQVosQ0FBYjtBQUNEOztBQUVEO0FBQ0FMLFFBQU0sZUFBTjtBQUNBLE1BQUk7QUFDRixXQUFRRyxPQUFPTyxLQUFLQyxLQUFMLEVBQVcsTUFBTSxrQkFBU04sUUFBVCxFQUFtQixNQUFuQixDQUFqQixFQUFmO0FBQ0QsR0FGRCxDQUVFLE9BQU9PLENBQVAsRUFBVTtBQUNWWCxRQUFJLDRCQUFKO0FBQ0EsV0FBTyxNQUFNRyxZQUFZQyxRQUFaLENBQWI7QUFDRDtBQUNGLENBekJNOztBQTJCUDs7Ozs7QUFLTyxNQUFNUSxvQkFBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sS0FBZ0I7QUFDakMsTUFBSUEsVUFBVUMsU0FBZCxFQUF5QjtBQUN2QixXQUFPYixLQUFLVyxHQUFMLENBQVA7QUFDRDs7QUFFRFgsT0FBS1csR0FBTCxJQUFZQyxLQUFaO0FBQ0QsQ0FOTTs7QUFRUDs7OztBQUlPLE1BQU1FLHNCQUFPLE1BQU1ULFNBQU4sSUFBbUI7QUFDckNSLFFBQU0sY0FBTjtBQUNBLFFBQU0sbUJBQVVRLFlBQVksWUFBdEIsRUFBb0NFLEtBQUtRLFNBQUwsQ0FBZWYsSUFBZixDQUFwQyxDQUFOO0FBQ0QsQ0FITSIsImZpbGUiOiJjYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2NhY2hlL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHtcbiAgc3RhdCxcbiAgbWtkaXIsXG4gIGV4aXN0cyxcbiAgcmVhZEZpbGUsXG4gIHdyaXRlRmlsZSxcbn0gZnJvbSAnLi9mcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmNvbnN0IHsgZGVidWcsIGxvZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5sZXQgbG9ja1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgY2FjaGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9ja2ZpbGUgbG9jYXRpb24gb2YgbG9ja2ZpbGVcbiAqIEByZXR1cm4ge09iamVjdH0gY29udGVudHMgb2YgbmV3IGNhY2hlXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNhY2hlKCBsb2NrZmlsZSApIHtcbiAgZGVidWcoJ0NyZWF0aW5nIGVtcHR5IGNhY2hlJylcblxuICAvLyByZXR1cm4gZW1wdHkgY2FjaGVcbiAgcmV0dXJuIChsb2NrID0ge1xuICAgIHM6IHt9XG4gIH0pXG59XG5cbi8qKlxuICogTG9hZHMgYSBjYWNoZSBmcm9tIHRoZSBwcm9qZWN0LlxuICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdG9yeSBwcm9qZWN0IGRpcmVjdG9yeVxuICogQHJldHVybiB7T2JqZWN0fSB0aGUgbG9hZGVkIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgLy8gc2VuZCBiYWNrIGludGVybmFsIGNhY2hlIGlmIHJlbG9hZGluZ1xuICBpZiAobG9jaykgcmV0dXJuIGxvY2tcblxuICAvLyB2ZXJpZnkgZGlyZWN0b3J5XG4gIGlmICh0eXBlb2YgZGlyZWN0b3J5ICE9PSAnc3RyaW5nJyB8fCAhYXdhaXQgZXhpc3RzKGRpcmVjdG9yeSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGlyZWN0b3J5IGdpdmVuOiAnICsgZGlyZWN0b3J5KVxuICB9XG5cbiAgLy8gc2V0IGNhY2hlIGZpbGVcbiAgY29uc3QgbG9ja2ZpbGUgPSBgJHtkaXJlY3Rvcnl9L2hvcHAubG9ja2BcblxuICAvLyBicmluZyBjYWNoZSBpbnRvIGV4aXN0ZW5jZVxuICBpZiAoIWF3YWl0IGV4aXN0cyhsb2NrZmlsZSkpIHtcbiAgICByZXR1cm4gYXdhaXQgY3JlYXRlQ2FjaGUobG9ja2ZpbGUpXG4gIH1cblxuICAvLyBsb2FkIGxvY2sgZmlsZVxuICBkZWJ1ZygnTG9hZGluZyBjYWNoZScpXG4gIHRyeSB7XG4gICAgcmV0dXJuIChsb2NrID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShsb2NrZmlsZSwgJ3V0ZjgnKSkpXG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBsb2coJ0NvcnJ1cHRlZCBjYWNoZTsgZWplY3RpbmcuJylcbiAgICByZXR1cm4gYXdhaXQgY3JlYXRlQ2FjaGUobG9ja2ZpbGUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzL3JlcGxhY2VzIGEgdmFsdWUgaW4gdGhlIGNhY2hlLlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtBbnl9IHZhbHVlIGFueXRoaW5nIHN0cmluZ2lmaWFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbCA9IChrZXksIHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGxvY2tba2V5XVxuICB9XG4gIFxuICBsb2NrW2tleV0gPSB2YWx1ZVxufVxuXG4vKipcbiAqIFNhdmVzIHRoZSBsb2NrZmlsZSBhZ2Fpbi5cbiAqIEBwYXJhbSB7Kn0gZGlyZWN0b3J5IFxuICovXG5leHBvcnQgY29uc3Qgc2F2ZSA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIGRlYnVnKCdTYXZpbmcgY2FjaGUnKVxuICBhd2FpdCB3cml0ZUZpbGUoZGlyZWN0b3J5ICsgJy9ob3BwLmxvY2snLCBKU09OLnN0cmluZ2lmeShsb2NrKSlcbn0iXX0=