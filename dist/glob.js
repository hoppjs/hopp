'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _getPath = require('./get-path');

var _getPath2 = _interopRequireDefault(_getPath);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/glob.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

let globCache;

exports.default = (pattern, cwd) => new Promise((resolve, reject) => {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern];
  }

  let files = [];

  // glob eval all
  Promise.all(pattern.map(pttn => new Promise(res => {
    globCache = new _glob2.default.Glob(pttn, globCache !== undefined ? globCache : { cwd }, (err, results) => {
      if (err) reject(err);else {
        files = files.concat(results.map(file => _path2.default.resolve(cwd, (0, _getPath2.default)(file))));
        res();
      }
    });
  }))).then(() => {
    resolve(files);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZ2xvYkNhY2hlIiwicGF0dGVybiIsImN3ZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiQXJyYXkiLCJmaWxlcyIsImFsbCIsIm1hcCIsInB0dG4iLCJyZXMiLCJHbG9iIiwidW5kZWZpbmVkIiwiZXJyIiwicmVzdWx0cyIsImNvbmNhdCIsImZpbGUiLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7Ozs7O0FBVEE7Ozs7OztBQVdBLElBQUlDLFNBQUo7O2tCQUVlLENBQUNDLE9BQUQsRUFBVUMsR0FBVixLQUFrQixJQUFJQyxPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQ2hFO0FBQ0EsTUFBSSxFQUFFSixtQkFBbUJLLEtBQXJCLENBQUosRUFBaUM7QUFDL0JMLGNBQVUsQ0FBQ0EsT0FBRCxDQUFWO0FBQ0Q7O0FBRUQsTUFBSU0sUUFBUSxFQUFaOztBQUVBO0FBQ0FKLFVBQVFLLEdBQVIsQ0FBWVAsUUFBUVEsR0FBUixDQUFZQyxRQUFRLElBQUlQLE9BQUosQ0FBWVEsT0FBTztBQUNqRFgsZ0JBQVksSUFBSSxlQUFLWSxJQUFULENBQWNGLElBQWQsRUFBb0JWLGNBQWNhLFNBQWQsR0FBMEJiLFNBQTFCLEdBQXNDLEVBQUVFLEdBQUYsRUFBMUQsRUFBbUUsQ0FBQ1ksR0FBRCxFQUFNQyxPQUFOLEtBQWtCO0FBQy9GLFVBQUlELEdBQUosRUFBU1QsT0FBT1MsR0FBUCxFQUFULEtBQ0s7QUFDSFAsZ0JBQVFBLE1BQU1TLE1BQU4sQ0FBYUQsUUFBUU4sR0FBUixDQUFZUSxRQUFRLGVBQUtiLE9BQUwsQ0FBYUYsR0FBYixFQUFrQix1QkFBUWUsSUFBUixDQUFsQixDQUFwQixDQUFiLENBQVI7QUFDQU47QUFDRDtBQUNGLEtBTlcsQ0FBWjtBQU9ELEdBUitCLENBQXBCLENBQVosRUFRS08sSUFSTCxDQVFVLE1BQU07QUFDZGQsWUFBUUcsS0FBUjtBQUNELEdBVkQ7QUFXRCxDQXBCZ0MsQyIsImZpbGUiOiJnbG9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZ2xvYi5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuL2dldC1wYXRoJ1xuXG5sZXQgZ2xvYkNhY2hlXG5cbmV4cG9ydCBkZWZhdWx0IChwYXR0ZXJuLCBjd2QpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgLy8gcHJlZmVyIGFycmF5c1xuICBpZiAoIShwYXR0ZXJuIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgcGF0dGVybiA9IFtwYXR0ZXJuXVxuICB9XG5cbiAgbGV0IGZpbGVzID0gW11cblxuICAvLyBnbG9iIGV2YWwgYWxsXG4gIFByb21pc2UuYWxsKHBhdHRlcm4ubWFwKHB0dG4gPT4gbmV3IFByb21pc2UocmVzID0+IHtcbiAgICBnbG9iQ2FjaGUgPSBuZXcgZ2xvYi5HbG9iKHB0dG4sIGdsb2JDYWNoZSAhPT0gdW5kZWZpbmVkID8gZ2xvYkNhY2hlIDogeyBjd2QgfSwgKGVyciwgcmVzdWx0cykgPT4ge1xuICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgIGVsc2Uge1xuICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdChyZXN1bHRzLm1hcChmaWxlID0+IHBhdGgucmVzb2x2ZShjd2QsIGdldFBhdGgoZmlsZSkpKSlcbiAgICAgICAgcmVzKClcbiAgICAgIH1cbiAgICB9KVxuICB9KSkpLnRoZW4oKCkgPT4ge1xuICAgIHJlc29sdmUoZmlsZXMpXG4gIH0pXG59KSJdfQ==