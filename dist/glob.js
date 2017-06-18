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

    debug('curr: %s, dir = %s, recur = %s', curr, directory, recursive);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZGVidWciLCJyZXF1aXJlIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInVzZURvdWJsZUNhY2hlIiwiQXJyYXkiLCJ1bmRlZmluZWQiLCJ2YWwiLCJ3YWxrIiwicHR0biIsImRpcmVjdG9yeSIsInJlY3Vyc2l2ZSIsImxlbmd0aCIsImN1cnIiLCJzaGlmdCIsImxvY2FsUmVzdWx0cyIsImZpbGUiLCJmaWxlcGF0aCIsInNlcCIsImZzdGF0IiwiaXNGaWxlIiwiaGFzT3duUHJvcGVydHkiLCJtdGltZSIsInB1c2giLCJjb25jYXQiLCJpc0RpcmVjdG9yeSIsInJlc3VsdHMiLCJFcnJvciIsInNwbGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTSxFQUFFQyxLQUFGLEtBQVlDLFFBQVEsYUFBUixFQUF1QixXQUF2QixDQUFsQixDLENBWkE7Ozs7OztBQWNBLElBQUlDLFNBQUo7QUFDQSxNQUFNQyxZQUFZLEVBQWxCOztrQkFFZSxPQUFPQyxPQUFQLEVBQWdCQyxHQUFoQixFQUFxQkMsaUJBQWlCLEtBQXRDLEtBQWdEO0FBQzdEO0FBQ0EsTUFBSSxFQUFFRixtQkFBbUJHLEtBQXJCLENBQUosRUFBaUM7QUFDL0JILGNBQVUsQ0FBQ0EsT0FBRCxDQUFWO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJRixjQUFjTSxTQUFsQixFQUE2QjtBQUMzQk4sZ0JBQVlILE1BQU1VLEdBQU4sQ0FBVSxJQUFWLEtBQW1CLEVBQS9CO0FBQ0Q7O0FBRUQ7OztBQUdBLGlCQUFlQyxJQUFmLENBQW9CQyxJQUFwQixFQUEwQkMsU0FBMUIsRUFBcUNDLFlBQVksS0FBakQsRUFBd0Q7QUFDdEQsUUFBSUYsS0FBS0csTUFBTCxLQUFnQixDQUFwQixFQUF1QjtBQUNyQjtBQUNEOztBQUVELFVBQU1DLE9BQU9KLEtBQUtLLEtBQUwsRUFBYjtBQUNBLFFBQUlDLGVBQWUsRUFBbkI7O0FBRUFqQixVQUFNLGdDQUFOLEVBQXdDZSxJQUF4QyxFQUE4Q0gsU0FBOUMsRUFBeURDLFNBQXpEOztBQUVBLFNBQUssSUFBSUssSUFBVCxJQUFrQixNQUFNLGlCQUFRTixTQUFSLENBQXhCLEVBQTZDO0FBQzNDO0FBQ0EsWUFBTU8sV0FBV1AsWUFBWSxlQUFLUSxHQUFqQixHQUF1QkYsSUFBeEM7O0FBRUE7QUFDQSxVQUFJRyxLQUFKOztBQUVBLFVBQUlmLGNBQUosRUFBb0I7QUFDbEJlLGdCQUFRbEIsVUFBVWdCLFFBQVYsSUFBc0JoQixVQUFVZ0IsUUFBVixNQUF1QixNQUFNLGNBQUtBLFFBQUwsQ0FBN0IsQ0FBOUI7QUFDRCxPQUZELE1BRU87QUFDTEUsZ0JBQVEsTUFBTSxjQUFLRixRQUFMLENBQWQ7QUFDRDs7QUFFRDtBQUNBLFVBQUkseUJBQU1ELElBQU4sRUFBWUgsSUFBWixDQUFKLEVBQXVCO0FBQ3JCLFlBQUlNLE1BQU1DLE1BQU4sRUFBSixFQUFvQjtBQUNsQixjQUFJLENBQUNwQixVQUFVcUIsY0FBVixDQUF5QkosUUFBekIsQ0FBRCxJQUF1Q2pCLFVBQVVpQixRQUFWLE1BQXdCLENBQUNFLE1BQU1HLEtBQTFFLEVBQWlGO0FBQy9FdEIsc0JBQVVpQixRQUFWLElBQXNCLENBQUNFLE1BQU1HLEtBQTdCO0FBQ0FQLHlCQUFhUSxJQUFiLENBQWtCTixRQUFsQjtBQUNEO0FBQ0YsU0FMRCxNQUtPO0FBQ0xGLHlCQUFlQSxhQUFhUyxNQUFiLEVBQW9CLE1BQU1oQixLQUFLQyxJQUFMLEVBQVdRLFFBQVgsRUFBcUJOLGFBQWFFLFNBQVMsSUFBM0MsQ0FBMUIsRUFBZjtBQUNEO0FBQ0YsT0FURCxNQVNPLElBQUlNLE1BQU1NLFdBQU4sTUFBdUJkLFNBQTNCLEVBQXNDO0FBQzNDSSx1QkFBZUEsYUFBYVMsTUFBYixFQUFvQixNQUFNaEIsS0FBSyxDQUFDSyxJQUFELEVBQU9XLE1BQVAsQ0FBY2YsSUFBZCxDQUFMLEVBQTBCUSxRQUExQixFQUFvQ04sU0FBcEMsQ0FBMUIsRUFBZjtBQUNEO0FBQ0Y7O0FBRUQsV0FBT0ksWUFBUDtBQUNEOztBQUVEOzs7QUFHQSxNQUFJVyxVQUFVLEVBQWQ7QUFDQSxPQUFLLElBQUlqQixJQUFULElBQWlCUCxPQUFqQixFQUEwQjtBQUN4QixRQUFJTyxLQUFLLENBQUwsTUFBWSxHQUFoQixFQUFxQjtBQUNuQixZQUFNLElBQUlrQixLQUFKLENBQVUsOENBQVYsQ0FBTjtBQUNEOztBQUVERCxjQUFVQSxRQUFRRixNQUFSLEVBQWUsTUFBTWhCLEtBQUtDLEtBQUttQixLQUFMLENBQVcsR0FBWCxDQUFMLEVBQXNCekIsR0FBdEIsQ0FBckIsRUFBVjtBQUNEOztBQUVEOzs7QUFHQU4sUUFBTVUsR0FBTixDQUFVLElBQVYsRUFBZ0JQOztBQUVoQjs7O0FBRkEsSUFLQSxPQUFPMEIsT0FBUDtBQUNELEMiLCJmaWxlIjoiZ2xvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2dsb2IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBtYXRjaCBmcm9tICdtaW5pbWF0Y2gnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi9nZXQtcGF0aCdcbmltcG9ydCB7IHJlYWRkaXIsIHN0YXQgfSBmcm9tICcuL2ZzJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwOmdsb2InKVxuXG5sZXQgc3RhdENhY2hlXG5jb25zdCB0ZW1wQ2FjaGUgPSB7fVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocGF0dGVybiwgY3dkLCB1c2VEb3VibGVDYWNoZSA9IGZhbHNlKSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIC8vIGdldCBjYWNoZVxuICBpZiAoc3RhdENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0Q2FjaGUgPSBjYWNoZS52YWwoJ3NjJykgfHwge31cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmUgd2Fsay5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHdhbGsocHR0biwgZGlyZWN0b3J5LCByZWN1cnNpdmUgPSBmYWxzZSkge1xuICAgIGlmIChwdHRuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY3VyciA9IHB0dG4uc2hpZnQoKVxuICAgIGxldCBsb2NhbFJlc3VsdHMgPSBbXVxuXG4gICAgZGVidWcoJ2N1cnI6ICVzLCBkaXIgPSAlcywgcmVjdXIgPSAlcycsIGN1cnIsIGRpcmVjdG9yeSwgcmVjdXJzaXZlKVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiAoYXdhaXQgcmVhZGRpcihkaXJlY3RvcnkpKSkge1xuICAgICAgLy8gZml4IGZpbGUgcGF0aFxuICAgICAgY29uc3QgZmlsZXBhdGggPSBkaXJlY3RvcnkgKyBwYXRoLnNlcCArIGZpbGVcblxuICAgICAgLy8gZ2V0IHN0YXQgZnJvbSB0ZW1wIGNhY2hlIChmb3Igbm9uLXdhdGNoIHRhc2tzKSBvciBzdGF0KClcbiAgICAgIGxldCBmc3RhdFxuXG4gICAgICBpZiAodXNlRG91YmxlQ2FjaGUpIHtcbiAgICAgICAgZnN0YXQgPSB0ZW1wQ2FjaGVbZmlsZXBhdGhdID0gdGVtcENhY2hlW2ZpbGVwYXRoXSB8fCBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnN0YXQgPSBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfVxuXG4gICAgICAvLyBoYXMgYmVlbiBtb2RpZmllZFxuICAgICAgaWYgKG1hdGNoKGZpbGUsIGN1cnIpKSB7XG4gICAgICAgIGlmIChmc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgIGlmICghc3RhdENhY2hlLmhhc093blByb3BlcnR5KGZpbGVwYXRoKSB8fCBzdGF0Q2FjaGVbZmlsZXBhdGhdICE9PSArZnN0YXQubXRpbWUpIHtcbiAgICAgICAgICAgIHN0YXRDYWNoZVtmaWxlcGF0aF0gPSArZnN0YXQubXRpbWVcbiAgICAgICAgICAgIGxvY2FsUmVzdWx0cy5wdXNoKGZpbGVwYXRoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2NhbFJlc3VsdHMgPSBsb2NhbFJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsocHR0biwgZmlsZXBhdGgsIHJlY3Vyc2l2ZSB8fCBjdXJyID09PSAnKionKSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChmc3RhdC5pc0RpcmVjdG9yeSgpICYmIHJlY3Vyc2l2ZSkge1xuICAgICAgICBsb2NhbFJlc3VsdHMgPSBsb2NhbFJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsoW2N1cnJdLmNvbmNhdChwdHRuKSwgZmlsZXBhdGgsIHJlY3Vyc2l2ZSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2FsUmVzdWx0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbGwgcGF0dGVybnMgYWdhaW5zdCBkaXJlY3RvcnkuXG4gICAqL1xuICBsZXQgcmVzdWx0cyA9IFtdXG4gIGZvciAobGV0IHB0dG4gb2YgcGF0dGVybikge1xuICAgIGlmIChwdHRuWzBdID09PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IHN1cmUgd2hhdCB0byBkbyB3aXRoIHRoZSAvIGluIHlvdXIgZ2xvYi4nKVxuICAgIH1cblxuICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4uc3BsaXQoJy8nKSwgY3dkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2FjaGUuXG4gICAqL1xuICBjYWNoZS52YWwoJ3NjJywgc3RhdENhY2hlKVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gZmluYWwgcmVzdWx0cyBvYmplY3QuXG4gICAqL1xuICByZXR1cm4gcmVzdWx0c1xufSJdfQ==