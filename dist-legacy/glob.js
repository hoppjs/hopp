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

var globCache = void 0;

exports.default = function (pattern, cwd) {
  return new Promise(function (resolve, reject) {
    // prefer arrays
    if (!(pattern instanceof Array)) {
      pattern = [pattern];
    }

    var files = [];

    // glob eval all
    Promise.all(pattern.map(function (pttn) {
      return new Promise(function (res) {
        globCache = new _glob2.default.Glob(pttn, globCache !== undefined ? globCache : { cwd: cwd }, function (err, results) {
          if (err) reject(err);else {
            files = files.concat(results.map(function (file) {
              return _path2.default.resolve(cwd, (0, _getPath2.default)(file));
            }));
            res();
          }
        });
      });
    })).then(function () {
      resolve(files);
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZ2xvYkNhY2hlIiwicGF0dGVybiIsImN3ZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiQXJyYXkiLCJmaWxlcyIsImFsbCIsIm1hcCIsIkdsb2IiLCJwdHRuIiwidW5kZWZpbmVkIiwiZXJyIiwicmVzdWx0cyIsImNvbmNhdCIsImZpbGUiLCJyZXMiLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7Ozs7O0FBVEE7Ozs7OztBQVdBLElBQUlDLGtCQUFKOztrQkFFZSxVQUFDQyxPQUFELEVBQVVDLEdBQVY7QUFBQSxTQUFrQixJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ2hFO0FBQ0EsUUFBSSxFQUFFSixtQkFBbUJLLEtBQXJCLENBQUosRUFBaUM7QUFDL0JMLGdCQUFVLENBQUNBLE9BQUQsQ0FBVjtBQUNEOztBQUVELFFBQUlNLFFBQVEsRUFBWjs7QUFFQTtBQUNBSixZQUFRSyxHQUFSLENBQVlQLFFBQVFRLEdBQVIsQ0FBWTtBQUFBLGFBQVEsSUFBSU4sT0FBSixDQUFZLGVBQU87QUFDakRILG9CQUFZLElBQUksZUFBS1UsSUFBVCxDQUFjQyxJQUFkLEVBQW9CWCxjQUFjWSxTQUFkLEdBQTBCWixTQUExQixHQUFzQyxFQUFFRSxRQUFGLEVBQTFELEVBQW1FLFVBQUNXLEdBQUQsRUFBTUMsT0FBTixFQUFrQjtBQUMvRixjQUFJRCxHQUFKLEVBQVNSLE9BQU9RLEdBQVAsRUFBVCxLQUNLO0FBQ0hOLG9CQUFRQSxNQUFNUSxNQUFOLENBQWFELFFBQVFMLEdBQVIsQ0FBWTtBQUFBLHFCQUFRLGVBQUtMLE9BQUwsQ0FBYUYsR0FBYixFQUFrQix1QkFBUWMsSUFBUixDQUFsQixDQUFSO0FBQUEsYUFBWixDQUFiLENBQVI7QUFDQUM7QUFDRDtBQUNGLFNBTlcsQ0FBWjtBQU9ELE9BUitCLENBQVI7QUFBQSxLQUFaLENBQVosRUFRS0MsSUFSTCxDQVFVLFlBQU07QUFDZGQsY0FBUUcsS0FBUjtBQUNELEtBVkQ7QUFXRCxHQXBCZ0MsQ0FBbEI7QUFBQSxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4vZ2V0LXBhdGgnXG5cbmxldCBnbG9iQ2FjaGVcblxuZXhwb3J0IGRlZmF1bHQgKHBhdHRlcm4sIGN3ZCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAvLyBwcmVmZXIgYXJyYXlzXG4gIGlmICghKHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXR0ZXJuID0gW3BhdHRlcm5dXG4gIH1cblxuICBsZXQgZmlsZXMgPSBbXVxuXG4gIC8vIGdsb2IgZXZhbCBhbGxcbiAgUHJvbWlzZS5hbGwocGF0dGVybi5tYXAocHR0biA9PiBuZXcgUHJvbWlzZShyZXMgPT4ge1xuICAgIGdsb2JDYWNoZSA9IG5ldyBnbG9iLkdsb2IocHR0biwgZ2xvYkNhY2hlICE9PSB1bmRlZmluZWQgPyBnbG9iQ2FjaGUgOiB7IGN3ZCB9LCAoZXJyLCByZXN1bHRzKSA9PiB7XG4gICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgZWxzZSB7XG4gICAgICAgIGZpbGVzID0gZmlsZXMuY29uY2F0KHJlc3VsdHMubWFwKGZpbGUgPT4gcGF0aC5yZXNvbHZlKGN3ZCwgZ2V0UGF0aChmaWxlKSkpKVxuICAgICAgICByZXMoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pKSkudGhlbigoKSA9PiB7XG4gICAgcmVzb2x2ZShmaWxlcylcbiAgfSlcbn0pIl19