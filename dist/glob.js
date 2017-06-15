'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/glob.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

exports.default = (pattern, cwd) => new Promise((resolve, reject) => {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern];
  }

  let files = [];
  const caches = cache.val('gc') || {};

  // glob eval all
  Promise.all(pattern.map(pttn => new Promise(res => {
    const opts = { cwd };

    if (caches[pttn]) {
      opts.cache = caches[pttn];
    }

    caches[pttn] = new _glob2.default.Glob(pttn, opts, (err, results) => {
      if (err) reject(err);else {
        files = files.concat(results);
        res();
      }
    }).cache;
  }))).then(() => {
    cache.val('gc', caches);
    resolve(files);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwicGF0dGVybiIsImN3ZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiQXJyYXkiLCJmaWxlcyIsImNhY2hlcyIsInZhbCIsImFsbCIsIm1hcCIsInB0dG4iLCJyZXMiLCJvcHRzIiwiR2xvYiIsImVyciIsInJlc3VsdHMiLCJjb25jYXQiLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOztJQUFZQSxLOzs7Ozs7QUFQWjs7Ozs7O2tCQVNlLENBQUNDLE9BQUQsRUFBVUMsR0FBVixLQUFrQixJQUFJQyxPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQ2hFO0FBQ0EsTUFBSSxFQUFFSixtQkFBbUJLLEtBQXJCLENBQUosRUFBaUM7QUFDL0JMLGNBQVUsQ0FBQ0EsT0FBRCxDQUFWO0FBQ0Q7O0FBRUQsTUFBSU0sUUFBUSxFQUFaO0FBQ0EsUUFBTUMsU0FBU1IsTUFBTVMsR0FBTixDQUFVLElBQVYsS0FBbUIsRUFBbEM7O0FBRUE7QUFDQU4sVUFBUU8sR0FBUixDQUFZVCxRQUFRVSxHQUFSLENBQVlDLFFBQVEsSUFBSVQsT0FBSixDQUFZVSxPQUFPO0FBQ2pELFVBQU1DLE9BQU8sRUFBRVosR0FBRixFQUFiOztBQUVBLFFBQUlNLE9BQU9JLElBQVAsQ0FBSixFQUFrQjtBQUNoQkUsV0FBS2QsS0FBTCxHQUFhUSxPQUFPSSxJQUFQLENBQWI7QUFDRDs7QUFFREosV0FBT0ksSUFBUCxJQUFnQixJQUFJLGVBQUtHLElBQVQsQ0FBY0gsSUFBZCxFQUFvQkUsSUFBcEIsRUFBMEIsQ0FBQ0UsR0FBRCxFQUFNQyxPQUFOLEtBQWtCO0FBQzFELFVBQUlELEdBQUosRUFBU1gsT0FBT1csR0FBUCxFQUFULEtBQ0s7QUFDSFQsZ0JBQVFBLE1BQU1XLE1BQU4sQ0FBYUQsT0FBYixDQUFSO0FBQ0FKO0FBQ0Q7QUFDRixLQU5lLENBQUQsQ0FNWGIsS0FOSjtBQU9ELEdBZCtCLENBQXBCLENBQVosRUFjS21CLElBZEwsQ0FjVSxNQUFNO0FBQ2RuQixVQUFNUyxHQUFOLENBQVUsSUFBVixFQUFnQkQsTUFBaEI7QUFDQUosWUFBUUcsS0FBUjtBQUNELEdBakJEO0FBa0JELENBNUJnQyxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuXG5leHBvcnQgZGVmYXVsdCAocGF0dGVybiwgY3dkKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIGxldCBmaWxlcyA9IFtdXG4gIGNvbnN0IGNhY2hlcyA9IGNhY2hlLnZhbCgnZ2MnKSB8fCB7fVxuXG4gIC8vIGdsb2IgZXZhbCBhbGxcbiAgUHJvbWlzZS5hbGwocGF0dGVybi5tYXAocHR0biA9PiBuZXcgUHJvbWlzZShyZXMgPT4ge1xuICAgIGNvbnN0IG9wdHMgPSB7IGN3ZCB9XG5cbiAgICBpZiAoY2FjaGVzW3B0dG5dKSB7XG4gICAgICBvcHRzLmNhY2hlID0gY2FjaGVzW3B0dG5dXG4gICAgfVxuXG4gICAgY2FjaGVzW3B0dG5dID0gKG5ldyBnbG9iLkdsb2IocHR0biwgb3B0cywgKGVyciwgcmVzdWx0cykgPT4ge1xuICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgIGVsc2Uge1xuICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdChyZXN1bHRzKVxuICAgICAgICByZXMoKVxuICAgICAgfVxuICAgIH0pKS5jYWNoZVxuICB9KSkpLnRoZW4oKCkgPT4ge1xuICAgIGNhY2hlLnZhbCgnZ2MnLCBjYWNoZXMpXG4gICAgcmVzb2x2ZShmaWxlcylcbiAgfSlcbn0pIl19