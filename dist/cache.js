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
  if (process.env.RECACHE || !(await (0, _fs.exists)(lockfile))) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImxvZyIsInJlcXVpcmUiLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJwcm9jZXNzIiwiZW52IiwiUkVDQUNIRSIsInAiLCJKU09OIiwicGFyc2UiLCJfIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJwbHVnaW4iLCJwbHVnaW5OYW1lIiwicGx1Z2lucyIsImhhc093blByb3BlcnR5Iiwic291cmNlbWFwIiwidGFza05hbWUiLCJzbSIsInNhdmUiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7QUFPQTs7Ozs7O0FBYkE7Ozs7OztBQWVBLE1BQU0sRUFBRUEsS0FBRixFQUFTQyxHQUFULEtBQWlCQyxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQ0FBdkI7QUFDQSxJQUFJQyxJQUFKOztBQUVBOzs7OztBQUtPLE1BQU1DLHNCQUFPLE1BQU1DLFNBQU4sSUFBbUI7QUFDckM7QUFDQSxNQUFJRixJQUFKLEVBQVUsT0FBT0EsSUFBUDs7QUFFVjtBQUNBLE1BQUksT0FBT0UsU0FBUCxLQUFxQixRQUFyQixJQUFpQyxFQUFDLE1BQU0sZ0JBQU9BLFNBQVAsQ0FBUCxDQUFyQyxFQUErRDtBQUM3RCxVQUFNLElBQUlDLEtBQUosQ0FBVSw4QkFBOEJELFNBQXhDLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1FLFdBQVksR0FBRUYsU0FBVSxZQUE5Qjs7QUFFQTtBQUNBLE1BQUlHLFFBQVFDLEdBQVIsQ0FBWUMsT0FBWixJQUF1QixFQUFDLE1BQU0sZ0JBQU9ILFFBQVAsQ0FBUCxDQUEzQixFQUFvRDtBQUNsRCxXQUFRSixPQUFPLEVBQUNRLEdBQUUsRUFBSCxFQUFmO0FBQ0Q7O0FBRUQ7QUFDQVgsUUFBTSxlQUFOO0FBQ0EsTUFBSTtBQUNGLFdBQVFHLE9BQU9TLEtBQUtDLEtBQUwsRUFBVyxNQUFNLGtCQUFTTixRQUFULEVBQW1CLE1BQW5CLENBQWpCLEVBQWY7QUFDRCxHQUZELENBRUUsT0FBT08sQ0FBUCxFQUFVO0FBQ1ZiLFFBQUksNEJBQUo7QUFDQSxXQUFRRSxPQUFPLEVBQUNRLEdBQUUsRUFBSCxFQUFmO0FBQ0Q7QUFDRixDQXpCTTs7QUEyQlA7Ozs7OztBQU1PLE1BQU1JLG9CQUFNLENBQUNDLEdBQUQsRUFBTUMsS0FBTixLQUFnQjtBQUNqQyxNQUFJQSxVQUFVQyxTQUFkLEVBQXlCO0FBQ3ZCLFdBQU9mLEtBQUthLEdBQUwsQ0FBUDtBQUNEOztBQUVEYixPQUFLYSxHQUFMLElBQVlDLEtBQVo7QUFDRCxDQU5NOztBQVFQOzs7O0FBSU8sTUFBTUUsMEJBQVNDLGNBQWM7QUFDbEMsUUFBTUMsVUFBVU4sSUFBSSxHQUFKLENBQWhCOztBQUVBLE1BQUksQ0FBQ00sUUFBUUMsY0FBUixDQUF1QkYsVUFBdkIsQ0FBTCxFQUF5QztBQUN2Q0MsWUFBUUQsVUFBUixJQUFzQixFQUF0QjtBQUNEOztBQUVELFNBQU9DLFFBQVFELFVBQVIsQ0FBUDtBQUNELENBUk07O0FBVVA7Ozs7OztBQU1PLE1BQU1HLGdDQUFZLENBQUNDLFFBQUQsRUFBV0MsRUFBWCxLQUFrQjtBQUN6QyxNQUFJRixZQUFZUixJQUFJLElBQUosQ0FBaEI7O0FBRUEsTUFBSSxDQUFDUSxTQUFMLEVBQWdCO0FBQ2RSLFFBQUksSUFBSixFQUFVUSxZQUFZLEVBQXRCO0FBQ0Q7O0FBRUQsTUFBSUUsRUFBSixFQUFRO0FBQ05GLGNBQVVDLFFBQVYsSUFBc0JDLEVBQXRCO0FBQ0QsR0FGRCxNQUVPO0FBQ0xGLGNBQVVDLFFBQVYsSUFBc0JELFVBQVVDLFFBQVYsS0FBdUIsRUFBN0M7QUFDRDs7QUFFRCxTQUFPRCxTQUFQO0FBQ0QsQ0FkTTs7QUFnQlA7Ozs7QUFJTyxNQUFNRyxzQkFBTyxNQUFNckIsU0FBTixJQUFtQjtBQUNyQ0wsUUFBTSxjQUFOO0FBQ0EsUUFBTSxtQkFBVUssWUFBWSxZQUF0QixFQUFvQ08sS0FBS2UsU0FBTCxDQUFleEIsSUFBZixDQUFwQyxDQUFOO0FBQ0QsQ0FITSIsImZpbGUiOiJjYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2NhY2hlL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IHtcbiAgc3RhdCxcbiAgbWtkaXIsXG4gIGV4aXN0cyxcbiAgcmVhZEZpbGUsXG4gIHdyaXRlRmlsZSxcbn0gZnJvbSAnLi9mcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmNvbnN0IHsgZGVidWcsIGxvZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5sZXQgbG9ja1xuXG4vKipcbiAqIExvYWRzIGEgY2FjaGUgZnJvbSB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3RvcnkgcHJvamVjdCBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIGxvYWRlZCBjYWNoZVxuICovXG5leHBvcnQgY29uc3QgbG9hZCA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIC8vIHNlbmQgYmFjayBpbnRlcm5hbCBjYWNoZSBpZiByZWxvYWRpbmdcbiAgaWYgKGxvY2spIHJldHVybiBsb2NrXG5cbiAgLy8gdmVyaWZ5IGRpcmVjdG9yeVxuICBpZiAodHlwZW9mIGRpcmVjdG9yeSAhPT0gJ3N0cmluZycgfHwgIWF3YWl0IGV4aXN0cyhkaXJlY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdG9yeSBnaXZlbjogJyArIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8vIHNldCBjYWNoZSBmaWxlXG4gIGNvbnN0IGxvY2tmaWxlID0gYCR7ZGlyZWN0b3J5fS9ob3BwLmxvY2tgXG5cbiAgLy8gYnJpbmcgY2FjaGUgaW50byBleGlzdGVuY2VcbiAgaWYgKHByb2Nlc3MuZW52LlJFQ0FDSEUgfHwgIWF3YWl0IGV4aXN0cyhsb2NrZmlsZSkpIHtcbiAgICByZXR1cm4gKGxvY2sgPSB7cDp7fX0pXG4gIH1cblxuICAvLyBsb2FkIGxvY2sgZmlsZVxuICBkZWJ1ZygnTG9hZGluZyBjYWNoZScpXG4gIHRyeSB7XG4gICAgcmV0dXJuIChsb2NrID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShsb2NrZmlsZSwgJ3V0ZjgnKSkpXG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBsb2coJ0NvcnJ1cHRlZCBjYWNoZTsgZWplY3RpbmcuJylcbiAgICByZXR1cm4gKGxvY2sgPSB7cDp7fX0pXG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzL3JlcGxhY2VzIGEgdmFsdWUgaW4gdGhlIGNhY2hlLlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtBbnl9IHZhbHVlIGFueXRoaW5nIHN0cmluZ2lmaWFibGVcbiAqIEByZXR1cm5zIHtBbnk/fSB2YWx1ZSBmcm9tIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCB2YWwgPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBsb2NrW2tleV1cbiAgfVxuICBcbiAgbG9ja1trZXldID0gdmFsdWVcbn1cblxuLyoqXG4gKiBMb2FkL2NyZWF0ZSBjYWNoZSBmb3IgYSBwbHVnaW4uXG4gKiBAcGFyYW0ge31cbiAqL1xuZXhwb3J0IGNvbnN0IHBsdWdpbiA9IHBsdWdpbk5hbWUgPT4ge1xuICBjb25zdCBwbHVnaW5zID0gdmFsKCdwJylcblxuICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luTmFtZSkpIHtcbiAgICBwbHVnaW5zW3BsdWdpbk5hbWVdID0ge31cbiAgfVxuXG4gIHJldHVybiBwbHVnaW5zW3BsdWdpbk5hbWVdXG59XG5cbi8qKlxuICogR2V0L3NldCBhIHNvdXJjZW1hcC5cbiAqIEBwYXJhbSB7U3RyaW5nfSB0YXNrTmFtZSBuYW1lIG9mIHRoZSB0YXNrXG4gKiBAcGFyYW0ge09iamVjdH0gc20gc291cmNlbWFwIHRvIHNhdmUgZm9yIHRoZSB0YXNrXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBzb3VyY2VtYXAgZnJvbSBjYWNoZVxuICovXG5leHBvcnQgY29uc3Qgc291cmNlbWFwID0gKHRhc2tOYW1lLCBzbSkgPT4ge1xuICBsZXQgc291cmNlbWFwID0gdmFsKCdzbScpXG5cbiAgaWYgKCFzb3VyY2VtYXApIHtcbiAgICB2YWwoJ3NtJywgc291cmNlbWFwID0ge30pXG4gIH1cblxuICBpZiAoc20pIHtcbiAgICBzb3VyY2VtYXBbdGFza05hbWVdID0gc21cbiAgfSBlbHNlIHtcbiAgICBzb3VyY2VtYXBbdGFza05hbWVdID0gc291cmNlbWFwW3Rhc2tOYW1lXSB8fCB7fVxuICB9XG5cbiAgcmV0dXJuIHNvdXJjZW1hcFxufVxuXG4vKipcbiAqIFNhdmVzIHRoZSBsb2NrZmlsZSBhZ2Fpbi5cbiAqIEBwYXJhbSB7Kn0gZGlyZWN0b3J5IFxuICovXG5leHBvcnQgY29uc3Qgc2F2ZSA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIGRlYnVnKCdTYXZpbmcgY2FjaGUnKVxuICBhd2FpdCB3cml0ZUZpbGUoZGlyZWN0b3J5ICsgJy9ob3BwLmxvY2snLCBKU09OLnN0cmluZ2lmeShsb2NrKSlcbn1cbiJdfQ==