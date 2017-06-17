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

exports.default = async (pattern, cwd) => {
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
    const localResults = [];

    for (let file of await (0, _fs.readdir)(directory)) {
      // fix file path
      const filepath = directory + _path2.default.sep + file;

      // todo: cache this shit
      let fstat = await (0, _fs.stat)(filepath

      // has been modified
      );if (!statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime) {
        statCache[filepath] = +fstat.mtime;

        if ((0, _minimatch2.default)(file, curr)) {
          if (fstat.isFile()) {
            localResults.push(filepath);
          } else {
            await walk(pttn, filepath, recursive || curr === '**');
          }
        } else if (fstat.isDirectory() && recursive) {
          await walk([curr].concat(pttn), filepath, recursive);
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwic3RhdENhY2hlIiwicGF0dGVybiIsImN3ZCIsIkFycmF5IiwidW5kZWZpbmVkIiwidmFsIiwid2FsayIsInB0dG4iLCJkaXJlY3RvcnkiLCJyZWN1cnNpdmUiLCJsZW5ndGgiLCJjdXJyIiwic2hpZnQiLCJsb2NhbFJlc3VsdHMiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsImhhc093blByb3BlcnR5IiwibXRpbWUiLCJpc0ZpbGUiLCJwdXNoIiwiaXNEaXJlY3RvcnkiLCJjb25jYXQiLCJyZXN1bHRzIiwiRXJyb3IiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7OztBQUVBLElBQUlDLFNBQUosQyxDQVpBOzs7Ozs7a0JBY2UsT0FBT0MsT0FBUCxFQUFnQkMsR0FBaEIsS0FBd0I7QUFDckM7QUFDQSxNQUFJLEVBQUVELG1CQUFtQkUsS0FBckIsQ0FBSixFQUFpQztBQUMvQkYsY0FBVSxDQUFDQSxPQUFELENBQVY7QUFDRDs7QUFFRDtBQUNBLE1BQUlELGNBQWNJLFNBQWxCLEVBQTZCO0FBQzNCSixnQkFBWUQsTUFBTU0sR0FBTixDQUFVLElBQVYsS0FBbUIsRUFBL0I7QUFDRDs7QUFFRDs7O0FBR0EsaUJBQWVDLElBQWYsQ0FBb0JDLElBQXBCLEVBQTBCQyxTQUExQixFQUFxQ0MsWUFBWSxLQUFqRCxFQUF3RDtBQUN0RCxRQUFJRixLQUFLRyxNQUFMLEtBQWdCLENBQXBCLEVBQXVCO0FBQ3JCO0FBQ0Q7O0FBRUQsVUFBTUMsT0FBT0osS0FBS0ssS0FBTCxFQUFiO0FBQ0EsVUFBTUMsZUFBZSxFQUFyQjs7QUFFQSxTQUFLLElBQUlDLElBQVQsSUFBa0IsTUFBTSxpQkFBUU4sU0FBUixDQUF4QixFQUE2QztBQUMzQztBQUNBLFlBQU1PLFdBQVdQLFlBQVksZUFBS1EsR0FBakIsR0FBdUJGLElBQXhDOztBQUVBO0FBQ0EsVUFBSUcsUUFBUSxNQUFNLGNBQUtGOztBQUV2QjtBQUZrQixPQUFsQixDQUdBLElBQUksQ0FBQ2YsVUFBVWtCLGNBQVYsQ0FBeUJILFFBQXpCLENBQUQsSUFBdUNmLFVBQVVlLFFBQVYsTUFBd0IsQ0FBQ0UsTUFBTUUsS0FBMUUsRUFBaUY7QUFDL0VuQixrQkFBVWUsUUFBVixJQUFzQixDQUFDRSxNQUFNRSxLQUE3Qjs7QUFFQSxZQUFJLHlCQUFNTCxJQUFOLEVBQVlILElBQVosQ0FBSixFQUF1QjtBQUNyQixjQUFJTSxNQUFNRyxNQUFOLEVBQUosRUFBb0I7QUFDbEJQLHlCQUFhUSxJQUFiLENBQWtCTixRQUFsQjtBQUNELFdBRkQsTUFFTztBQUNMLGtCQUFNVCxLQUFLQyxJQUFMLEVBQVdRLFFBQVgsRUFBcUJOLGFBQWFFLFNBQVMsSUFBM0MsQ0FBTjtBQUNEO0FBQ0YsU0FORCxNQU1PLElBQUlNLE1BQU1LLFdBQU4sTUFBdUJiLFNBQTNCLEVBQXNDO0FBQzNDLGdCQUFNSCxLQUFLLENBQUNLLElBQUQsRUFBT1ksTUFBUCxDQUFjaEIsSUFBZCxDQUFMLEVBQTBCUSxRQUExQixFQUFvQ04sU0FBcEMsQ0FBTjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFPSSxZQUFQO0FBQ0Q7O0FBRUQ7OztBQUdBLE1BQUlXLFVBQVUsRUFBZDtBQUNBLE9BQUssSUFBSWpCLElBQVQsSUFBaUJOLE9BQWpCLEVBQTBCO0FBQ3hCLFFBQUlNLEtBQUssQ0FBTCxNQUFZLEdBQWhCLEVBQXFCO0FBQ25CLFlBQU0sSUFBSWtCLEtBQUosQ0FBVSw4Q0FBVixDQUFOO0FBQ0Q7O0FBRURELGNBQVVBLFFBQVFELE1BQVIsRUFBZSxNQUFNakIsS0FBS0MsS0FBS21CLEtBQUwsQ0FBVyxHQUFYLENBQUwsRUFBc0J4QixHQUF0QixDQUFyQixFQUFWO0FBQ0Q7O0FBRUQ7OztBQUdBSCxRQUFNTSxHQUFOLENBQVUsSUFBVixFQUFnQkw7O0FBRWhCOzs7QUFGQSxJQUtBLE9BQU93QixPQUFQO0FBQ0QsQyIsImZpbGUiOiJnbG9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZ2xvYi5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IG1hdGNoIGZyb20gJ21pbmltYXRjaCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuL2dldC1wYXRoJ1xuaW1wb3J0IHsgcmVhZGRpciwgc3RhdCB9IGZyb20gJy4vZnMnXG5cbmxldCBzdGF0Q2FjaGVcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHBhdHRlcm4sIGN3ZCkgPT4ge1xuICAvLyBwcmVmZXIgYXJyYXlzXG4gIGlmICghKHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXR0ZXJuID0gW3BhdHRlcm5dXG4gIH1cblxuICAvLyBnZXQgY2FjaGVcbiAgaWYgKHN0YXRDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhdENhY2hlID0gY2FjaGUudmFsKCdzYycpIHx8IHt9XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlIHdhbGsuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiB3YWxrKHB0dG4sIGRpcmVjdG9yeSwgcmVjdXJzaXZlID0gZmFsc2UpIHtcbiAgICBpZiAocHR0bi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnIgPSBwdHRuLnNoaWZ0KClcbiAgICBjb25zdCBsb2NhbFJlc3VsdHMgPSBbXVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiAoYXdhaXQgcmVhZGRpcihkaXJlY3RvcnkpKSkge1xuICAgICAgLy8gZml4IGZpbGUgcGF0aFxuICAgICAgY29uc3QgZmlsZXBhdGggPSBkaXJlY3RvcnkgKyBwYXRoLnNlcCArIGZpbGVcblxuICAgICAgLy8gdG9kbzogY2FjaGUgdGhpcyBzaGl0XG4gICAgICBsZXQgZnN0YXQgPSBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuXG4gICAgICAvLyBoYXMgYmVlbiBtb2RpZmllZFxuICAgICAgaWYgKCFzdGF0Q2FjaGUuaGFzT3duUHJvcGVydHkoZmlsZXBhdGgpIHx8IHN0YXRDYWNoZVtmaWxlcGF0aF0gIT09ICtmc3RhdC5tdGltZSkge1xuICAgICAgICBzdGF0Q2FjaGVbZmlsZXBhdGhdID0gK2ZzdGF0Lm10aW1lXG5cbiAgICAgICAgaWYgKG1hdGNoKGZpbGUsIGN1cnIpKSB7XG4gICAgICAgICAgaWYgKGZzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICBsb2NhbFJlc3VsdHMucHVzaChmaWxlcGF0aClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgd2FsayhwdHRuLCBmaWxlcGF0aCwgcmVjdXJzaXZlIHx8IGN1cnIgPT09ICcqKicpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGZzdGF0LmlzRGlyZWN0b3J5KCkgJiYgcmVjdXJzaXZlKSB7XG4gICAgICAgICAgYXdhaXQgd2FsayhbY3Vycl0uY29uY2F0KHB0dG4pLCBmaWxlcGF0aCwgcmVjdXJzaXZlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2FsUmVzdWx0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbGwgcGF0dGVybnMgYWdhaW5zdCBkaXJlY3RvcnkuXG4gICAqL1xuICBsZXQgcmVzdWx0cyA9IFtdXG4gIGZvciAobGV0IHB0dG4gb2YgcGF0dGVybikge1xuICAgIGlmIChwdHRuWzBdID09PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IHN1cmUgd2hhdCB0byBkbyB3aXRoIHRoZSAvIGluIHlvdXIgZ2xvYi4nKVxuICAgIH1cblxuICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4uc3BsaXQoJy8nKSwgY3dkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2FjaGUuXG4gICAqL1xuICBjYWNoZS52YWwoJ3NjJywgc3RhdENhY2hlKVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gZmluYWwgcmVzdWx0cyBvYmplY3QuXG4gICAqL1xuICByZXR1cm4gcmVzdWx0c1xufSJdfQ==