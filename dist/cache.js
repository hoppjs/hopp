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
  await (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwiY3JlYXRlQ2FjaGUiLCJsb2NrZmlsZSIsInMiLCJsb2FkIiwiZGlyZWN0b3J5IiwiRXJyb3IiLCJKU09OIiwicGFyc2UiLCJfIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJzYXZlIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBT0E7Ozs7OztBQWJBOzs7Ozs7QUFlQSxNQUFNLEVBQUVBLEtBQUYsRUFBU0MsR0FBVCxLQUFpQkMsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLENBQXZCO0FBQ0EsSUFBSUMsSUFBSjs7QUFFQTs7Ozs7QUFLQSxlQUFlQyxXQUFmLENBQTRCQyxRQUE1QixFQUF1QztBQUNyQ0wsUUFBTTs7QUFFTjtBQUZBLElBR0EsTUFBTSxtQkFBVUssUUFBVixFQUFvQjs7QUFFMUI7QUFGTSxHQUFOLENBR0EsT0FBUUYsT0FBTztBQUNiRyxPQUFHO0FBRFUsR0FBZjtBQUdEOztBQUVEOzs7OztBQUtPLE1BQU1DLHNCQUFPLE1BQU1DLFNBQU4sSUFBbUI7QUFDckM7QUFDQSxNQUFJTCxJQUFKLEVBQVUsT0FBT0EsSUFBUDs7QUFFVjtBQUNBLE1BQUksT0FBT0ssU0FBUCxLQUFxQixRQUFyQixJQUFpQyxFQUFDLE1BQU0sZ0JBQU9BLFNBQVAsQ0FBUCxDQUFyQyxFQUErRDtBQUM3RCxVQUFNLElBQUlDLEtBQUosQ0FBVSw4QkFBOEJELFNBQXhDLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1ILFdBQVksR0FBRUcsU0FBVSxZQUE5Qjs7QUFFQTtBQUNBLE1BQUksRUFBQyxNQUFNLGdCQUFPSCxRQUFQLENBQVAsQ0FBSixFQUE2QjtBQUMzQixXQUFPLE1BQU1ELFlBQVlDLFFBQVosQ0FBYjtBQUNEOztBQUVEO0FBQ0FMLFFBQU0sZUFBTjtBQUNBLE1BQUk7QUFDRixXQUFRRyxPQUFPTyxLQUFLQyxLQUFMLEVBQVcsTUFBTSxrQkFBU04sUUFBVCxFQUFtQixNQUFuQixDQUFqQixFQUFmO0FBQ0QsR0FGRCxDQUVFLE9BQU9PLENBQVAsRUFBVTtBQUNWWCxRQUFJLDRCQUFKO0FBQ0EsV0FBTyxNQUFNRyxZQUFZQyxRQUFaLENBQWI7QUFDRDtBQUNGLENBekJNOztBQTJCUDs7Ozs7QUFLTyxNQUFNUSxvQkFBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sS0FBZ0I7QUFDakMsTUFBSUEsVUFBVUMsU0FBZCxFQUF5QjtBQUN2QixXQUFPYixLQUFLVyxHQUFMLENBQVA7QUFDRDs7QUFFRFgsT0FBS1csR0FBTCxJQUFZQyxLQUFaO0FBQ0QsQ0FOTTs7QUFRUDs7OztBQUlPLE1BQU1FLHNCQUFPLE1BQU1ULFNBQU4sSUFBbUI7QUFDckMsUUFBTSxtQkFBVUEsWUFBWSxZQUF0QixFQUFvQ0UsS0FBS1EsU0FBTCxDQUFlZixJQUFmLENBQXBDLENBQU47QUFDRCxDQUZNIiwiZmlsZSI6ImNhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvY2FjaGUvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQge1xuICBzdGF0LFxuICBta2RpcixcbiAgZXhpc3RzLFxuICByZWFkRmlsZSxcbiAgd3JpdGVGaWxlLFxufSBmcm9tICcuL2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuY29uc3QgeyBkZWJ1ZywgbG9nIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcbmxldCBsb2NrXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBjYWNoZSAob3ZlcndyaXRlcyBleGlzdGluZykuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9ja2ZpbGUgbG9jYXRpb24gb2YgbG9ja2ZpbGVcbiAqIEByZXR1cm4ge09iamVjdH0gY29udGVudHMgb2YgbmV3IGNhY2hlXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNhY2hlKCBsb2NrZmlsZSApIHtcbiAgZGVidWcoJ0NyZWF0aW5nIGVtcHR5IGNhY2hlJylcblxuICAvLyB3cml0ZSBlbXB0eSBjYWNoZVxuICBhd2FpdCB3cml0ZUZpbGUobG9ja2ZpbGUsICd7XCJzXCI6e319JylcblxuICAvLyByZXR1cm4gdGhlIGVtcHR5IGNhY2hlXG4gIHJldHVybiAobG9jayA9IHtcbiAgICBzOiB7fVxuICB9KVxufVxuXG4vKipcbiAqIExvYWRzIGEgY2FjaGUgZnJvbSB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3RvcnkgcHJvamVjdCBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIGxvYWRlZCBjYWNoZVxuICovXG5leHBvcnQgY29uc3QgbG9hZCA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIC8vIHNlbmQgYmFjayBpbnRlcm5hbCBjYWNoZSBpZiByZWxvYWRpbmdcbiAgaWYgKGxvY2spIHJldHVybiBsb2NrXG5cbiAgLy8gdmVyaWZ5IGRpcmVjdG9yeVxuICBpZiAodHlwZW9mIGRpcmVjdG9yeSAhPT0gJ3N0cmluZycgfHwgIWF3YWl0IGV4aXN0cyhkaXJlY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdG9yeSBnaXZlbjogJyArIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8vIHNldCBjYWNoZSBmaWxlXG4gIGNvbnN0IGxvY2tmaWxlID0gYCR7ZGlyZWN0b3J5fS9ob3BwLmxvY2tgXG5cbiAgLy8gYnJpbmcgY2FjaGUgaW50byBleGlzdGVuY2VcbiAgaWYgKCFhd2FpdCBleGlzdHMobG9ja2ZpbGUpKSB7XG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUNhY2hlKGxvY2tmaWxlKVxuICB9XG5cbiAgLy8gbG9hZCBsb2NrIGZpbGVcbiAgZGVidWcoJ0xvYWRpbmcgY2FjaGUnKVxuICB0cnkge1xuICAgIHJldHVybiAobG9jayA9IEpTT04ucGFyc2UoYXdhaXQgcmVhZEZpbGUobG9ja2ZpbGUsICd1dGY4JykpKVxuICB9IGNhdGNoIChfKSB7XG4gICAgbG9nKCdDb3JydXB0ZWQgY2FjaGU7IGVqZWN0aW5nLicpXG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUNhY2hlKGxvY2tmaWxlKVxuICB9XG59XG5cbi8qKlxuICogQWRkcy9yZXBsYWNlcyBhIHZhbHVlIGluIHRoZSBjYWNoZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7QW55fSB2YWx1ZSBhbnl0aGluZyBzdHJpbmdpZmlhYmxlXG4gKi9cbmV4cG9ydCBjb25zdCB2YWwgPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBsb2NrW2tleV1cbiAgfVxuICBcbiAgbG9ja1trZXldID0gdmFsdWVcbn1cblxuLyoqXG4gKiBTYXZlcyB0aGUgbG9ja2ZpbGUgYWdhaW4uXG4gKiBAcGFyYW0geyp9IGRpcmVjdG9yeSBcbiAqL1xuZXhwb3J0IGNvbnN0IHNhdmUgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICBhd2FpdCB3cml0ZUZpbGUoZGlyZWN0b3J5ICsgJy9ob3BwLmxvY2snLCBKU09OLnN0cmluZ2lmeShsb2NrKSlcbn0iXX0=