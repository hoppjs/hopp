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

exports.default = function (pattern, cwd) {
  return new Promise(function (resolve, reject) {
    // prefer arrays
    if (!(pattern instanceof Array)) {
      pattern = [pattern];
    }

    var files = [];
    var caches = cache.val('gc') || {};

    // glob eval all
    Promise.all(pattern.map(function (pttn) {
      return new Promise(function (res) {
        var opts = { cwd: cwd };

        if (caches[pttn]) {
          opts.cache = caches[pttn];
        }

        caches[pttn] = new _glob2.default.Glob(pttn, opts, function (err, results) {
          if (err) reject(err);else {
            files = files.concat(results);
            res();
          }
        }).cache;
      });
    })).then(function () {
      cache.val('gc', caches);
      resolve(files);
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwicGF0dGVybiIsImN3ZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiQXJyYXkiLCJmaWxlcyIsImNhY2hlcyIsInZhbCIsImFsbCIsIm1hcCIsIm9wdHMiLCJwdHRuIiwiR2xvYiIsImVyciIsInJlc3VsdHMiLCJjb25jYXQiLCJyZXMiLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOztJQUFZQSxLOzs7Ozs7QUFQWjs7Ozs7O2tCQVNlLFVBQUNDLE9BQUQsRUFBVUMsR0FBVjtBQUFBLFNBQWtCLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDaEU7QUFDQSxRQUFJLEVBQUVKLG1CQUFtQkssS0FBckIsQ0FBSixFQUFpQztBQUMvQkwsZ0JBQVUsQ0FBQ0EsT0FBRCxDQUFWO0FBQ0Q7O0FBRUQsUUFBSU0sUUFBUSxFQUFaO0FBQ0EsUUFBTUMsU0FBU1IsTUFBTVMsR0FBTixDQUFVLElBQVYsS0FBbUIsRUFBbEM7O0FBRUE7QUFDQU4sWUFBUU8sR0FBUixDQUFZVCxRQUFRVSxHQUFSLENBQVk7QUFBQSxhQUFRLElBQUlSLE9BQUosQ0FBWSxlQUFPO0FBQ2pELFlBQU1TLE9BQU8sRUFBRVYsUUFBRixFQUFiOztBQUVBLFlBQUlNLE9BQU9LLElBQVAsQ0FBSixFQUFrQjtBQUNoQkQsZUFBS1osS0FBTCxHQUFhUSxPQUFPSyxJQUFQLENBQWI7QUFDRDs7QUFFREwsZUFBT0ssSUFBUCxJQUFnQixJQUFJLGVBQUtDLElBQVQsQ0FBY0QsSUFBZCxFQUFvQkQsSUFBcEIsRUFBMEIsVUFBQ0csR0FBRCxFQUFNQyxPQUFOLEVBQWtCO0FBQzFELGNBQUlELEdBQUosRUFBU1YsT0FBT1UsR0FBUCxFQUFULEtBQ0s7QUFDSFIsb0JBQVFBLE1BQU1VLE1BQU4sQ0FBYUQsT0FBYixDQUFSO0FBQ0FFO0FBQ0Q7QUFDRixTQU5lLENBQUQsQ0FNWGxCLEtBTko7QUFPRCxPQWQrQixDQUFSO0FBQUEsS0FBWixDQUFaLEVBY0ttQixJQWRMLENBY1UsWUFBTTtBQUNkbkIsWUFBTVMsR0FBTixDQUFVLElBQVYsRUFBZ0JELE1BQWhCO0FBQ0FKLGNBQVFHLEtBQVI7QUFDRCxLQWpCRDtBQWtCRCxHQTVCZ0MsQ0FBbEI7QUFBQSxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuXG5leHBvcnQgZGVmYXVsdCAocGF0dGVybiwgY3dkKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIGxldCBmaWxlcyA9IFtdXG4gIGNvbnN0IGNhY2hlcyA9IGNhY2hlLnZhbCgnZ2MnKSB8fCB7fVxuXG4gIC8vIGdsb2IgZXZhbCBhbGxcbiAgUHJvbWlzZS5hbGwocGF0dGVybi5tYXAocHR0biA9PiBuZXcgUHJvbWlzZShyZXMgPT4ge1xuICAgIGNvbnN0IG9wdHMgPSB7IGN3ZCB9XG5cbiAgICBpZiAoY2FjaGVzW3B0dG5dKSB7XG4gICAgICBvcHRzLmNhY2hlID0gY2FjaGVzW3B0dG5dXG4gICAgfVxuXG4gICAgY2FjaGVzW3B0dG5dID0gKG5ldyBnbG9iLkdsb2IocHR0biwgb3B0cywgKGVyciwgcmVzdWx0cykgPT4ge1xuICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgIGVsc2Uge1xuICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdChyZXN1bHRzKVxuICAgICAgICByZXMoKVxuICAgICAgfVxuICAgIH0pKS5jYWNoZVxuICB9KSkpLnRoZW4oKCkgPT4ge1xuICAgIGNhY2hlLnZhbCgnZ2MnLCBjYWNoZXMpXG4gICAgcmVzb2x2ZShmaWxlcylcbiAgfSlcbn0pIl19