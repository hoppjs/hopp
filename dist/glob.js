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
  let gc = cache.val('gc') || {};

  // glob eval all
  Promise.all(pattern.map(pttn => new Promise(res => {
    // const opts = globCache !== undefined ? globCache : { cwd, cache: gc }
    const opts = globCache !== undefined ? globCache : { cwd };

    globCache = new _glob2.default.Glob(pttn, opts, (err, results) => {
      if (err) reject(err);else {
        files = files.concat(results);
        res();
      }
    });

    // console.log(require('util').inspect(g,{colors:true,depth:Infinity}))
    // console.log(JSON.stringify(g.statCache,null,2))

    gc = globCache.cache;
  }))).then(() => {
    cache.val('gc', gc);
    resolve(files);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZ2xvYkNhY2hlIiwicGF0dGVybiIsImN3ZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiQXJyYXkiLCJmaWxlcyIsImdjIiwidmFsIiwiYWxsIiwibWFwIiwicHR0biIsInJlcyIsIm9wdHMiLCJ1bmRlZmluZWQiLCJHbG9iIiwiZXJyIiwicmVzdWx0cyIsImNvbmNhdCIsInRoZW4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7O0lBQVlBLEs7Ozs7OztBQVBaOzs7Ozs7QUFTQSxJQUFJQyxTQUFKOztrQkFFZSxDQUFDQyxPQUFELEVBQVVDLEdBQVYsS0FBa0IsSUFBSUMsT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUNoRTtBQUNBLE1BQUksRUFBRUosbUJBQW1CSyxLQUFyQixDQUFKLEVBQWlDO0FBQy9CTCxjQUFVLENBQUNBLE9BQUQsQ0FBVjtBQUNEOztBQUVELE1BQUlNLFFBQVEsRUFBWjtBQUNBLE1BQUlDLEtBQUtULE1BQU1VLEdBQU4sQ0FBVSxJQUFWLEtBQW1CLEVBQTVCOztBQUVBO0FBQ0FOLFVBQVFPLEdBQVIsQ0FBWVQsUUFBUVUsR0FBUixDQUFZQyxRQUFRLElBQUlULE9BQUosQ0FBWVUsT0FBTztBQUNqRDtBQUNBLFVBQU1DLE9BQU9kLGNBQWNlLFNBQWQsR0FBMEJmLFNBQTFCLEdBQXNDLEVBQUVFLEdBQUYsRUFBbkQ7O0FBRUFGLGdCQUFZLElBQUksZUFBS2dCLElBQVQsQ0FBY0osSUFBZCxFQUFvQkUsSUFBcEIsRUFBMEIsQ0FBQ0csR0FBRCxFQUFNQyxPQUFOLEtBQWtCO0FBQ3RELFVBQUlELEdBQUosRUFBU1osT0FBT1ksR0FBUCxFQUFULEtBQ0s7QUFDSFYsZ0JBQVFBLE1BQU1ZLE1BQU4sQ0FBYUQsT0FBYixDQUFSO0FBQ0FMO0FBQ0Q7QUFDRixLQU5XLENBQVo7O0FBUUE7QUFDQTs7QUFFQUwsU0FBS1IsVUFBVUQsS0FBZjtBQUNELEdBaEIrQixDQUFwQixDQUFaLEVBZ0JLcUIsSUFoQkwsQ0FnQlUsTUFBTTtBQUNkckIsVUFBTVUsR0FBTixDQUFVLElBQVYsRUFBZ0JELEVBQWhCO0FBQ0FKLFlBQVFHLEtBQVI7QUFDRCxHQW5CRDtBQW9CRCxDQTlCZ0MsQyIsImZpbGUiOiJnbG9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZ2xvYi5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcblxubGV0IGdsb2JDYWNoZVxuXG5leHBvcnQgZGVmYXVsdCAocGF0dGVybiwgY3dkKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIGxldCBmaWxlcyA9IFtdXG4gIGxldCBnYyA9IGNhY2hlLnZhbCgnZ2MnKSB8fCB7fVxuXG4gIC8vIGdsb2IgZXZhbCBhbGxcbiAgUHJvbWlzZS5hbGwocGF0dGVybi5tYXAocHR0biA9PiBuZXcgUHJvbWlzZShyZXMgPT4ge1xuICAgIC8vIGNvbnN0IG9wdHMgPSBnbG9iQ2FjaGUgIT09IHVuZGVmaW5lZCA/IGdsb2JDYWNoZSA6IHsgY3dkLCBjYWNoZTogZ2MgfVxuICAgIGNvbnN0IG9wdHMgPSBnbG9iQ2FjaGUgIT09IHVuZGVmaW5lZCA/IGdsb2JDYWNoZSA6IHsgY3dkIH1cblxuICAgIGdsb2JDYWNoZSA9IG5ldyBnbG9iLkdsb2IocHR0biwgb3B0cywgKGVyciwgcmVzdWx0cykgPT4ge1xuICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgIGVsc2Uge1xuICAgICAgICBmaWxlcyA9IGZpbGVzLmNvbmNhdChyZXN1bHRzKVxuICAgICAgICByZXMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBjb25zb2xlLmxvZyhyZXF1aXJlKCd1dGlsJykuaW5zcGVjdChnLHtjb2xvcnM6dHJ1ZSxkZXB0aDpJbmZpbml0eX0pKVxuICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGcuc3RhdENhY2hlLG51bGwsMikpXG5cbiAgICBnYyA9IGdsb2JDYWNoZS5jYWNoZVxuICB9KSkpLnRoZW4oKCkgPT4ge1xuICAgIGNhY2hlLnZhbCgnZ2MnLCBnYylcbiAgICByZXNvbHZlKGZpbGVzKVxuICB9KVxufSkiXX0=