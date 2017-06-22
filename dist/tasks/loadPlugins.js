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
  })();

  /**
   * Filter for appropriate dependencies.
   */
  return [].concat(Object.keys(pkg.dependencies || {}), Object.keys(pkg.devDependencies || {}), Object.keys(pkg.peerDependencies || {})).filter(dep => dep.startsWith('hopp-')).map(dep => `${directory}/node_modules/${dep}`);
}; /**
    * @file src/plugins/load.js
    * @license MIT
    * @copyright 2017 10244872 Canada Inc.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9sb2FkUGx1Z2lucy5qcyJdLCJuYW1lcyI6WyJkaXJlY3RvcnkiLCJwa2ciLCJyZXF1aXJlIiwiXyIsImNvbmNhdCIsIk9iamVjdCIsImtleXMiLCJkZXBlbmRlbmNpZXMiLCJkZXZEZXBlbmRlbmNpZXMiLCJwZWVyRGVwZW5kZW5jaWVzIiwiZmlsdGVyIiwiZGVwIiwic3RhcnRzV2l0aCIsIm1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7OztBQUVBOzs7OztrQkFLZSxNQUFNQSxTQUFOLElBQW1CO0FBQ2hDLFFBQU1DLE1BQU0sQ0FBQyxNQUFNO0FBQ2pCLFFBQUk7QUFDRixhQUFPQyxRQUFRRixZQUFZLGVBQXBCLENBQVA7QUFDRCxLQUZELENBRUUsT0FBT0csQ0FBUCxFQUFVO0FBQ1YsYUFBTyxFQUFQO0FBQ0Q7QUFDRixHQU5XLEdBQVo7O0FBUUE7OztBQUdBLFNBQU8sR0FBR0MsTUFBSCxDQUNMQyxPQUFPQyxJQUFQLENBQVlMLElBQUlNLFlBQUosSUFBb0IsRUFBaEMsQ0FESyxFQUVMRixPQUFPQyxJQUFQLENBQVlMLElBQUlPLGVBQUosSUFBdUIsRUFBbkMsQ0FGSyxFQUdMSCxPQUFPQyxJQUFQLENBQVlMLElBQUlRLGdCQUFKLElBQXdCLEVBQXBDLENBSEssRUFJTEMsTUFKSyxDQUlFQyxPQUFPQSxJQUFJQyxVQUFKLENBQWUsT0FBZixDQUpULEVBS0xDLEdBTEssQ0FLREYsT0FBUSxHQUFFWCxTQUFVLGlCQUFnQlcsR0FBSSxFQUx2QyxDQUFQO0FBTUQsQyxFQS9CRCIsImZpbGUiOiJsb2FkUGx1Z2lucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3BsdWdpbnMvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG4vKipcbiAqIExvYWRzIHRoZSBsaXN0IG9mIHBsdWdpbnMgZGVmaW5lZCBpbiB0aGUgcGFja2FnZS5qc29uLlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggdG8gZGlyZWN0b3J5IHdpdGggcGFja2FnZS5qc29uXG4gKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aXRoIGFycmF5IG9mIHBhdGhzIHRvIHBsdWdpbnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgY29uc3QgcGtnID0gKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUoZGlyZWN0b3J5ICsgJy9wYWNrYWdlLmpzb24nKVxuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cbiAgfSkoKVxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgZm9yIGFwcHJvcHJpYXRlIGRlcGVuZGVuY2llcy5cbiAgICovXG4gIHJldHVybiBbXS5jb25jYXQoXG4gICAgT2JqZWN0LmtleXMocGtnLmRlcGVuZGVuY2llcyB8fCB7fSksXG4gICAgT2JqZWN0LmtleXMocGtnLmRldkRlcGVuZGVuY2llcyB8fCB7fSksXG4gICAgT2JqZWN0LmtleXMocGtnLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pXG4gICkuZmlsdGVyKGRlcCA9PiBkZXAuc3RhcnRzV2l0aCgnaG9wcC0nKSlcbiAgIC5tYXAoZGVwID0+IGAke2RpcmVjdG9yeX0vbm9kZV9tb2R1bGVzLyR7ZGVwfWApXG59XG4iXX0=