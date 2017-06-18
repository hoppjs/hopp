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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/glob.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var statCache = void 0;
var tempCache = [];

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(pattern, cwd) {

    /**
     * Recursive walk.
     */
    var walk = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(pttn, directory) {
        var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var curr, localResults, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, filepath, fstat;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(pttn.length === 0)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return');

              case 2:
                curr = pttn.shift();
                localResults = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 7;
                _context.next = 10;
                return (0, _fs.readdir)(directory);

              case 10:
                _context.t0 = Symbol.iterator;
                _iterator = _context.sent[_context.t0]();

              case 12:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 49;
                  break;
                }

                file = _step.value;

                // fix file path
                filepath = directory + _path2.default.sep + file;

                // get stat from temp cache (for non-watch tasks) or stat()

                fstat = void 0;

                if (!useDoubleCache) {
                  _context.next = 25;
                  break;
                }

                _context.t1 = tempCache[filepath];

                if (_context.t1) {
                  _context.next = 22;
                  break;
                }

                _context.next = 21;
                return (0, _fs.stat)(filepath);

              case 21:
                _context.t1 = _context.sent;

              case 22:
                fstat = tempCache[filepath] = _context.t1;
                _context.next = 28;
                break;

              case 25:
                _context.next = 27;
                return (0, _fs.stat)(filepath);

              case 27:
                fstat = _context.sent;

              case 28:
                if (!(0, _minimatch2.default)(file, curr)) {
                  _context.next = 40;
                  break;
                }

                if (!fstat.isFile()) {
                  _context.next = 33;
                  break;
                }

                if (!statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime) {
                  statCache[filepath] = +fstat.mtime;
                  localResults.push(filepath);
                }
                _context.next = 38;
                break;

              case 33:
                _context.t2 = localResults;
                _context.next = 36;
                return walk(pttn, filepath, recursive || curr === '**');

              case 36:
                _context.t3 = _context.sent;
                localResults = _context.t2.concat.call(_context.t2, _context.t3);

              case 38:
                _context.next = 46;
                break;

              case 40:
                if (!(fstat.isDirectory() && recursive)) {
                  _context.next = 46;
                  break;
                }

                _context.t4 = localResults;
                _context.next = 44;
                return walk([curr].concat(pttn), filepath, recursive);

              case 44:
                _context.t5 = _context.sent;
                localResults = _context.t4.concat.call(_context.t4, _context.t5);

              case 46:
                _iteratorNormalCompletion = true;
                _context.next = 12;
                break;

              case 49:
                _context.next = 55;
                break;

              case 51:
                _context.prev = 51;
                _context.t6 = _context['catch'](7);
                _didIteratorError = true;
                _iteratorError = _context.t6;

              case 55:
                _context.prev = 55;
                _context.prev = 56;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 58:
                _context.prev = 58;

                if (!_didIteratorError) {
                  _context.next = 61;
                  break;
                }

                throw _iteratorError;

              case 61:
                return _context.finish(58);

              case 62:
                return _context.finish(55);

              case 63:
                return _context.abrupt('return', localResults);

              case 64:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[7, 51, 55, 63], [56,, 58, 62]]);
      }));

      return function walk(_x5, _x6) {
        return _ref2.apply(this, arguments);
      };
    }();

    /**
     * Run all patterns against directory.
     */


    var useDoubleCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var results, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, pttn;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // prefer arrays
            if (!(pattern instanceof Array)) {
              pattern = [pattern];
            }

            // get cache
            if (statCache === undefined) {
              statCache = cache.val('sc') || {};
            }results = [];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 6;
            _iterator2 = pattern[Symbol.iterator]();

          case 8:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context2.next = 20;
              break;
            }

            pttn = _step2.value;

            if (!(pttn[0] === '/')) {
              _context2.next = 12;
              break;
            }

            throw new Error('Not sure what to do with the / in your glob.');

          case 12:
            _context2.t0 = results;
            _context2.next = 15;
            return walk(pttn.split('/'), cwd);

          case 15:
            _context2.t1 = _context2.sent;
            results = _context2.t0.concat.call(_context2.t0, _context2.t1);

          case 17:
            _iteratorNormalCompletion2 = true;
            _context2.next = 8;
            break;

          case 20:
            _context2.next = 26;
            break;

          case 22:
            _context2.prev = 22;
            _context2.t2 = _context2['catch'](6);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t2;

          case 26:
            _context2.prev = 26;
            _context2.prev = 27;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 29:
            _context2.prev = 29;

            if (!_didIteratorError2) {
              _context2.next = 32;
              break;
            }

            throw _iteratorError2;

          case 32:
            return _context2.finish(29);

          case 33:
            return _context2.finish(26);

          case 34:

            /**
             * Update cache.
             */
            cache.val('sc', statCache

            /**
             * Return final results object.
             */
            );return _context2.abrupt('return', results);

          case 36:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[6, 22, 26, 34], [27,, 29, 33]]);
  }));

  return function (_x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInB0dG4iLCJkaXJlY3RvcnkiLCJyZWN1cnNpdmUiLCJsZW5ndGgiLCJjdXJyIiwic2hpZnQiLCJsb2NhbFJlc3VsdHMiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsInVzZURvdWJsZUNhY2hlIiwiaXNGaWxlIiwiaGFzT3duUHJvcGVydHkiLCJtdGltZSIsInB1c2giLCJ3YWxrIiwiY29uY2F0IiwiaXNEaXJlY3RvcnkiLCJBcnJheSIsInVuZGVmaW5lZCIsInZhbCIsInJlc3VsdHMiLCJFcnJvciIsInNwbGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7Ozs7OzJjQVZBOzs7Ozs7QUFZQSxJQUFJQyxrQkFBSjtBQUNBLElBQU1DLFlBQVksRUFBbEI7Ozt1REFFZSxrQkFBT0MsT0FBUCxFQUFnQkMsR0FBaEI7O0FBV2I7OztBQVhhO0FBQUEsNERBY2IsaUJBQW9CQyxJQUFwQixFQUEwQkMsU0FBMUI7QUFBQSxZQUFxQ0MsU0FBckMsdUVBQWlELEtBQWpEOztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQ01GLEtBQUtHLE1BQUwsS0FBZ0IsQ0FEdEI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFLUUMsb0JBTFIsR0FLZUosS0FBS0ssS0FBTCxFQUxmO0FBTU1DLDRCQU5OLEdBTXFCLEVBTnJCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQVEwQixpQkFBUUwsU0FBUixDQVIxQjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFRV00sb0JBUlg7O0FBU0k7QUFDTUMsd0JBVlYsR0FVcUJQLFlBQVksZUFBS1EsR0FBakIsR0FBdUJGLElBVjVDOztBQVlJOztBQUNJRyxx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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7O0FBaUViOzs7QUFHQXRCLGtCQUFNMEIsR0FBTixDQUFVLElBQVYsRUFBZ0J6Qjs7QUFFaEI7OztBQUZBLGNBcEVhLGtDQXlFTjBCLE9BekVNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoiZ2xvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2dsb2IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBtYXRjaCBmcm9tICdtaW5pbWF0Y2gnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi9nZXQtcGF0aCdcbmltcG9ydCB7IHJlYWRkaXIsIHN0YXQgfSBmcm9tICcuL2ZzJ1xuXG5sZXQgc3RhdENhY2hlXG5jb25zdCB0ZW1wQ2FjaGUgPSBbXVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocGF0dGVybiwgY3dkLCB1c2VEb3VibGVDYWNoZSA9IGZhbHNlKSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIC8vIGdldCBjYWNoZVxuICBpZiAoc3RhdENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0Q2FjaGUgPSBjYWNoZS52YWwoJ3NjJykgfHwge31cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmUgd2Fsay5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHdhbGsocHR0biwgZGlyZWN0b3J5LCByZWN1cnNpdmUgPSBmYWxzZSkge1xuICAgIGlmIChwdHRuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY3VyciA9IHB0dG4uc2hpZnQoKVxuICAgIGxldCBsb2NhbFJlc3VsdHMgPSBbXVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiAoYXdhaXQgcmVhZGRpcihkaXJlY3RvcnkpKSkge1xuICAgICAgLy8gZml4IGZpbGUgcGF0aFxuICAgICAgY29uc3QgZmlsZXBhdGggPSBkaXJlY3RvcnkgKyBwYXRoLnNlcCArIGZpbGVcblxuICAgICAgLy8gZ2V0IHN0YXQgZnJvbSB0ZW1wIGNhY2hlIChmb3Igbm9uLXdhdGNoIHRhc2tzKSBvciBzdGF0KClcbiAgICAgIGxldCBmc3RhdFxuXG4gICAgICBpZiAodXNlRG91YmxlQ2FjaGUpIHtcbiAgICAgICAgZnN0YXQgPSB0ZW1wQ2FjaGVbZmlsZXBhdGhdID0gdGVtcENhY2hlW2ZpbGVwYXRoXSB8fCBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnN0YXQgPSBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuICAgICAgfVxuXG4gICAgICAvLyBoYXMgYmVlbiBtb2RpZmllZFxuICAgICAgaWYgKG1hdGNoKGZpbGUsIGN1cnIpKSB7XG4gICAgICAgIGlmIChmc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgIGlmICghc3RhdENhY2hlLmhhc093blByb3BlcnR5KGZpbGVwYXRoKSB8fCBzdGF0Q2FjaGVbZmlsZXBhdGhdICE9PSArZnN0YXQubXRpbWUpIHtcbiAgICAgICAgICAgIHN0YXRDYWNoZVtmaWxlcGF0aF0gPSArZnN0YXQubXRpbWVcbiAgICAgICAgICAgIGxvY2FsUmVzdWx0cy5wdXNoKGZpbGVwYXRoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2NhbFJlc3VsdHMgPSBsb2NhbFJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsocHR0biwgZmlsZXBhdGgsIHJlY3Vyc2l2ZSB8fCBjdXJyID09PSAnKionKSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChmc3RhdC5pc0RpcmVjdG9yeSgpICYmIHJlY3Vyc2l2ZSkge1xuICAgICAgICBsb2NhbFJlc3VsdHMgPSBsb2NhbFJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsoW2N1cnJdLmNvbmNhdChwdHRuKSwgZmlsZXBhdGgsIHJlY3Vyc2l2ZSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2FsUmVzdWx0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbGwgcGF0dGVybnMgYWdhaW5zdCBkaXJlY3RvcnkuXG4gICAqL1xuICBsZXQgcmVzdWx0cyA9IFtdXG4gIGZvciAobGV0IHB0dG4gb2YgcGF0dGVybikge1xuICAgIGlmIChwdHRuWzBdID09PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IHN1cmUgd2hhdCB0byBkbyB3aXRoIHRoZSAvIGluIHlvdXIgZ2xvYi4nKVxuICAgIH1cblxuICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4uc3BsaXQoJy8nKSwgY3dkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2FjaGUuXG4gICAqL1xuICBjYWNoZS52YWwoJ3NjJywgc3RhdENhY2hlKVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gZmluYWwgcmVzdWx0cyBvYmplY3QuXG4gICAqL1xuICByZXR1cm4gcmVzdWx0c1xufSJdfQ==