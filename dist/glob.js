'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _getPath = require('./get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _fs = require('./fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let statCache; /**
                * @file src/glob.js
                * @license MIT
                * @copyright 2017 Karim Alibhai.
                */

const tempCache = {};

exports.default = async (pattern, cwd, useDoubleCache = false) => {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern];
  }

  // get cache
  if (statCache === undefined) {
    statCache = cache.val('sc') || {};
  }

  /**
   * Recursive walk.
   */
  async function walk(pttn, directory, recursive = false) {
    if (pttn.length === 0) {
      return;
    }

    const curr = pttn.shift();
    let localResults = [];

    for (let file of await (0, _fs.readdir)(directory)) {
      // fix file path
      const filepath = directory + _path2.default.sep + file;

      // get stat from temp cache (for non-watch tasks) or stat()
      let fstat;

      if (useDoubleCache) {
        fstat = tempCache[filepath] = tempCache[filepath] || (await (0, _fs.stat)(filepath));
      } else {
        fstat = await (0, _fs.stat)(filepath);
      }

      // has been modified
      if ((0, _minimatch2.default)(file, curr)) {
        if (fstat.isFile()) {
          if (!statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime) {
            statCache[filepath] = +fstat.mtime;
            localResults.push(filepath);
          }
        } else {
          localResults = localResults.concat((await walk(pttn, filepath, recursive || curr === '**')));
        }
      } else if (fstat.isDirectory() && recursive) {
        localResults = localResults.concat((await walk([curr].concat(pttn), filepath, recursive)));
      }
    }

    return localResults;
  }

  /**
   * Run all patterns against directory.
   */
  let results = [];
  for (let pttn of pattern) {
    if (pttn[0] === '/') {
      throw new Error('Not sure what to do with the / in your glob.');
    }

    results = results.concat((await walk(pttn.split('/'), cwd)));
  }

  /**
   * Update cache.
   */
  cache.val('sc', statCache

  /**
   * Return final results object.
   */
  );return results;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInVzZURvdWJsZUNhY2hlIiwiQXJyYXkiLCJ1bmRlZmluZWQiLCJ2YWwiLCJ3YWxrIiwicHR0biIsImRpcmVjdG9yeSIsInJlY3Vyc2l2ZSIsImxlbmd0aCIsImN1cnIiLCJzaGlmdCIsImxvY2FsUmVzdWx0cyIsImZpbGUiLCJmaWxlcGF0aCIsInNlcCIsImZzdGF0IiwiaXNGaWxlIiwiaGFzT3duUHJvcGVydHkiLCJtdGltZSIsInB1c2giLCJjb25jYXQiLCJpc0RpcmVjdG9yeSIsInJlc3VsdHMiLCJFcnJvciIsInNwbGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBSUMsU0FBSixDLENBWkE7Ozs7OztBQWFBLE1BQU1DLFlBQVksRUFBbEI7O2tCQUVlLE9BQU9DLE9BQVAsRUFBZ0JDLEdBQWhCLEVBQXFCQyxpQkFBaUIsS0FBdEMsS0FBZ0Q7QUFDN0Q7QUFDQSxNQUFJLEVBQUVGLG1CQUFtQkcsS0FBckIsQ0FBSixFQUFpQztBQUMvQkgsY0FBVSxDQUFDQSxPQUFELENBQVY7QUFDRDs7QUFFRDtBQUNBLE1BQUlGLGNBQWNNLFNBQWxCLEVBQTZCO0FBQzNCTixnQkFBWUQsTUFBTVEsR0FBTixDQUFVLElBQVYsS0FBbUIsRUFBL0I7QUFDRDs7QUFFRDs7O0FBR0EsaUJBQWVDLElBQWYsQ0FBb0JDLElBQXBCLEVBQTBCQyxTQUExQixFQUFxQ0MsWUFBWSxLQUFqRCxFQUF3RDtBQUN0RCxRQUFJRixLQUFLRyxNQUFMLEtBQWdCLENBQXBCLEVBQXVCO0FBQ3JCO0FBQ0Q7O0FBRUQsVUFBTUMsT0FBT0osS0FBS0ssS0FBTCxFQUFiO0FBQ0EsUUFBSUMsZUFBZSxFQUFuQjs7QUFFQSxTQUFLLElBQUlDLElBQVQsSUFBa0IsTUFBTSxpQkFBUU4sU0FBUixDQUF4QixFQUE2QztBQUMzQztBQUNBLFlBQU1PLFdBQVdQLFlBQVksZUFBS1EsR0FBakIsR0FBdUJGLElBQXhDOztBQUVBO0FBQ0EsVUFBSUcsS0FBSjs7QUFFQSxVQUFJZixjQUFKLEVBQW9CO0FBQ2xCZSxnQkFBUWxCLFVBQVVnQixRQUFWLElBQXNCaEIsVUFBVWdCLFFBQVYsTUFBdUIsTUFBTSxjQUFLQSxRQUFMLENBQTdCLENBQTlCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xFLGdCQUFRLE1BQU0sY0FBS0YsUUFBTCxDQUFkO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJLHlCQUFNRCxJQUFOLEVBQVlILElBQVosQ0FBSixFQUF1QjtBQUNyQixZQUFJTSxNQUFNQyxNQUFOLEVBQUosRUFBb0I7QUFDbEIsY0FBSSxDQUFDcEIsVUFBVXFCLGNBQVYsQ0FBeUJKLFFBQXpCLENBQUQsSUFBdUNqQixVQUFVaUIsUUFBVixNQUF3QixDQUFDRSxNQUFNRyxLQUExRSxFQUFpRjtBQUMvRXRCLHNCQUFVaUIsUUFBVixJQUFzQixDQUFDRSxNQUFNRyxLQUE3QjtBQUNBUCx5QkFBYVEsSUFBYixDQUFrQk4sUUFBbEI7QUFDRDtBQUNGLFNBTEQsTUFLTztBQUNMRix5QkFBZUEsYUFBYVMsTUFBYixFQUFvQixNQUFNaEIsS0FBS0MsSUFBTCxFQUFXUSxRQUFYLEVBQXFCTixhQUFhRSxTQUFTLElBQTNDLENBQTFCLEVBQWY7QUFDRDtBQUNGLE9BVEQsTUFTTyxJQUFJTSxNQUFNTSxXQUFOLE1BQXVCZCxTQUEzQixFQUFzQztBQUMzQ0ksdUJBQWVBLGFBQWFTLE1BQWIsRUFBb0IsTUFBTWhCLEtBQUssQ0FBQ0ssSUFBRCxFQUFPVyxNQUFQLENBQWNmLElBQWQsQ0FBTCxFQUEwQlEsUUFBMUIsRUFBb0NOLFNBQXBDLENBQTFCLEVBQWY7QUFDRDtBQUNGOztBQUVELFdBQU9JLFlBQVA7QUFDRDs7QUFFRDs7O0FBR0EsTUFBSVcsVUFBVSxFQUFkO0FBQ0EsT0FBSyxJQUFJakIsSUFBVCxJQUFpQlAsT0FBakIsRUFBMEI7QUFDeEIsUUFBSU8sS0FBSyxDQUFMLE1BQVksR0FBaEIsRUFBcUI7QUFDbkIsWUFBTSxJQUFJa0IsS0FBSixDQUFVLDhDQUFWLENBQU47QUFDRDs7QUFFREQsY0FBVUEsUUFBUUYsTUFBUixFQUFlLE1BQU1oQixLQUFLQyxLQUFLbUIsS0FBTCxDQUFXLEdBQVgsQ0FBTCxFQUFzQnpCLEdBQXRCLENBQXJCLEVBQVY7QUFDRDs7QUFFRDs7O0FBR0FKLFFBQU1RLEdBQU4sQ0FBVSxJQUFWLEVBQWdCUDs7QUFFaEI7OztBQUZBLElBS0EsT0FBTzBCLE9BQVA7QUFDRCxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4vZ2V0LXBhdGgnXG5pbXBvcnQgeyByZWFkZGlyLCBzdGF0IH0gZnJvbSAnLi9mcydcblxubGV0IHN0YXRDYWNoZVxuY29uc3QgdGVtcENhY2hlID0ge31cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHBhdHRlcm4sIGN3ZCwgdXNlRG91YmxlQ2FjaGUgPSBmYWxzZSkgPT4ge1xuICAvLyBwcmVmZXIgYXJyYXlzXG4gIGlmICghKHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXR0ZXJuID0gW3BhdHRlcm5dXG4gIH1cblxuICAvLyBnZXQgY2FjaGVcbiAgaWYgKHN0YXRDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhdENhY2hlID0gY2FjaGUudmFsKCdzYycpIHx8IHt9XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlIHdhbGsuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiB3YWxrKHB0dG4sIGRpcmVjdG9yeSwgcmVjdXJzaXZlID0gZmFsc2UpIHtcbiAgICBpZiAocHR0bi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnIgPSBwdHRuLnNoaWZ0KClcbiAgICBsZXQgbG9jYWxSZXN1bHRzID0gW11cblxuICAgIGZvciAobGV0IGZpbGUgb2YgKGF3YWl0IHJlYWRkaXIoZGlyZWN0b3J5KSkpIHtcbiAgICAgIC8vIGZpeCBmaWxlIHBhdGhcbiAgICAgIGNvbnN0IGZpbGVwYXRoID0gZGlyZWN0b3J5ICsgcGF0aC5zZXAgKyBmaWxlXG5cbiAgICAgIC8vIGdldCBzdGF0IGZyb20gdGVtcCBjYWNoZSAoZm9yIG5vbi13YXRjaCB0YXNrcykgb3Igc3RhdCgpXG4gICAgICBsZXQgZnN0YXRcblxuICAgICAgaWYgKHVzZURvdWJsZUNhY2hlKSB7XG4gICAgICAgIGZzdGF0ID0gdGVtcENhY2hlW2ZpbGVwYXRoXSA9IHRlbXBDYWNoZVtmaWxlcGF0aF0gfHwgYXdhaXQgc3RhdChmaWxlcGF0aClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzdGF0ID0gYXdhaXQgc3RhdChmaWxlcGF0aClcbiAgICAgIH1cblxuICAgICAgLy8gaGFzIGJlZW4gbW9kaWZpZWRcbiAgICAgIGlmIChtYXRjaChmaWxlLCBjdXJyKSkge1xuICAgICAgICBpZiAoZnN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgICBpZiAoIXN0YXRDYWNoZS5oYXNPd25Qcm9wZXJ0eShmaWxlcGF0aCkgfHwgc3RhdENhY2hlW2ZpbGVwYXRoXSAhPT0gK2ZzdGF0Lm10aW1lKSB7XG4gICAgICAgICAgICBzdGF0Q2FjaGVbZmlsZXBhdGhdID0gK2ZzdGF0Lm10aW1lXG4gICAgICAgICAgICBsb2NhbFJlc3VsdHMucHVzaChmaWxlcGF0aClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9jYWxSZXN1bHRzID0gbG9jYWxSZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4sIGZpbGVwYXRoLCByZWN1cnNpdmUgfHwgY3VyciA9PT0gJyoqJykpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZnN0YXQuaXNEaXJlY3RvcnkoKSAmJiByZWN1cnNpdmUpIHtcbiAgICAgICAgbG9jYWxSZXN1bHRzID0gbG9jYWxSZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKFtjdXJyXS5jb25jYXQocHR0biksIGZpbGVwYXRoLCByZWN1cnNpdmUpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsb2NhbFJlc3VsdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYWxsIHBhdHRlcm5zIGFnYWluc3QgZGlyZWN0b3J5LlxuICAgKi9cbiAgbGV0IHJlc3VsdHMgPSBbXVxuICBmb3IgKGxldCBwdHRuIG9mIHBhdHRlcm4pIHtcbiAgICBpZiAocHR0blswXSA9PT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzdXJlIHdoYXQgdG8gZG8gd2l0aCB0aGUgLyBpbiB5b3VyIGdsb2IuJylcbiAgICB9XG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhwdHRuLnNwbGl0KCcvJyksIGN3ZCkpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGNhY2hlLlxuICAgKi9cbiAgY2FjaGUudmFsKCdzYycsIHN0YXRDYWNoZSlcblxuICAvKipcbiAgICogUmV0dXJuIGZpbmFsIHJlc3VsdHMgb2JqZWN0LlxuICAgKi9cbiAgcmV0dXJuIHJlc3VsdHNcbn0iXX0=