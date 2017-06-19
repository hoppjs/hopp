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

const { debug } = require('./utils/log')('hopp:glob'); /**
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
  cache.val('sc', statCache

  /**
   * Return final results object.
   */
  );return results;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZGVidWciLCJyZXF1aXJlIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInVzZURvdWJsZUNhY2hlIiwicmVjYWNoZSIsIkFycmF5IiwidW5kZWZpbmVkIiwidmFsIiwid2FsayIsInB0dG4iLCJkaXJlY3RvcnkiLCJyZWN1cnNpdmUiLCJsZW5ndGgiLCJjdXJyIiwic2hpZnQiLCJsb2NhbFJlc3VsdHMiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsImlzRmlsZSIsImhhc093blByb3BlcnR5IiwibXRpbWUiLCJwdXNoIiwiY29uY2F0IiwiaXNEaXJlY3RvcnkiLCJyZXN1bHRzIiwiRXJyb3IiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU0sRUFBRUMsS0FBRixLQUFZQyxRQUFRLGFBQVIsRUFBdUIsV0FBdkIsQ0FBbEIsQyxDQVpBOzs7Ozs7QUFjQSxJQUFJQyxTQUFKO0FBQ0EsTUFBTUMsWUFBWSxFQUFsQjs7a0JBRWUsT0FBT0MsT0FBUCxFQUFnQkMsR0FBaEIsRUFBcUJDLGlCQUFpQixLQUF0QyxFQUE2Q0MsVUFBVSxLQUF2RCxLQUFpRTtBQUM5RTtBQUNBLE1BQUksRUFBRUgsbUJBQW1CSSxLQUFyQixDQUFKLEVBQWlDO0FBQy9CSixjQUFVLENBQUNBLE9BQUQsQ0FBVjtBQUNEOztBQUVEO0FBQ0EsTUFBSUYsY0FBY08sU0FBbEIsRUFBNkI7QUFDM0JQLGdCQUFZSCxNQUFNVyxHQUFOLENBQVUsSUFBVixLQUFtQixFQUEvQjtBQUNEOztBQUVEOzs7QUFHQSxpQkFBZUMsSUFBZixDQUFvQkMsSUFBcEIsRUFBMEJDLFNBQTFCLEVBQXFDQyxZQUFZLEtBQWpELEVBQXdEO0FBQ3RELFFBQUlGLEtBQUtHLE1BQUwsS0FBZ0IsQ0FBcEIsRUFBdUI7QUFDckI7QUFDRDs7QUFFRCxVQUFNQyxPQUFPSixLQUFLSyxLQUFMLEVBQWI7QUFDQSxRQUFJQyxlQUFlLEVBQW5COztBQUVBbEIsVUFBTSw4Q0FBTixFQUFzRGdCLElBQXRELEVBQTRESCxTQUE1RCxFQUF1RUMsU0FBdkUsRUFBa0ZQLE9BQWxGOztBQUVBLFNBQUssSUFBSVksSUFBVCxJQUFrQixNQUFNLGlCQUFRTixTQUFSLENBQXhCLEVBQTZDO0FBQzNDO0FBQ0EsWUFBTU8sV0FBV1AsWUFBWSxlQUFLUSxHQUFqQixHQUF1QkYsSUFBeEM7O0FBRUE7QUFDQSxVQUFJRyxLQUFKOztBQUVBLFVBQUloQixjQUFKLEVBQW9CO0FBQ2xCZ0IsZ0JBQVFuQixVQUFVaUIsUUFBVixJQUFzQmpCLFVBQVVpQixRQUFWLE1BQXVCLE1BQU0sY0FBS0EsUUFBTCxDQUE3QixDQUE5QjtBQUNELE9BRkQsTUFFTztBQUNMRSxnQkFBUSxNQUFNLGNBQUtGLFFBQUwsQ0FBZDtBQUNEOztBQUVEO0FBQ0EsVUFBSSx5QkFBTUQsSUFBTixFQUFZSCxJQUFaLENBQUosRUFBdUI7QUFDckIsWUFBSU0sTUFBTUMsTUFBTixFQUFKLEVBQW9CO0FBQ2xCLGNBQUloQixXQUFXLENBQUNMLFVBQVVzQixjQUFWLENBQXlCSixRQUF6QixDQUFaLElBQWtEbEIsVUFBVWtCLFFBQVYsTUFBd0IsQ0FBQ0UsTUFBTUcsS0FBckYsRUFBNEY7QUFDMUZ2QixzQkFBVWtCLFFBQVYsSUFBc0IsQ0FBQ0UsTUFBTUcsS0FBN0I7QUFDQVAseUJBQWFRLElBQWIsQ0FBa0JOLFFBQWxCO0FBQ0Q7QUFDRixTQUxELE1BS087QUFDTEYseUJBQWVBLGFBQWFTLE1BQWIsRUFBb0IsTUFBTWhCLEtBQUtDLElBQUwsRUFBV1EsUUFBWCxFQUFxQk4sYUFBYUUsU0FBUyxJQUEzQyxDQUExQixFQUFmO0FBQ0Q7QUFDRixPQVRELE1BU08sSUFBSU0sTUFBTU0sV0FBTixNQUF1QmQsU0FBM0IsRUFBc0M7QUFDM0NJLHVCQUFlQSxhQUFhUyxNQUFiLEVBQW9CLE1BQU1oQixLQUFLLENBQUNLLElBQUQsRUFBT1csTUFBUCxDQUFjZixJQUFkLENBQUwsRUFBMEJRLFFBQTFCLEVBQW9DTixTQUFwQyxDQUExQixFQUFmO0FBQ0Q7QUFDRjs7QUFFRCxXQUFPSSxZQUFQO0FBQ0Q7O0FBRUQ7OztBQUdBLE1BQUlXLFVBQVUsRUFBZDtBQUNBLE9BQUssSUFBSWpCLElBQVQsSUFBaUJSLE9BQWpCLEVBQTBCO0FBQ3hCLFFBQUlRLEtBQUssQ0FBTCxNQUFZLEdBQWhCLEVBQXFCO0FBQ25CLFlBQU0sSUFBSWtCLEtBQUosQ0FBVSw4Q0FBVixDQUFOO0FBQ0Q7O0FBRURELGNBQVVBLFFBQVFGLE1BQVIsRUFBZSxNQUFNaEIsS0FBS0MsS0FBS21CLEtBQUwsQ0FBVyxHQUFYLENBQUwsRUFBc0IxQixHQUF0QixDQUFyQixFQUFWO0FBQ0Q7O0FBRUQ7OztBQUdBTixRQUFNVyxHQUFOLENBQVUsSUFBVixFQUFnQlI7O0FBRWhCOzs7QUFGQSxJQUtBLE9BQU8yQixPQUFQO0FBQ0QsQyIsImZpbGUiOiJnbG9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZ2xvYi5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IG1hdGNoIGZyb20gJ21pbmltYXRjaCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuL2dldC1wYXRoJ1xuaW1wb3J0IHsgcmVhZGRpciwgc3RhdCB9IGZyb20gJy4vZnMnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHA6Z2xvYicpXG5cbmxldCBzdGF0Q2FjaGVcbmNvbnN0IHRlbXBDYWNoZSA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChwYXR0ZXJuLCBjd2QsIHVzZURvdWJsZUNhY2hlID0gZmFsc2UsIHJlY2FjaGUgPSBmYWxzZSkgPT4ge1xuICAvLyBwcmVmZXIgYXJyYXlzXG4gIGlmICghKHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXR0ZXJuID0gW3BhdHRlcm5dXG4gIH1cblxuICAvLyBnZXQgY2FjaGVcbiAgaWYgKHN0YXRDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhdENhY2hlID0gY2FjaGUudmFsKCdzYycpIHx8IHt9XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlIHdhbGsuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiB3YWxrKHB0dG4sIGRpcmVjdG9yeSwgcmVjdXJzaXZlID0gZmFsc2UpIHtcbiAgICBpZiAocHR0bi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnIgPSBwdHRuLnNoaWZ0KClcbiAgICBsZXQgbG9jYWxSZXN1bHRzID0gW11cblxuICAgIGRlYnVnKCdjdXJyOiAlcywgZGlyID0gJXMsIHJlY3VyID0gJXMsIHJlY2FjaGUgPSAlcycsIGN1cnIsIGRpcmVjdG9yeSwgcmVjdXJzaXZlLCByZWNhY2hlKVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiAoYXdhaXQgcmVhZGRpcihkaXJlY3RvcnkpKSkge1xuICAgICAgLy8gZml4IGZpbGUgcGF0aFxuICAgICAgY29uc3QgZmlsZXBhdGggPSBkaXJlY3RvcnkgKyBwYXRoLnNlcCArIGZpbGVcblxuICAgICAgLy8gZ2V0IHN0YXQgZnJvbSB0ZW1wIGNhY2hlIChmb3Igbm9uLXdhdGNoIHRhc2tzKSBvciBzdGF0KClcbiAgICAgIGxldCBmc3RhdFxuXG4gICAgICBpZiAodXNlRG91YmxlQ2FjaGUpIHtcbiAgICAgICAgZnN0YXQgPSB0ZW1wQ2FjaGVbZmlsZXBhdGhdID0gdGVtcENhY2hlW2ZpbGVwYXRoXSB8fCBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnN0YXQgPSBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfVxuXG4gICAgICAvLyBoYXMgYmVlbiBtb2RpZmllZFxuICAgICAgaWYgKG1hdGNoKGZpbGUsIGN1cnIpKSB7XG4gICAgICAgIGlmIChmc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgIGlmIChyZWNhY2hlIHx8ICFzdGF0Q2FjaGUuaGFzT3duUHJvcGVydHkoZmlsZXBhdGgpIHx8IHN0YXRDYWNoZVtmaWxlcGF0aF0gIT09ICtmc3RhdC5tdGltZSkge1xuICAgICAgICAgICAgc3RhdENhY2hlW2ZpbGVwYXRoXSA9ICtmc3RhdC5tdGltZVxuICAgICAgICAgICAgbG9jYWxSZXN1bHRzLnB1c2goZmlsZXBhdGgpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2FsUmVzdWx0cyA9IGxvY2FsUmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhwdHRuLCBmaWxlcGF0aCwgcmVjdXJzaXZlIHx8IGN1cnIgPT09ICcqKicpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGZzdGF0LmlzRGlyZWN0b3J5KCkgJiYgcmVjdXJzaXZlKSB7XG4gICAgICAgIGxvY2FsUmVzdWx0cyA9IGxvY2FsUmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhbY3Vycl0uY29uY2F0KHB0dG4pLCBmaWxlcGF0aCwgcmVjdXJzaXZlKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9jYWxSZXN1bHRzXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFsbCBwYXR0ZXJucyBhZ2FpbnN0IGRpcmVjdG9yeS5cbiAgICovXG4gIGxldCByZXN1bHRzID0gW11cbiAgZm9yIChsZXQgcHR0biBvZiBwYXR0ZXJuKSB7XG4gICAgaWYgKHB0dG5bMF0gPT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3Qgc3VyZSB3aGF0IHRvIGRvIHdpdGggdGhlIC8gaW4geW91ciBnbG9iLicpXG4gICAgfVxuXG4gICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsocHR0bi5zcGxpdCgnLycpLCBjd2QpKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjYWNoZS5cbiAgICovXG4gIGNhY2hlLnZhbCgnc2MnLCBzdGF0Q2FjaGUpXG5cbiAgLyoqXG4gICAqIFJldHVybiBmaW5hbCByZXN1bHRzIG9iamVjdC5cbiAgICovXG4gIHJldHVybiByZXN1bHRzXG59Il19