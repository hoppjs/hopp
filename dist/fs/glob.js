'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _getPath = require('./get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _ = require('./');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { debug } = require('../utils/log')('hopp:glob'); /**
                                                         * @file src/glob.js
                                                         * @license MIT
                                                         * @copyright 2017 Karim Alibhai.
                                                         */

let statCache;
const tempCache = {};

exports.default = async (pattern, cwd, useDoubleCache = false, recache = false) => {
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

    debug('curr: %s, dir = %s, recur = %s, recache = %s', curr, directory, recursive, recache);

    for (let file of await (0, _.readdir)(directory)) {
      // fix file path
      const filepath = directory + _path2.default.sep + file;

      // get stat from temp cache (for non-watch tasks) or stat()
      let fstat;

      if (useDoubleCache) {
        fstat = tempCache[filepath] = tempCache[filepath] || (await (0, _.stat)(filepath));
      } else {
        fstat = await (0, _.stat)(filepath);
      }

      // has been modified
      if ((0, _minimatch2.default)(file, curr)) {
        if (fstat.isFile()) {
          if (recache || !statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime) {
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
  cache.val('sc', statCache);

  /**
   * Return final results object.
   */
  return results;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZGVidWciLCJyZXF1aXJlIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInVzZURvdWJsZUNhY2hlIiwicmVjYWNoZSIsIkFycmF5IiwidW5kZWZpbmVkIiwidmFsIiwid2FsayIsInB0dG4iLCJkaXJlY3RvcnkiLCJyZWN1cnNpdmUiLCJsZW5ndGgiLCJjdXJyIiwic2hpZnQiLCJsb2NhbFJlc3VsdHMiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsImlzRmlsZSIsImhhc093blByb3BlcnR5IiwibXRpbWUiLCJwdXNoIiwiY29uY2F0IiwiaXNEaXJlY3RvcnkiLCJyZXN1bHRzIiwiRXJyb3IiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU0sRUFBRUMsS0FBRixLQUFZQyxRQUFRLGNBQVIsRUFBd0IsV0FBeEIsQ0FBbEIsQyxDQVpBOzs7Ozs7QUFjQSxJQUFJQyxTQUFKO0FBQ0EsTUFBTUMsWUFBWSxFQUFsQjs7a0JBRWUsT0FBT0MsT0FBUCxFQUFnQkMsR0FBaEIsRUFBcUJDLGlCQUFpQixLQUF0QyxFQUE2Q0MsVUFBVSxLQUF2RCxLQUFpRTtBQUM5RTtBQUNBLE1BQUksRUFBRUgsbUJBQW1CSSxLQUFyQixDQUFKLEVBQWlDO0FBQy9CSixjQUFVLENBQUNBLE9BQUQsQ0FBVjtBQUNEOztBQUVEO0FBQ0EsTUFBSUYsY0FBY08sU0FBbEIsRUFBNkI7QUFDM0JQLGdCQUFZSCxNQUFNVyxHQUFOLENBQVUsSUFBVixLQUFtQixFQUEvQjtBQUNEOztBQUVEOzs7QUFHQSxpQkFBZUMsSUFBZixDQUFvQkMsSUFBcEIsRUFBMEJDLFNBQTFCLEVBQXFDQyxZQUFZLEtBQWpELEVBQXdEO0FBQ3RELFFBQUlGLEtBQUtHLE1BQUwsS0FBZ0IsQ0FBcEIsRUFBdUI7QUFDckI7QUFDRDs7QUFFRCxVQUFNQyxPQUFPSixLQUFLSyxLQUFMLEVBQWI7QUFDQSxRQUFJQyxlQUFlLEVBQW5COztBQUVBbEIsVUFBTSw4Q0FBTixFQUFzRGdCLElBQXRELEVBQTRESCxTQUE1RCxFQUF1RUMsU0FBdkUsRUFBa0ZQLE9BQWxGOztBQUVBLFNBQUssSUFBSVksSUFBVCxJQUFrQixNQUFNLGVBQVFOLFNBQVIsQ0FBeEIsRUFBNkM7QUFDM0M7QUFDQSxZQUFNTyxXQUFXUCxZQUFZLGVBQUtRLEdBQWpCLEdBQXVCRixJQUF4Qzs7QUFFQTtBQUNBLFVBQUlHLEtBQUo7O0FBRUEsVUFBSWhCLGNBQUosRUFBb0I7QUFDbEJnQixnQkFBUW5CLFVBQVVpQixRQUFWLElBQXNCakIsVUFBVWlCLFFBQVYsTUFBdUIsTUFBTSxZQUFLQSxRQUFMLENBQTdCLENBQTlCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xFLGdCQUFRLE1BQU0sWUFBS0YsUUFBTCxDQUFkO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJLHlCQUFNRCxJQUFOLEVBQVlILElBQVosQ0FBSixFQUF1QjtBQUNyQixZQUFJTSxNQUFNQyxNQUFOLEVBQUosRUFBb0I7QUFDbEIsY0FBSWhCLFdBQVcsQ0FBQ0wsVUFBVXNCLGNBQVYsQ0FBeUJKLFFBQXpCLENBQVosSUFBa0RsQixVQUFVa0IsUUFBVixNQUF3QixDQUFDRSxNQUFNRyxLQUFyRixFQUE0RjtBQUMxRnZCLHNCQUFVa0IsUUFBVixJQUFzQixDQUFDRSxNQUFNRyxLQUE3QjtBQUNBUCx5QkFBYVEsSUFBYixDQUFrQk4sUUFBbEI7QUFDRDtBQUNGLFNBTEQsTUFLTztBQUNMRix5QkFBZUEsYUFBYVMsTUFBYixFQUFvQixNQUFNaEIsS0FBS0MsSUFBTCxFQUFXUSxRQUFYLEVBQXFCTixhQUFhRSxTQUFTLElBQTNDLENBQTFCLEVBQWY7QUFDRDtBQUNGLE9BVEQsTUFTTyxJQUFJTSxNQUFNTSxXQUFOLE1BQXVCZCxTQUEzQixFQUFzQztBQUMzQ0ksdUJBQWVBLGFBQWFTLE1BQWIsRUFBb0IsTUFBTWhCLEtBQUssQ0FBQ0ssSUFBRCxFQUFPVyxNQUFQLENBQWNmLElBQWQsQ0FBTCxFQUEwQlEsUUFBMUIsRUFBb0NOLFNBQXBDLENBQTFCLEVBQWY7QUFDRDtBQUNGOztBQUVELFdBQU9JLFlBQVA7QUFDRDs7QUFFRDs7O0FBR0EsTUFBSVcsVUFBVSxFQUFkO0FBQ0EsT0FBSyxJQUFJakIsSUFBVCxJQUFpQlIsT0FBakIsRUFBMEI7QUFDeEIsUUFBSVEsS0FBSyxDQUFMLE1BQVksR0FBaEIsRUFBcUI7QUFDbkIsWUFBTSxJQUFJa0IsS0FBSixDQUFVLDhDQUFWLENBQU47QUFDRDs7QUFFREQsY0FBVUEsUUFBUUYsTUFBUixFQUFlLE1BQU1oQixLQUFLQyxLQUFLbUIsS0FBTCxDQUFXLEdBQVgsQ0FBTCxFQUFzQjFCLEdBQXRCLENBQXJCLEVBQVY7QUFDRDs7QUFFRDs7O0FBR0FOLFFBQU1XLEdBQU4sQ0FBVSxJQUFWLEVBQWdCUixTQUFoQjs7QUFFQTs7O0FBR0EsU0FBTzJCLE9BQVA7QUFDRCxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuL2dldC1wYXRoJ1xuaW1wb3J0IHsgcmVhZGRpciwgc3RhdCB9IGZyb20gJy4vJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuLi91dGlscy9sb2cnKSgnaG9wcDpnbG9iJylcblxubGV0IHN0YXRDYWNoZVxuY29uc3QgdGVtcENhY2hlID0ge31cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHBhdHRlcm4sIGN3ZCwgdXNlRG91YmxlQ2FjaGUgPSBmYWxzZSwgcmVjYWNoZSA9IGZhbHNlKSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIC8vIGdldCBjYWNoZVxuICBpZiAoc3RhdENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0Q2FjaGUgPSBjYWNoZS52YWwoJ3NjJykgfHwge31cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmUgd2Fsay5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHdhbGsocHR0biwgZGlyZWN0b3J5LCByZWN1cnNpdmUgPSBmYWxzZSkge1xuICAgIGlmIChwdHRuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY3VyciA9IHB0dG4uc2hpZnQoKVxuICAgIGxldCBsb2NhbFJlc3VsdHMgPSBbXVxuXG4gICAgZGVidWcoJ2N1cnI6ICVzLCBkaXIgPSAlcywgcmVjdXIgPSAlcywgcmVjYWNoZSA9ICVzJywgY3VyciwgZGlyZWN0b3J5LCByZWN1cnNpdmUsIHJlY2FjaGUpXG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIChhd2FpdCByZWFkZGlyKGRpcmVjdG9yeSkpKSB7XG4gICAgICAvLyBmaXggZmlsZSBwYXRoXG4gICAgICBjb25zdCBmaWxlcGF0aCA9IGRpcmVjdG9yeSArIHBhdGguc2VwICsgZmlsZVxuXG4gICAgICAvLyBnZXQgc3RhdCBmcm9tIHRlbXAgY2FjaGUgKGZvciBub24td2F0Y2ggdGFza3MpIG9yIHN0YXQoKVxuICAgICAgbGV0IGZzdGF0XG5cbiAgICAgIGlmICh1c2VEb3VibGVDYWNoZSkge1xuICAgICAgICBmc3RhdCA9IHRlbXBDYWNoZVtmaWxlcGF0aF0gPSB0ZW1wQ2FjaGVbZmlsZXBhdGhdIHx8IGF3YWl0IHN0YXQoZmlsZXBhdGgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmc3RhdCA9IGF3YWl0IHN0YXQoZmlsZXBhdGgpXG4gICAgICB9XG5cbiAgICAgIC8vIGhhcyBiZWVuIG1vZGlmaWVkXG4gICAgICBpZiAobWF0Y2goZmlsZSwgY3VycikpIHtcbiAgICAgICAgaWYgKGZzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgaWYgKHJlY2FjaGUgfHwgIXN0YXRDYWNoZS5oYXNPd25Qcm9wZXJ0eShmaWxlcGF0aCkgfHwgc3RhdENhY2hlW2ZpbGVwYXRoXSAhPT0gK2ZzdGF0Lm10aW1lKSB7XG4gICAgICAgICAgICBzdGF0Q2FjaGVbZmlsZXBhdGhdID0gK2ZzdGF0Lm10aW1lXG4gICAgICAgICAgICBsb2NhbFJlc3VsdHMucHVzaChmaWxlcGF0aClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9jYWxSZXN1bHRzID0gbG9jYWxSZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4sIGZpbGVwYXRoLCByZWN1cnNpdmUgfHwgY3VyciA9PT0gJyoqJykpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZnN0YXQuaXNEaXJlY3RvcnkoKSAmJiByZWN1cnNpdmUpIHtcbiAgICAgICAgbG9jYWxSZXN1bHRzID0gbG9jYWxSZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKFtjdXJyXS5jb25jYXQocHR0biksIGZpbGVwYXRoLCByZWN1cnNpdmUpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsb2NhbFJlc3VsdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYWxsIHBhdHRlcm5zIGFnYWluc3QgZGlyZWN0b3J5LlxuICAgKi9cbiAgbGV0IHJlc3VsdHMgPSBbXVxuICBmb3IgKGxldCBwdHRuIG9mIHBhdHRlcm4pIHtcbiAgICBpZiAocHR0blswXSA9PT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzdXJlIHdoYXQgdG8gZG8gd2l0aCB0aGUgLyBpbiB5b3VyIGdsb2IuJylcbiAgICB9XG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhwdHRuLnNwbGl0KCcvJyksIGN3ZCkpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGNhY2hlLlxuICAgKi9cbiAgY2FjaGUudmFsKCdzYycsIHN0YXRDYWNoZSlcblxuICAvKipcbiAgICogUmV0dXJuIGZpbmFsIHJlc3VsdHMgb2JqZWN0LlxuICAgKi9cbiAgcmV0dXJuIHJlc3VsdHNcbn0iXX0=