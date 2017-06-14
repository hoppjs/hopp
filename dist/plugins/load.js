'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
exports.default = async directory => {
  const pkg = (() => {
    try {
      return require(directory + '/package.json');
    } catch (_) {
      return {};
    }
  }

  /**
   * Filter for appropriate dependencies.
   */
  )();return [].concat(Object.keys(pkg.dependencies || {}), Object.keys(pkg.devDependencies || {}), Object.keys(pkg.peerDependencies || {})).filter(dep => dep.startsWith('hopp-')).map(dep => `${directory}/node_modules/${dep}`);
}; /**
    * @file src/plugins/load.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2xvYWQuanMiXSwibmFtZXMiOlsiZGlyZWN0b3J5IiwicGtnIiwicmVxdWlyZSIsIl8iLCJjb25jYXQiLCJPYmplY3QiLCJrZXlzIiwiZGVwZW5kZW5jaWVzIiwiZGV2RGVwZW5kZW5jaWVzIiwicGVlckRlcGVuZGVuY2llcyIsImZpbHRlciIsImRlcCIsInN0YXJ0c1dpdGgiLCJtYXAiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7Ozs7QUFFQTs7Ozs7a0JBS2UsTUFBTUEsU0FBTixJQUFtQjtBQUNoQyxRQUFNQyxNQUFNLENBQUMsTUFBTTtBQUNqQixRQUFJO0FBQ0YsYUFBT0MsUUFBUUYsWUFBWSxlQUFwQixDQUFQO0FBQ0QsS0FGRCxDQUVFLE9BQU9HLENBQVAsRUFBVTtBQUNWLGFBQU8sRUFBUDtBQUNEO0FBQ0Y7O0FBRUQ7OztBQVJZLEtBQVosQ0FXQSxPQUFPLEdBQUdDLE1BQUgsQ0FDTEMsT0FBT0MsSUFBUCxDQUFZTCxJQUFJTSxZQUFKLElBQW9CLEVBQWhDLENBREssRUFFTEYsT0FBT0MsSUFBUCxDQUFZTCxJQUFJTyxlQUFKLElBQXVCLEVBQW5DLENBRkssRUFHTEgsT0FBT0MsSUFBUCxDQUFZTCxJQUFJUSxnQkFBSixJQUF3QixFQUFwQyxDQUhLLEVBSUxDLE1BSkssQ0FJRUMsT0FBT0EsSUFBSUMsVUFBSixDQUFlLE9BQWYsQ0FKVCxFQUtMQyxHQUxLLENBS0RGLE9BQVEsR0FBRVgsU0FBVSxpQkFBZ0JXLEdBQUksRUFMdkMsQ0FBUDtBQU1ELEMsRUEvQkQiLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3BsdWdpbnMvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG4vKipcbiAqIExvYWRzIHRoZSBsaXN0IG9mIHBsdWdpbnMgZGVmaW5lZCBpbiB0aGUgcGFja2FnZS5qc29uLlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggdG8gZGlyZWN0b3J5IHdpdGggcGFja2FnZS5qc29uXG4gKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aXRoIGFycmF5IG9mIHBhdGhzIHRvIHBsdWdpbnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgY29uc3QgcGtnID0gKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUoZGlyZWN0b3J5ICsgJy9wYWNrYWdlLmpzb24nKVxuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cbiAgfSkoKVxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgZm9yIGFwcHJvcHJpYXRlIGRlcGVuZGVuY2llcy5cbiAgICovXG4gIHJldHVybiBbXS5jb25jYXQoXG4gICAgT2JqZWN0LmtleXMocGtnLmRlcGVuZGVuY2llcyB8fCB7fSksXG4gICAgT2JqZWN0LmtleXMocGtnLmRldkRlcGVuZGVuY2llcyB8fCB7fSksXG4gICAgT2JqZWN0LmtleXMocGtnLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pXG4gICkuZmlsdGVyKGRlcCA9PiBkZXAuc3RhcnRzV2l0aCgnaG9wcC0nKSlcbiAgIC5tYXAoZGVwID0+IGAke2RpcmVjdG9yeX0vbm9kZV9tb2R1bGVzLyR7ZGVwfWApXG59Il19