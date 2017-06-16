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
        files = files.concat(results);
        res();
      }
    });
  }))).then(() => {
    resolve(files);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZ2xvYkNhY2hlIiwicGF0dGVybiIsImN3ZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiQXJyYXkiLCJmaWxlcyIsImFsbCIsIm1hcCIsInB0dG4iLCJyZXMiLCJHbG9iIiwidW5kZWZpbmVkIiwiZXJyIiwicmVzdWx0cyIsImNvbmNhdCIsInRoZW4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7O0lBQVlBLEs7Ozs7OztBQVBaOzs7Ozs7QUFTQSxJQUFJQyxTQUFKOztrQkFFZSxDQUFDQyxPQUFELEVBQVVDLEdBQVYsS0FBa0IsSUFBSUMsT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUNoRTtBQUNBLE1BQUksRUFBRUosbUJBQW1CSyxLQUFyQixDQUFKLEVBQWlDO0FBQy9CTCxjQUFVLENBQUNBLE9BQUQsQ0FBVjtBQUNEOztBQUVELE1BQUlNLFFBQVEsRUFBWjs7QUFFQTtBQUNBSixVQUFRSyxHQUFSLENBQVlQLFFBQVFRLEdBQVIsQ0FBWUMsUUFBUSxJQUFJUCxPQUFKLENBQVlRLE9BQU87QUFDakRYLGdCQUFZLElBQUksZUFBS1ksSUFBVCxDQUFjRixJQUFkLEVBQW9CVixjQUFjYSxTQUFkLEdBQTBCYixTQUExQixHQUFzQyxFQUFFRSxHQUFGLEVBQTFELEVBQW1FLENBQUNZLEdBQUQsRUFBTUMsT0FBTixLQUFrQjtBQUMvRixVQUFJRCxHQUFKLEVBQVNULE9BQU9TLEdBQVAsRUFBVCxLQUNLO0FBQ0hQLGdCQUFRQSxNQUFNUyxNQUFOLENBQWFELE9BQWIsQ0FBUjtBQUNBSjtBQUNEO0FBQ0YsS0FOVyxDQUFaO0FBT0QsR0FSK0IsQ0FBcEIsQ0FBWixFQVFLTSxJQVJMLENBUVUsTUFBTTtBQUNkYixZQUFRRyxLQUFSO0FBQ0QsR0FWRDtBQVdELENBcEJnQyxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuXG5sZXQgZ2xvYkNhY2hlXG5cbmV4cG9ydCBkZWZhdWx0IChwYXR0ZXJuLCBjd2QpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgLy8gcHJlZmVyIGFycmF5c1xuICBpZiAoIShwYXR0ZXJuIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgcGF0dGVybiA9IFtwYXR0ZXJuXVxuICB9XG5cbiAgbGV0IGZpbGVzID0gW11cblxuICAvLyBnbG9iIGV2YWwgYWxsXG4gIFByb21pc2UuYWxsKHBhdHRlcm4ubWFwKHB0dG4gPT4gbmV3IFByb21pc2UocmVzID0+IHtcbiAgICBnbG9iQ2FjaGUgPSBuZXcgZ2xvYi5HbG9iKHB0dG4sIGdsb2JDYWNoZSAhPT0gdW5kZWZpbmVkID8gZ2xvYkNhY2hlIDogeyBjd2QgfSwgKGVyciwgcmVzdWx0cykgPT4ge1xuICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgIGVsc2Uge1xuICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdChyZXN1bHRzKVxuICAgICAgICByZXMoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pKSkudGhlbigoKSA9PiB7XG4gICAgcmVzb2x2ZShmaWxlcylcbiAgfSlcbn0pIl19