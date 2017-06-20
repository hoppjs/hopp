'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.val = exports.load = undefined;

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
 * @returns {Any?} value from cache
 */
const val = exports.val = (key, value) => {
  if (value === undefined) {
    return lock[key];
  }

  lock[key] = value;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJKU09OIiwicGFyc2UiLCJfIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJzb3VyY2VtYXAiLCJ0YXNrTmFtZSIsInNtIiwic2F2ZSIsInN0cmluZ2lmeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOztBQU9BOzs7Ozs7QUFiQTs7Ozs7O0FBZUEsTUFBTSxFQUFFQSxLQUFGLEVBQVNDLEdBQVQsS0FBaUJDLFFBQVEsYUFBUixFQUF1QixNQUF2QixDQUF2QjtBQUNBLElBQUlDLElBQUo7O0FBRUE7Ozs7O0FBS08sTUFBTUMsc0JBQU8sTUFBTUMsU0FBTixJQUFtQjtBQUNyQztBQUNBLE1BQUlGLElBQUosRUFBVSxPQUFPQSxJQUFQOztBQUVWO0FBQ0EsTUFBSSxPQUFPRSxTQUFQLEtBQXFCLFFBQXJCLElBQWlDLEVBQUMsTUFBTSxnQkFBT0EsU0FBUCxDQUFQLENBQXJDLEVBQStEO0FBQzdELFVBQU0sSUFBSUMsS0FBSixDQUFVLDhCQUE4QkQsU0FBeEMsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUUsV0FBWSxHQUFFRixTQUFVLFlBQTlCOztBQUVBO0FBQ0EsTUFBSSxFQUFDLE1BQU0sZ0JBQU9FLFFBQVAsQ0FBUCxDQUFKLEVBQTZCO0FBQzNCLFdBQVFKLE9BQU8sRUFBZjtBQUNEOztBQUVEO0FBQ0FILFFBQU0sZUFBTjtBQUNBLE1BQUk7QUFDRixXQUFRRyxPQUFPSyxLQUFLQyxLQUFMLEVBQVcsTUFBTSxrQkFBU0YsUUFBVCxFQUFtQixNQUFuQixDQUFqQixFQUFmO0FBQ0QsR0FGRCxDQUVFLE9BQU9HLENBQVAsRUFBVTtBQUNWVCxRQUFJLDRCQUFKO0FBQ0EsV0FBUUUsT0FBTyxFQUFmO0FBQ0Q7QUFDRixDQXpCTTs7QUEyQlA7Ozs7OztBQU1PLE1BQU1RLG9CQUFNLENBQUNDLEdBQUQsRUFBTUMsS0FBTixLQUFnQjtBQUNqQyxNQUFJQSxVQUFVQyxTQUFkLEVBQXlCO0FBQ3ZCLFdBQU9YLEtBQUtTLEdBQUwsQ0FBUDtBQUNEOztBQUVEVCxPQUFLUyxHQUFMLElBQVlDLEtBQVo7QUFDRCxDQU5NOztBQVFQOzs7Ozs7QUFNTyxNQUFNRSxnQ0FBWSxDQUFDQyxRQUFELEVBQVdDLEVBQVgsS0FBa0I7QUFDekMsTUFBSUYsWUFBWUosSUFBSSxJQUFKLENBQWhCOztBQUVBLE1BQUksQ0FBQ0ksU0FBTCxFQUFnQjtBQUNkSixRQUFJLElBQUosRUFBVUksWUFBWSxFQUF0QjtBQUNEOztBQUVELE1BQUlFLEVBQUosRUFBUTtBQUNORixjQUFVQyxRQUFWLElBQXNCQyxFQUF0QjtBQUNELEdBRkQsTUFFTztBQUNMRixjQUFVQyxRQUFWLElBQXNCRCxVQUFVQyxRQUFWLEtBQXVCLEVBQTdDO0FBQ0Q7O0FBRUQsU0FBT0QsU0FBUDtBQUNELENBZE07O0FBZ0JQOzs7O0FBSU8sTUFBTUcsc0JBQU8sTUFBTWIsU0FBTixJQUFtQjtBQUNyQ0wsUUFBTSxjQUFOO0FBQ0EsUUFBTSxtQkFBVUssWUFBWSxZQUF0QixFQUFvQ0csS0FBS1csU0FBTCxDQUFlaEIsSUFBZixDQUFwQyxDQUFOO0FBQ0QsQ0FITSIsImZpbGUiOiJjYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2NhY2hlL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHtcbiAgc3RhdCxcbiAgbWtkaXIsXG4gIGV4aXN0cyxcbiAgcmVhZEZpbGUsXG4gIHdyaXRlRmlsZSxcbn0gZnJvbSAnLi9mcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmNvbnN0IHsgZGVidWcsIGxvZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5sZXQgbG9ja1xuXG4vKipcbiAqIExvYWRzIGEgY2FjaGUgZnJvbSB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3RvcnkgcHJvamVjdCBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIGxvYWRlZCBjYWNoZVxuICovXG5leHBvcnQgY29uc3QgbG9hZCA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIC8vIHNlbmQgYmFjayBpbnRlcm5hbCBjYWNoZSBpZiByZWxvYWRpbmdcbiAgaWYgKGxvY2spIHJldHVybiBsb2NrXG5cbiAgLy8gdmVyaWZ5IGRpcmVjdG9yeVxuICBpZiAodHlwZW9mIGRpcmVjdG9yeSAhPT0gJ3N0cmluZycgfHwgIWF3YWl0IGV4aXN0cyhkaXJlY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdG9yeSBnaXZlbjogJyArIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8vIHNldCBjYWNoZSBmaWxlXG4gIGNvbnN0IGxvY2tmaWxlID0gYCR7ZGlyZWN0b3J5fS9ob3BwLmxvY2tgXG5cbiAgLy8gYnJpbmcgY2FjaGUgaW50byBleGlzdGVuY2VcbiAgaWYgKCFhd2FpdCBleGlzdHMobG9ja2ZpbGUpKSB7XG4gICAgcmV0dXJuIChsb2NrID0ge30pXG4gIH1cblxuICAvLyBsb2FkIGxvY2sgZmlsZVxuICBkZWJ1ZygnTG9hZGluZyBjYWNoZScpXG4gIHRyeSB7XG4gICAgcmV0dXJuIChsb2NrID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShsb2NrZmlsZSwgJ3V0ZjgnKSkpXG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBsb2coJ0NvcnJ1cHRlZCBjYWNoZTsgZWplY3RpbmcuJylcbiAgICByZXR1cm4gKGxvY2sgPSB7fSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMvcmVwbGFjZXMgYSB2YWx1ZSBpbiB0aGUgY2FjaGUuXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge0FueX0gdmFsdWUgYW55dGhpbmcgc3RyaW5naWZpYWJsZVxuICogQHJldHVybnMge0FueT99IHZhbHVlIGZyb20gY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbCA9IChrZXksIHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGxvY2tba2V5XVxuICB9XG4gIFxuICBsb2NrW2tleV0gPSB2YWx1ZVxufVxuXG4vKipcbiAqIEdldC9zZXQgYSBzb3VyY2VtYXAuXG4gKiBAcGFyYW0ge1N0cmluZ30gdGFza05hbWUgbmFtZSBvZiB0aGUgdGFza1xuICogQHBhcmFtIHtPYmplY3R9IHNtIHNvdXJjZW1hcCB0byBzYXZlIGZvciB0aGUgdGFza1xuICogQHJldHVybnMge09iamVjdH0gc291cmNlbWFwIGZyb20gY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IHNvdXJjZW1hcCA9ICh0YXNrTmFtZSwgc20pID0+IHtcbiAgbGV0IHNvdXJjZW1hcCA9IHZhbCgnc20nKVxuXG4gIGlmICghc291cmNlbWFwKSB7XG4gICAgdmFsKCdzbScsIHNvdXJjZW1hcCA9IHt9KVxuICB9XG5cbiAgaWYgKHNtKSB7XG4gICAgc291cmNlbWFwW3Rhc2tOYW1lXSA9IHNtXG4gIH0gZWxzZSB7XG4gICAgc291cmNlbWFwW3Rhc2tOYW1lXSA9IHNvdXJjZW1hcFt0YXNrTmFtZV0gfHwge31cbiAgfVxuXG4gIHJldHVybiBzb3VyY2VtYXBcbn1cblxuLyoqXG4gKiBTYXZlcyB0aGUgbG9ja2ZpbGUgYWdhaW4uXG4gKiBAcGFyYW0geyp9IGRpcmVjdG9yeSBcbiAqL1xuZXhwb3J0IGNvbnN0IHNhdmUgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICBkZWJ1ZygnU2F2aW5nIGNhY2hlJylcbiAgYXdhaXQgd3JpdGVGaWxlKGRpcmVjdG9yeSArICcvaG9wcC5sb2NrJywgSlNPTi5zdHJpbmdpZnkobG9jaykpXG59Il19