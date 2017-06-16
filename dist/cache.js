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
 * Creates a new cache (overwrites existing).
 * @param {String} lockfile location of lockfile
 * @return {Object} contents of new cache
 */
async function createCache(lockfile) {
  debug('Creating empty cache'

  // write empty cache
  );await (0, _fs.writeFile)(lockfile, '{"s":{}}'

  // return the empty cache
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwiY3JlYXRlQ2FjaGUiLCJsb2NrZmlsZSIsInMiLCJsb2FkIiwiZGlyZWN0b3J5IiwiRXJyb3IiLCJKU09OIiwicGFyc2UiLCJfIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJzYXZlIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBT0E7Ozs7OztBQWJBOzs7Ozs7QUFlQSxNQUFNLEVBQUVBLEtBQUYsRUFBU0MsR0FBVCxLQUFpQkMsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLENBQXZCO0FBQ0EsSUFBSUMsSUFBSjs7QUFFQTs7Ozs7QUFLQSxlQUFlQyxXQUFmLENBQTRCQyxRQUE1QixFQUF1QztBQUNyQ0wsUUFBTTs7QUFFTjtBQUZBLElBR0EsTUFBTSxtQkFBVUssUUFBVixFQUFvQjs7QUFFMUI7QUFGTSxHQUFOLENBR0EsT0FBUUYsT0FBTztBQUNiRyxPQUFHO0FBRFUsR0FBZjtBQUdEOztBQUVEOzs7OztBQUtPLE1BQU1DLHNCQUFPLE1BQU1DLFNBQU4sSUFBbUI7QUFDckM7QUFDQSxNQUFJTCxJQUFKLEVBQVUsT0FBT0EsSUFBUDs7QUFFVjtBQUNBLE1BQUksT0FBT0ssU0FBUCxLQUFxQixRQUFyQixJQUFpQyxFQUFDLE1BQU0sZ0JBQU9BLFNBQVAsQ0FBUCxDQUFyQyxFQUErRDtBQUM3RCxVQUFNLElBQUlDLEtBQUosQ0FBVSw4QkFBOEJELFNBQXhDLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1ILFdBQVksR0FBRUcsU0FBVSxZQUE5Qjs7QUFFQTtBQUNBLE1BQUksRUFBQyxNQUFNLGdCQUFPSCxRQUFQLENBQVAsQ0FBSixFQUE2QjtBQUMzQixXQUFPLE1BQU1ELFlBQVlDLFFBQVosQ0FBYjtBQUNEOztBQUVEO0FBQ0FMLFFBQU0sZUFBTjtBQUNBLE1BQUk7QUFDRixXQUFRRyxPQUFPTyxLQUFLQyxLQUFMLEVBQVcsTUFBTSxrQkFBU04sUUFBVCxFQUFtQixNQUFuQixDQUFqQixFQUFmO0FBQ0QsR0FGRCxDQUVFLE9BQU9PLENBQVAsRUFBVTtBQUNWWCxRQUFJLDRCQUFKO0FBQ0EsV0FBTyxNQUFNRyxZQUFZQyxRQUFaLENBQWI7QUFDRDtBQUNGLENBekJNOztBQTJCUDs7Ozs7QUFLTyxNQUFNUSxvQkFBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sS0FBZ0I7QUFDakMsTUFBSUEsVUFBVUMsU0FBZCxFQUF5QjtBQUN2QixXQUFPYixLQUFLVyxHQUFMLENBQVA7QUFDRDs7QUFFRFgsT0FBS1csR0FBTCxJQUFZQyxLQUFaO0FBQ0QsQ0FOTTs7QUFRUDs7OztBQUlPLE1BQU1FLHNCQUFPLE1BQU1ULFNBQU4sSUFBbUI7QUFDckNSLFFBQU0sY0FBTjtBQUNBLFFBQU0sbUJBQVVRLFlBQVksWUFBdEIsRUFBb0NFLEtBQUtRLFNBQUwsQ0FBZWYsSUFBZixDQUFwQyxDQUFOO0FBQ0QsQ0FITSIsImZpbGUiOiJjYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2NhY2hlL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHtcbiAgc3RhdCxcbiAgbWtkaXIsXG4gIGV4aXN0cyxcbiAgcmVhZEZpbGUsXG4gIHdyaXRlRmlsZSxcbn0gZnJvbSAnLi9mcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmNvbnN0IHsgZGVidWcsIGxvZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5sZXQgbG9ja1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgY2FjaGUgKG92ZXJ3cml0ZXMgZXhpc3RpbmcpLlxuICogQHBhcmFtIHtTdHJpbmd9IGxvY2tmaWxlIGxvY2F0aW9uIG9mIGxvY2tmaWxlXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNvbnRlbnRzIG9mIG5ldyBjYWNoZVxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVDYWNoZSggbG9ja2ZpbGUgKSB7XG4gIGRlYnVnKCdDcmVhdGluZyBlbXB0eSBjYWNoZScpXG5cbiAgLy8gd3JpdGUgZW1wdHkgY2FjaGVcbiAgYXdhaXQgd3JpdGVGaWxlKGxvY2tmaWxlLCAne1wic1wiOnt9fScpXG5cbiAgLy8gcmV0dXJuIHRoZSBlbXB0eSBjYWNoZVxuICByZXR1cm4gKGxvY2sgPSB7XG4gICAgczoge31cbiAgfSlcbn1cblxuLyoqXG4gKiBMb2FkcyBhIGNhY2hlIGZyb20gdGhlIHByb2plY3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0b3J5IHByb2plY3QgZGlyZWN0b3J5XG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBsb2FkZWQgY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWQgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICAvLyBzZW5kIGJhY2sgaW50ZXJuYWwgY2FjaGUgaWYgcmVsb2FkaW5nXG4gIGlmIChsb2NrKSByZXR1cm4gbG9ja1xuXG4gIC8vIHZlcmlmeSBkaXJlY3RvcnlcbiAgaWYgKHR5cGVvZiBkaXJlY3RvcnkgIT09ICdzdHJpbmcnIHx8ICFhd2FpdCBleGlzdHMoZGlyZWN0b3J5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkaXJlY3RvcnkgZ2l2ZW46ICcgKyBkaXJlY3RvcnkpXG4gIH1cblxuICAvLyBzZXQgY2FjaGUgZmlsZVxuICBjb25zdCBsb2NrZmlsZSA9IGAke2RpcmVjdG9yeX0vaG9wcC5sb2NrYFxuXG4gIC8vIGJyaW5nIGNhY2hlIGludG8gZXhpc3RlbmNlXG4gIGlmICghYXdhaXQgZXhpc3RzKGxvY2tmaWxlKSkge1xuICAgIHJldHVybiBhd2FpdCBjcmVhdGVDYWNoZShsb2NrZmlsZSlcbiAgfVxuXG4gIC8vIGxvYWQgbG9jayBmaWxlXG4gIGRlYnVnKCdMb2FkaW5nIGNhY2hlJylcbiAgdHJ5IHtcbiAgICByZXR1cm4gKGxvY2sgPSBKU09OLnBhcnNlKGF3YWl0IHJlYWRGaWxlKGxvY2tmaWxlLCAndXRmOCcpKSlcbiAgfSBjYXRjaCAoXykge1xuICAgIGxvZygnQ29ycnVwdGVkIGNhY2hlOyBlamVjdGluZy4nKVxuICAgIHJldHVybiBhd2FpdCBjcmVhdGVDYWNoZShsb2NrZmlsZSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMvcmVwbGFjZXMgYSB2YWx1ZSBpbiB0aGUgY2FjaGUuXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge0FueX0gdmFsdWUgYW55dGhpbmcgc3RyaW5naWZpYWJsZVxuICovXG5leHBvcnQgY29uc3QgdmFsID0gKGtleSwgdmFsdWUpID0+IHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbG9ja1trZXldXG4gIH1cbiAgXG4gIGxvY2tba2V5XSA9IHZhbHVlXG59XG5cbi8qKlxuICogU2F2ZXMgdGhlIGxvY2tmaWxlIGFnYWluLlxuICogQHBhcmFtIHsqfSBkaXJlY3RvcnkgXG4gKi9cbmV4cG9ydCBjb25zdCBzYXZlID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgZGVidWcoJ1NhdmluZyBjYWNoZScpXG4gIGF3YWl0IHdyaXRlRmlsZShkaXJlY3RvcnkgKyAnL2hvcHAubG9jaycsIEpTT04uc3RyaW5naWZ5KGxvY2spKVxufSJdfQ==