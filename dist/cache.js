'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.get = exports.val = exports.load = undefined;

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
  );await (0, _fs.writeFile)(lockfile, '{"lmod":0,"stat":{},"files":{}}'

  // return the empty cache
  );return lock = {
    lmod: 0,
    stat: {},
    files: {}
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
 * Fetches a file - cache-first.
 */
const get = exports.get = async file => {
  const lmod = +(await (0, _fs.stat)(file)).mtime;

  // try loading from cache
  if (lock.stat[file] === lmod) {
    log('loading %s from cache', _path2.default.basename(file));
    return lock.files[file];
  }

  // load file off fs
  const data = await (0, _fs.readFile)(file, 'utf8'

  // add to cache
  );lock.stat[file] = lmod;
  lock.files[file] = data;

  // return contents finally
  return data;
};

/**
 * Saves the lockfile again.
 * @param {*} directory 
 */
const save = exports.save = async directory => {
  await (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwiY3JlYXRlQ2FjaGUiLCJsb2NrZmlsZSIsImxtb2QiLCJzdGF0IiwiZmlsZXMiLCJsb2FkIiwiZGlyZWN0b3J5IiwiRXJyb3IiLCJKU09OIiwicGFyc2UiLCJfIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJnZXQiLCJmaWxlIiwibXRpbWUiLCJiYXNlbmFtZSIsImRhdGEiLCJzYXZlIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBT0E7Ozs7OztBQWJBOzs7Ozs7QUFlQSxNQUFNLEVBQUVBLEtBQUYsRUFBU0MsR0FBVCxLQUFpQkMsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLENBQXZCO0FBQ0EsSUFBSUMsSUFBSjs7QUFFQTs7Ozs7QUFLQSxlQUFlQyxXQUFmLENBQTRCQyxRQUE1QixFQUF1QztBQUNyQ0wsUUFBTTs7QUFFTjtBQUZBLElBR0EsTUFBTSxtQkFBVUssUUFBVixFQUFvQjs7QUFFMUI7QUFGTSxHQUFOLENBR0EsT0FBUUYsT0FBTztBQUNiRyxVQUFNLENBRE87QUFFYkMsVUFBTSxFQUZPO0FBR2JDLFdBQU87QUFITSxHQUFmO0FBS0Q7O0FBRUQ7Ozs7O0FBS08sTUFBTUMsc0JBQU8sTUFBTUMsU0FBTixJQUFtQjtBQUNyQztBQUNBLE1BQUlQLElBQUosRUFBVSxPQUFPQSxJQUFQOztBQUVWO0FBQ0EsTUFBSSxPQUFPTyxTQUFQLEtBQXFCLFFBQXJCLElBQWlDLEVBQUMsTUFBTSxnQkFBT0EsU0FBUCxDQUFQLENBQXJDLEVBQStEO0FBQzdELFVBQU0sSUFBSUMsS0FBSixDQUFVLDhCQUE4QkQsU0FBeEMsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUwsV0FBWSxHQUFFSyxTQUFVLFlBQTlCOztBQUVBO0FBQ0EsTUFBSSxFQUFDLE1BQU0sZ0JBQU9MLFFBQVAsQ0FBUCxDQUFKLEVBQTZCO0FBQzNCLFdBQU8sTUFBTUQsWUFBWUMsUUFBWixDQUFiO0FBQ0Q7O0FBRUQ7QUFDQUwsUUFBTSxlQUFOO0FBQ0EsTUFBSTtBQUNGLFdBQVFHLE9BQU9TLEtBQUtDLEtBQUwsRUFBVyxNQUFNLGtCQUFTUixRQUFULEVBQW1CLE1BQW5CLENBQWpCLEVBQWY7QUFDRCxHQUZELENBRUUsT0FBT1MsQ0FBUCxFQUFVO0FBQ1ZiLFFBQUksNEJBQUo7QUFDQSxXQUFPLE1BQU1HLFlBQVlDLFFBQVosQ0FBYjtBQUNEO0FBQ0YsQ0F6Qk07O0FBMkJQOzs7OztBQUtPLE1BQU1VLG9CQUFNLENBQUNDLEdBQUQsRUFBTUMsS0FBTixLQUFnQjtBQUNqQyxNQUFJQSxVQUFVQyxTQUFkLEVBQXlCO0FBQ3ZCLFdBQU9mLEtBQUthLEdBQUwsQ0FBUDtBQUNEOztBQUVEYixPQUFLYSxHQUFMLElBQVlDLEtBQVo7QUFDRCxDQU5NOztBQVFQOzs7QUFHTyxNQUFNRSxvQkFBTSxNQUFNQyxJQUFOLElBQWM7QUFDL0IsUUFBTWQsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLYyxJQUFMLENBQVAsRUFBbUJDLEtBQWpDOztBQUVBO0FBQ0EsTUFBSWxCLEtBQUtJLElBQUwsQ0FBVWEsSUFBVixNQUFvQmQsSUFBeEIsRUFBOEI7QUFDNUJMLFFBQUksdUJBQUosRUFBNkIsZUFBS3FCLFFBQUwsQ0FBY0YsSUFBZCxDQUE3QjtBQUNBLFdBQU9qQixLQUFLSyxLQUFMLENBQVdZLElBQVgsQ0FBUDtBQUNEOztBQUVEO0FBQ0EsUUFBTUcsT0FBTyxNQUFNLGtCQUFTSCxJQUFULEVBQWU7O0FBRWxDO0FBRm1CLEdBQW5CLENBR0FqQixLQUFLSSxJQUFMLENBQVVhLElBQVYsSUFBa0JkLElBQWxCO0FBQ0FILE9BQUtLLEtBQUwsQ0FBV1ksSUFBWCxJQUFtQkcsSUFBbkI7O0FBRUE7QUFDQSxTQUFPQSxJQUFQO0FBQ0QsQ0FsQk07O0FBb0JQOzs7O0FBSU8sTUFBTUMsc0JBQU8sTUFBTWQsU0FBTixJQUFtQjtBQUNyQyxRQUFNLG1CQUFVQSxZQUFZLFlBQXRCLEVBQW9DRSxLQUFLYSxTQUFMLENBQWV0QixJQUFmLENBQXBDLENBQU47QUFDRCxDQUZNIiwiZmlsZSI6ImNhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvY2FjaGUvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQge1xuICBzdGF0LFxuICBta2RpcixcbiAgZXhpc3RzLFxuICByZWFkRmlsZSxcbiAgd3JpdGVGaWxlLFxufSBmcm9tICcuL2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuY29uc3QgeyBkZWJ1ZywgbG9nIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcbmxldCBsb2NrXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBjYWNoZSAob3ZlcndyaXRlcyBleGlzdGluZykuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9ja2ZpbGUgbG9jYXRpb24gb2YgbG9ja2ZpbGVcbiAqIEByZXR1cm4ge09iamVjdH0gY29udGVudHMgb2YgbmV3IGNhY2hlXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNhY2hlKCBsb2NrZmlsZSApIHtcbiAgZGVidWcoJ0NyZWF0aW5nIGVtcHR5IGNhY2hlJylcblxuICAvLyB3cml0ZSBlbXB0eSBjYWNoZVxuICBhd2FpdCB3cml0ZUZpbGUobG9ja2ZpbGUsICd7XCJsbW9kXCI6MCxcInN0YXRcIjp7fSxcImZpbGVzXCI6e319JylcblxuICAvLyByZXR1cm4gdGhlIGVtcHR5IGNhY2hlXG4gIHJldHVybiAobG9jayA9IHtcbiAgICBsbW9kOiAwLFxuICAgIHN0YXQ6IHt9LFxuICAgIGZpbGVzOiB7fVxuICB9KVxufVxuXG4vKipcbiAqIExvYWRzIGEgY2FjaGUgZnJvbSB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3RvcnkgcHJvamVjdCBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIGxvYWRlZCBjYWNoZVxuICovXG5leHBvcnQgY29uc3QgbG9hZCA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIC8vIHNlbmQgYmFjayBpbnRlcm5hbCBjYWNoZSBpZiByZWxvYWRpbmdcbiAgaWYgKGxvY2spIHJldHVybiBsb2NrXG5cbiAgLy8gdmVyaWZ5IGRpcmVjdG9yeVxuICBpZiAodHlwZW9mIGRpcmVjdG9yeSAhPT0gJ3N0cmluZycgfHwgIWF3YWl0IGV4aXN0cyhkaXJlY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdG9yeSBnaXZlbjogJyArIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8vIHNldCBjYWNoZSBmaWxlXG4gIGNvbnN0IGxvY2tmaWxlID0gYCR7ZGlyZWN0b3J5fS9ob3BwLmxvY2tgXG5cbiAgLy8gYnJpbmcgY2FjaGUgaW50byBleGlzdGVuY2VcbiAgaWYgKCFhd2FpdCBleGlzdHMobG9ja2ZpbGUpKSB7XG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUNhY2hlKGxvY2tmaWxlKVxuICB9XG5cbiAgLy8gbG9hZCBsb2NrIGZpbGVcbiAgZGVidWcoJ0xvYWRpbmcgY2FjaGUnKVxuICB0cnkge1xuICAgIHJldHVybiAobG9jayA9IEpTT04ucGFyc2UoYXdhaXQgcmVhZEZpbGUobG9ja2ZpbGUsICd1dGY4JykpKVxuICB9IGNhdGNoIChfKSB7XG4gICAgbG9nKCdDb3JydXB0ZWQgY2FjaGU7IGVqZWN0aW5nLicpXG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUNhY2hlKGxvY2tmaWxlKVxuICB9XG59XG5cbi8qKlxuICogQWRkcy9yZXBsYWNlcyBhIHZhbHVlIGluIHRoZSBjYWNoZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7QW55fSB2YWx1ZSBhbnl0aGluZyBzdHJpbmdpZmlhYmxlXG4gKi9cbmV4cG9ydCBjb25zdCB2YWwgPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBsb2NrW2tleV1cbiAgfVxuICBcbiAgbG9ja1trZXldID0gdmFsdWVcbn1cblxuLyoqXG4gKiBGZXRjaGVzIGEgZmlsZSAtIGNhY2hlLWZpcnN0LlxuICovXG5leHBvcnQgY29uc3QgZ2V0ID0gYXN5bmMgZmlsZSA9PiB7XG4gIGNvbnN0IGxtb2QgPSArKGF3YWl0IHN0YXQoZmlsZSkpLm10aW1lXG4gIFxuICAvLyB0cnkgbG9hZGluZyBmcm9tIGNhY2hlXG4gIGlmIChsb2NrLnN0YXRbZmlsZV0gPT09IGxtb2QpIHtcbiAgICBsb2coJ2xvYWRpbmcgJXMgZnJvbSBjYWNoZScsIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgcmV0dXJuIGxvY2suZmlsZXNbZmlsZV1cbiAgfVxuXG4gIC8vIGxvYWQgZmlsZSBvZmYgZnNcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlYWRGaWxlKGZpbGUsICd1dGY4JylcblxuICAvLyBhZGQgdG8gY2FjaGVcbiAgbG9jay5zdGF0W2ZpbGVdID0gbG1vZFxuICBsb2NrLmZpbGVzW2ZpbGVdID0gZGF0YVxuXG4gIC8vIHJldHVybiBjb250ZW50cyBmaW5hbGx5XG4gIHJldHVybiBkYXRhXG59XG5cbi8qKlxuICogU2F2ZXMgdGhlIGxvY2tmaWxlIGFnYWluLlxuICogQHBhcmFtIHsqfSBkaXJlY3RvcnkgXG4gKi9cbmV4cG9ydCBjb25zdCBzYXZlID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgYXdhaXQgd3JpdGVGaWxlKGRpcmVjdG9yeSArICcvaG9wcC5sb2NrJywgSlNPTi5zdHJpbmdpZnkobG9jaykpXG59Il19