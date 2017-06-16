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

var globCache = void 0;

exports.default = function (pattern, cwd) {
  return new Promise(function (resolve, reject) {
    // prefer arrays
    if (!(pattern instanceof Array)) {
      pattern = [pattern];
    }

    var files = [];
    var gc = cache.val('gc') || {};

    // glob eval all
    Promise.all(pattern.map(function (pttn) {
      return new Promise(function (res) {
        // const opts = globCache !== undefined ? globCache : { cwd, cache: gc }
        var opts = globCache !== undefined ? globCache : { cwd: cwd };

        globCache = new _glob2.default.Glob(pttn, opts, function (err, results) {
          if (err) reject(err);else {
            files = files.concat(results);
            res();
          }
        });

        // console.log(require('util').inspect(g,{colors:true,depth:Infinity}))
        // console.log(JSON.stringify(g.statCache,null,2))

        gc = globCache.cache;
      });
    })).then(function () {
      cache.val('gc', gc);
      resolve(files);
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZ2xvYkNhY2hlIiwicGF0dGVybiIsImN3ZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiQXJyYXkiLCJmaWxlcyIsImdjIiwidmFsIiwiYWxsIiwibWFwIiwib3B0cyIsInVuZGVmaW5lZCIsIkdsb2IiLCJwdHRuIiwiZXJyIiwicmVzdWx0cyIsImNvbmNhdCIsInJlcyIsInRoZW4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7O0lBQVlBLEs7Ozs7OztBQVBaOzs7Ozs7QUFTQSxJQUFJQyxrQkFBSjs7a0JBRWUsVUFBQ0MsT0FBRCxFQUFVQyxHQUFWO0FBQUEsU0FBa0IsSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNoRTtBQUNBLFFBQUksRUFBRUosbUJBQW1CSyxLQUFyQixDQUFKLEVBQWlDO0FBQy9CTCxnQkFBVSxDQUFDQSxPQUFELENBQVY7QUFDRDs7QUFFRCxRQUFJTSxRQUFRLEVBQVo7QUFDQSxRQUFJQyxLQUFLVCxNQUFNVSxHQUFOLENBQVUsSUFBVixLQUFtQixFQUE1Qjs7QUFFQTtBQUNBTixZQUFRTyxHQUFSLENBQVlULFFBQVFVLEdBQVIsQ0FBWTtBQUFBLGFBQVEsSUFBSVIsT0FBSixDQUFZLGVBQU87QUFDakQ7QUFDQSxZQUFNUyxPQUFPWixjQUFjYSxTQUFkLEdBQTBCYixTQUExQixHQUFzQyxFQUFFRSxRQUFGLEVBQW5EOztBQUVBRixvQkFBWSxJQUFJLGVBQUtjLElBQVQsQ0FBY0MsSUFBZCxFQUFvQkgsSUFBcEIsRUFBMEIsVUFBQ0ksR0FBRCxFQUFNQyxPQUFOLEVBQWtCO0FBQ3RELGNBQUlELEdBQUosRUFBU1gsT0FBT1csR0FBUCxFQUFULEtBQ0s7QUFDSFQsb0JBQVFBLE1BQU1XLE1BQU4sQ0FBYUQsT0FBYixDQUFSO0FBQ0FFO0FBQ0Q7QUFDRixTQU5XLENBQVo7O0FBUUE7QUFDQTs7QUFFQVgsYUFBS1IsVUFBVUQsS0FBZjtBQUNELE9BaEIrQixDQUFSO0FBQUEsS0FBWixDQUFaLEVBZ0JLcUIsSUFoQkwsQ0FnQlUsWUFBTTtBQUNkckIsWUFBTVUsR0FBTixDQUFVLElBQVYsRUFBZ0JELEVBQWhCO0FBQ0FKLGNBQVFHLEtBQVI7QUFDRCxLQW5CRDtBQW9CRCxHQTlCZ0MsQ0FBbEI7QUFBQSxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuXG5sZXQgZ2xvYkNhY2hlXG5cbmV4cG9ydCBkZWZhdWx0IChwYXR0ZXJuLCBjd2QpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgLy8gcHJlZmVyIGFycmF5c1xuICBpZiAoIShwYXR0ZXJuIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgcGF0dGVybiA9IFtwYXR0ZXJuXVxuICB9XG5cbiAgbGV0IGZpbGVzID0gW11cbiAgbGV0IGdjID0gY2FjaGUudmFsKCdnYycpIHx8IHt9XG5cbiAgLy8gZ2xvYiBldmFsIGFsbFxuICBQcm9taXNlLmFsbChwYXR0ZXJuLm1hcChwdHRuID0+IG5ldyBQcm9taXNlKHJlcyA9PiB7XG4gICAgLy8gY29uc3Qgb3B0cyA9IGdsb2JDYWNoZSAhPT0gdW5kZWZpbmVkID8gZ2xvYkNhY2hlIDogeyBjd2QsIGNhY2hlOiBnYyB9XG4gICAgY29uc3Qgb3B0cyA9IGdsb2JDYWNoZSAhPT0gdW5kZWZpbmVkID8gZ2xvYkNhY2hlIDogeyBjd2QgfVxuXG4gICAgZ2xvYkNhY2hlID0gbmV3IGdsb2IuR2xvYihwdHRuLCBvcHRzLCAoZXJyLCByZXN1bHRzKSA9PiB7XG4gICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgZWxzZSB7XG4gICAgICAgIGZpbGVzID0gZmlsZXMuY29uY2F0KHJlc3VsdHMpXG4gICAgICAgIHJlcygpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIGNvbnNvbGUubG9nKHJlcXVpcmUoJ3V0aWwnKS5pbnNwZWN0KGcse2NvbG9yczp0cnVlLGRlcHRoOkluZmluaXR5fSkpXG4gICAgLy8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZy5zdGF0Q2FjaGUsbnVsbCwyKSlcblxuICAgIGdjID0gZ2xvYkNhY2hlLmNhY2hlXG4gIH0pKSkudGhlbigoKSA9PiB7XG4gICAgY2FjaGUudmFsKCdnYycsIGdjKVxuICAgIHJlc29sdmUoZmlsZXMpXG4gIH0pXG59KSJdfQ==