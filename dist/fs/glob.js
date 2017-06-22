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
                                                         * @copyright 2017 10244872 Canada Inc.
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

  // allow overrides from the env
  recache = recache || process.env.RECACHE === 'true';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZGVidWciLCJyZXF1aXJlIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInVzZURvdWJsZUNhY2hlIiwicmVjYWNoZSIsIkFycmF5IiwidW5kZWZpbmVkIiwidmFsIiwicHJvY2VzcyIsImVudiIsIlJFQ0FDSEUiLCJ3YWxrIiwicHR0biIsImRpcmVjdG9yeSIsInJlY3Vyc2l2ZSIsImxlbmd0aCIsImN1cnIiLCJzaGlmdCIsImxvY2FsUmVzdWx0cyIsImZpbGUiLCJmaWxlcGF0aCIsInNlcCIsImZzdGF0IiwiaXNGaWxlIiwiaGFzT3duUHJvcGVydHkiLCJtdGltZSIsInB1c2giLCJjb25jYXQiLCJpc0RpcmVjdG9yeSIsInJlc3VsdHMiLCJFcnJvciIsInNwbGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTSxFQUFFQyxLQUFGLEtBQVlDLFFBQVEsY0FBUixFQUF3QixXQUF4QixDQUFsQixDLENBWkE7Ozs7OztBQWNBLElBQUlDLFNBQUo7QUFDQSxNQUFNQyxZQUFZLEVBQWxCOztrQkFFZSxPQUFPQyxPQUFQLEVBQWdCQyxHQUFoQixFQUFxQkMsaUJBQWlCLEtBQXRDLEVBQTZDQyxVQUFVLEtBQXZELEtBQWlFO0FBQzlFO0FBQ0EsTUFBSSxFQUFFSCxtQkFBbUJJLEtBQXJCLENBQUosRUFBaUM7QUFDL0JKLGNBQVUsQ0FBQ0EsT0FBRCxDQUFWO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJRixjQUFjTyxTQUFsQixFQUE2QjtBQUMzQlAsZ0JBQVlILE1BQU1XLEdBQU4sQ0FBVSxJQUFWLEtBQW1CLEVBQS9CO0FBQ0Q7O0FBRUQ7QUFDQUgsWUFBVUEsV0FBV0ksUUFBUUMsR0FBUixDQUFZQyxPQUFaLEtBQXdCLE1BQTdDOztBQUVBOzs7QUFHQSxpQkFBZUMsSUFBZixDQUFvQkMsSUFBcEIsRUFBMEJDLFNBQTFCLEVBQXFDQyxZQUFZLEtBQWpELEVBQXdEO0FBQ3RELFFBQUlGLEtBQUtHLE1BQUwsS0FBZ0IsQ0FBcEIsRUFBdUI7QUFDckI7QUFDRDs7QUFFRCxVQUFNQyxPQUFPSixLQUFLSyxLQUFMLEVBQWI7QUFDQSxRQUFJQyxlQUFlLEVBQW5COztBQUVBckIsVUFBTSw4Q0FBTixFQUFzRG1CLElBQXRELEVBQTRESCxTQUE1RCxFQUF1RUMsU0FBdkUsRUFBa0ZWLE9BQWxGOztBQUVBLFNBQUssSUFBSWUsSUFBVCxJQUFrQixNQUFNLGVBQVFOLFNBQVIsQ0FBeEIsRUFBNkM7QUFDM0M7QUFDQSxZQUFNTyxXQUFXUCxZQUFZLGVBQUtRLEdBQWpCLEdBQXVCRixJQUF4Qzs7QUFFQTtBQUNBLFVBQUlHLEtBQUo7O0FBRUEsVUFBSW5CLGNBQUosRUFBb0I7QUFDbEJtQixnQkFBUXRCLFVBQVVvQixRQUFWLElBQXNCcEIsVUFBVW9CLFFBQVYsTUFBdUIsTUFBTSxZQUFLQSxRQUFMLENBQTdCLENBQTlCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xFLGdCQUFRLE1BQU0sWUFBS0YsUUFBTCxDQUFkO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJLHlCQUFNRCxJQUFOLEVBQVlILElBQVosQ0FBSixFQUF1QjtBQUNyQixZQUFJTSxNQUFNQyxNQUFOLEVBQUosRUFBb0I7QUFDbEIsY0FBSW5CLFdBQVcsQ0FBQ0wsVUFBVXlCLGNBQVYsQ0FBeUJKLFFBQXpCLENBQVosSUFBa0RyQixVQUFVcUIsUUFBVixNQUF3QixDQUFDRSxNQUFNRyxLQUFyRixFQUE0RjtBQUMxRjFCLHNCQUFVcUIsUUFBVixJQUFzQixDQUFDRSxNQUFNRyxLQUE3QjtBQUNBUCx5QkFBYVEsSUFBYixDQUFrQk4sUUFBbEI7QUFDRDtBQUNGLFNBTEQsTUFLTztBQUNMRix5QkFBZUEsYUFBYVMsTUFBYixFQUFvQixNQUFNaEIsS0FBS0MsSUFBTCxFQUFXUSxRQUFYLEVBQXFCTixhQUFhRSxTQUFTLElBQTNDLENBQTFCLEVBQWY7QUFDRDtBQUNGLE9BVEQsTUFTTyxJQUFJTSxNQUFNTSxXQUFOLE1BQXVCZCxTQUEzQixFQUFzQztBQUMzQ0ksdUJBQWVBLGFBQWFTLE1BQWIsRUFBb0IsTUFBTWhCLEtBQUssQ0FBQ0ssSUFBRCxFQUFPVyxNQUFQLENBQWNmLElBQWQsQ0FBTCxFQUEwQlEsUUFBMUIsRUFBb0NOLFNBQXBDLENBQTFCLEVBQWY7QUFDRDtBQUNGOztBQUVELFdBQU9JLFlBQVA7QUFDRDs7QUFFRDs7O0FBR0EsTUFBSVcsVUFBVSxFQUFkO0FBQ0EsT0FBSyxJQUFJakIsSUFBVCxJQUFpQlgsT0FBakIsRUFBMEI7QUFDeEIsUUFBSVcsS0FBSyxDQUFMLE1BQVksR0FBaEIsRUFBcUI7QUFDbkIsWUFBTSxJQUFJa0IsS0FBSixDQUFVLDhDQUFWLENBQU47QUFDRDs7QUFFREQsY0FBVUEsUUFBUUYsTUFBUixFQUFlLE1BQU1oQixLQUFLQyxLQUFLbUIsS0FBTCxDQUFXLEdBQVgsQ0FBTCxFQUFzQjdCLEdBQXRCLENBQXJCLEVBQVY7QUFDRDs7QUFFRDs7O0FBR0FOLFFBQU1XLEdBQU4sQ0FBVSxJQUFWLEVBQWdCUixTQUFoQjs7QUFFQTs7O0FBR0EsU0FBTzhCLE9BQVA7QUFDRCxDIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuL2dldC1wYXRoJ1xuaW1wb3J0IHsgcmVhZGRpciwgc3RhdCB9IGZyb20gJy4vJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuLi91dGlscy9sb2cnKSgnaG9wcDpnbG9iJylcblxubGV0IHN0YXRDYWNoZVxuY29uc3QgdGVtcENhY2hlID0ge31cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHBhdHRlcm4sIGN3ZCwgdXNlRG91YmxlQ2FjaGUgPSBmYWxzZSwgcmVjYWNoZSA9IGZhbHNlKSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIC8vIGdldCBjYWNoZVxuICBpZiAoc3RhdENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0Q2FjaGUgPSBjYWNoZS52YWwoJ3NjJykgfHwge31cbiAgfVxuICBcbiAgLy8gYWxsb3cgb3ZlcnJpZGVzIGZyb20gdGhlIGVudlxuICByZWNhY2hlID0gcmVjYWNoZSB8fCBwcm9jZXNzLmVudi5SRUNBQ0hFID09PSAndHJ1ZSdcblxuICAvKipcbiAgICogUmVjdXJzaXZlIHdhbGsuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiB3YWxrKHB0dG4sIGRpcmVjdG9yeSwgcmVjdXJzaXZlID0gZmFsc2UpIHtcbiAgICBpZiAocHR0bi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnIgPSBwdHRuLnNoaWZ0KClcbiAgICBsZXQgbG9jYWxSZXN1bHRzID0gW11cblxuICAgIGRlYnVnKCdjdXJyOiAlcywgZGlyID0gJXMsIHJlY3VyID0gJXMsIHJlY2FjaGUgPSAlcycsIGN1cnIsIGRpcmVjdG9yeSwgcmVjdXJzaXZlLCByZWNhY2hlKVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiAoYXdhaXQgcmVhZGRpcihkaXJlY3RvcnkpKSkge1xuICAgICAgLy8gZml4IGZpbGUgcGF0aFxuICAgICAgY29uc3QgZmlsZXBhdGggPSBkaXJlY3RvcnkgKyBwYXRoLnNlcCArIGZpbGVcblxuICAgICAgLy8gZ2V0IHN0YXQgZnJvbSB0ZW1wIGNhY2hlIChmb3Igbm9uLXdhdGNoIHRhc2tzKSBvciBzdGF0KClcbiAgICAgIGxldCBmc3RhdFxuXG4gICAgICBpZiAodXNlRG91YmxlQ2FjaGUpIHtcbiAgICAgICAgZnN0YXQgPSB0ZW1wQ2FjaGVbZmlsZXBhdGhdID0gdGVtcENhY2hlW2ZpbGVwYXRoXSB8fCBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnN0YXQgPSBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfVxuXG4gICAgICAvLyBoYXMgYmVlbiBtb2RpZmllZFxuICAgICAgaWYgKG1hdGNoKGZpbGUsIGN1cnIpKSB7XG4gICAgICAgIGlmIChmc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgIGlmIChyZWNhY2hlIHx8ICFzdGF0Q2FjaGUuaGFzT3duUHJvcGVydHkoZmlsZXBhdGgpIHx8IHN0YXRDYWNoZVtmaWxlcGF0aF0gIT09ICtmc3RhdC5tdGltZSkge1xuICAgICAgICAgICAgc3RhdENhY2hlW2ZpbGVwYXRoXSA9ICtmc3RhdC5tdGltZVxuICAgICAgICAgICAgbG9jYWxSZXN1bHRzLnB1c2goZmlsZXBhdGgpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2FsUmVzdWx0cyA9IGxvY2FsUmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhwdHRuLCBmaWxlcGF0aCwgcmVjdXJzaXZlIHx8IGN1cnIgPT09ICcqKicpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGZzdGF0LmlzRGlyZWN0b3J5KCkgJiYgcmVjdXJzaXZlKSB7XG4gICAgICAgIGxvY2FsUmVzdWx0cyA9IGxvY2FsUmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhbY3Vycl0uY29uY2F0KHB0dG4pLCBmaWxlcGF0aCwgcmVjdXJzaXZlKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9jYWxSZXN1bHRzXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFsbCBwYXR0ZXJucyBhZ2FpbnN0IGRpcmVjdG9yeS5cbiAgICovXG4gIGxldCByZXN1bHRzID0gW11cbiAgZm9yIChsZXQgcHR0biBvZiBwYXR0ZXJuKSB7XG4gICAgaWYgKHB0dG5bMF0gPT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3Qgc3VyZSB3aGF0IHRvIGRvIHdpdGggdGhlIC8gaW4geW91ciBnbG9iLicpXG4gICAgfVxuXG4gICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsocHR0bi5zcGxpdCgnLycpLCBjd2QpKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjYWNoZS5cbiAgICovXG4gIGNhY2hlLnZhbCgnc2MnLCBzdGF0Q2FjaGUpXG5cbiAgLyoqXG4gICAqIFJldHVybiBmaW5hbCByZXN1bHRzIG9iamVjdC5cbiAgICovXG4gIHJldHVybiByZXN1bHRzXG59XG4iXX0=