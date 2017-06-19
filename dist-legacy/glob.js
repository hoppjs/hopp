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

var _require = require('./utils/log')('hopp:glob'),
    debug = _require.debug;

var statCache = void 0;
var tempCache = {};

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(pattern, cwd) {
    var useDoubleCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

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


                debug('curr: %s, dir = %s, recur = %s, recache = %s', curr, directory, recursive, recache);

                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 8;
                _context.next = 11;
                return (0, _fs.readdir)(directory);

              case 11:
                _context.t0 = Symbol.iterator;
                _iterator = _context.sent[_context.t0]();

              case 13:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 50;
                  break;
                }

                file = _step.value;

                // fix file path
                filepath = directory + _path2.default.sep + file;

                // get stat from temp cache (for non-watch tasks) or stat()

                fstat = void 0;

                if (!useDoubleCache) {
                  _context.next = 26;
                  break;
                }

                _context.t1 = tempCache[filepath];

                if (_context.t1) {
                  _context.next = 23;
                  break;
                }

                _context.next = 22;
                return (0, _fs.stat)(filepath);

              case 22:
                _context.t1 = _context.sent;

              case 23:
                fstat = tempCache[filepath] = _context.t1;
                _context.next = 29;
                break;

              case 26:
                _context.next = 28;
                return (0, _fs.stat)(filepath);

              case 28:
                fstat = _context.sent;

              case 29:
                if (!(0, _minimatch2.default)(file, curr)) {
                  _context.next = 41;
                  break;
                }

                if (!fstat.isFile()) {
                  _context.next = 34;
                  break;
                }

                if (recache || !statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime) {
                  statCache[filepath] = +fstat.mtime;
                  localResults.push(filepath);
                }
                _context.next = 39;
                break;

              case 34:
                _context.t2 = localResults;
                _context.next = 37;
                return walk(pttn, filepath, recursive || curr === '**');

              case 37:
                _context.t3 = _context.sent;
                localResults = _context.t2.concat.call(_context.t2, _context.t3);

              case 39:
                _context.next = 47;
                break;

              case 41:
                if (!(fstat.isDirectory() && recursive)) {
                  _context.next = 47;
                  break;
                }

                _context.t4 = localResults;
                _context.next = 45;
                return walk([curr].concat(pttn), filepath, recursive);

              case 45:
                _context.t5 = _context.sent;
                localResults = _context.t4.concat.call(_context.t4, _context.t5);

              case 47:
                _iteratorNormalCompletion = true;
                _context.next = 13;
                break;

              case 50:
                _context.next = 56;
                break;

              case 52:
                _context.prev = 52;
                _context.t6 = _context['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context.t6;

              case 56:
                _context.prev = 56;
                _context.prev = 57;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 59:
                _context.prev = 59;

                if (!_didIteratorError) {
                  _context.next = 62;
                  break;
                }

                throw _iteratorError;

              case 62:
                return _context.finish(59);

              case 63:
                return _context.finish(56);

              case 64:
                return _context.abrupt('return', localResults);

              case 65:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 52, 56, 64], [57,, 59, 63]]);
      }));

      return function walk(_x6, _x7) {
        return _ref2.apply(this, arguments);
      };
    }();

    /**
     * Run all patterns against directory.
     */


    var recache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

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

  return function (_x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwicmVxdWlyZSIsImRlYnVnIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInVzZURvdWJsZUNhY2hlIiwicHR0biIsImRpcmVjdG9yeSIsInJlY3Vyc2l2ZSIsImxlbmd0aCIsImN1cnIiLCJzaGlmdCIsImxvY2FsUmVzdWx0cyIsInJlY2FjaGUiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsImlzRmlsZSIsImhhc093blByb3BlcnR5IiwibXRpbWUiLCJwdXNoIiwid2FsayIsImNvbmNhdCIsImlzRGlyZWN0b3J5IiwiQXJyYXkiLCJ1bmRlZmluZWQiLCJ2YWwiLCJyZXN1bHRzIiwiRXJyb3IiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7OzsyY0FWQTs7Ozs7O2VBWWtCQyxRQUFRLGFBQVIsRUFBdUIsV0FBdkIsQztJQUFWQyxLLFlBQUFBLEs7O0FBRVIsSUFBSUMsa0JBQUo7QUFDQSxJQUFNQyxZQUFZLEVBQWxCOzs7dURBRWUsa0JBQU9DLE9BQVAsRUFBZ0JDLEdBQWhCO0FBQUEsUUFBcUJDLGNBQXJCLHVFQUFzQyxLQUF0Qzs7QUFXYjs7O0FBWGE7QUFBQSw0REFjYixpQkFBb0JDLElBQXBCLEVBQTBCQyxTQUExQjtBQUFBLFlBQXFDQyxTQUFyQyx1RUFBaUQsS0FBakQ7O0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFDTUYsS0FBS0csTUFBTCxLQUFnQixDQUR0QjtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUtRQyxvQkFMUixHQUtlSixLQUFLSyxLQUFMLEVBTGY7QUFNTUMsNEJBTk4sR0FNcUIsRUFOckI7OztBQVFFWixzQkFBTSw4Q0FBTixFQUFzRFUsSUFBdEQsRUFBNERILFNBQTVELEVBQXVFQyxTQUF2RSxFQUFrRkssT0FBbEY7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QUFWLENBN0RHOztBQUFBO0FBQUEsMkJBZ0VERCxPQWhFQztBQUFBO0FBQUEsbUJBZ0VvQk4sS0FBS2hCLEtBQUt3QixLQUFMLENBQVcsR0FBWCxDQUFMLEVBQXNCMUIsR0FBdEIsQ0FoRXBCOztBQUFBO0FBQUE7QUFnRVh3QixtQkFoRVcsZ0JBZ0VPTCxNQWhFUDs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBOztBQW1FYjs7O0FBR0F6QixrQkFBTTZCLEdBQU4sQ0FBVSxJQUFWLEVBQWdCMUI7O0FBRWhCOzs7QUFGQSxjQXRFYSxrQ0EyRU4yQixPQTNFTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6Imdsb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9nbG9iLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4vZ2V0LXBhdGgnXG5pbXBvcnQgeyByZWFkZGlyLCBzdGF0IH0gZnJvbSAnLi9mcydcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcDpnbG9iJylcblxubGV0IHN0YXRDYWNoZVxuY29uc3QgdGVtcENhY2hlID0ge31cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHBhdHRlcm4sIGN3ZCwgdXNlRG91YmxlQ2FjaGUgPSBmYWxzZSwgcmVjYWNoZSA9IGZhbHNlKSA9PiB7XG4gIC8vIHByZWZlciBhcnJheXNcbiAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHBhdHRlcm4gPSBbcGF0dGVybl1cbiAgfVxuXG4gIC8vIGdldCBjYWNoZVxuICBpZiAoc3RhdENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0Q2FjaGUgPSBjYWNoZS52YWwoJ3NjJykgfHwge31cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmUgd2Fsay5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHdhbGsocHR0biwgZGlyZWN0b3J5LCByZWN1cnNpdmUgPSBmYWxzZSkge1xuICAgIGlmIChwdHRuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY3VyciA9IHB0dG4uc2hpZnQoKVxuICAgIGxldCBsb2NhbFJlc3VsdHMgPSBbXVxuXG4gICAgZGVidWcoJ2N1cnI6ICVzLCBkaXIgPSAlcywgcmVjdXIgPSAlcywgcmVjYWNoZSA9ICVzJywgY3VyciwgZGlyZWN0b3J5LCByZWN1cnNpdmUsIHJlY2FjaGUpXG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIChhd2FpdCByZWFkZGlyKGRpcmVjdG9yeSkpKSB7XG4gICAgICAvLyBmaXggZmlsZSBwYXRoXG4gICAgICBjb25zdCBmaWxlcGF0aCA9IGRpcmVjdG9yeSArIHBhdGguc2VwICsgZmlsZVxuXG4gICAgICAvLyBnZXQgc3RhdCBmcm9tIHRlbXAgY2FjaGUgKGZvciBub24td2F0Y2ggdGFza3MpIG9yIHN0YXQoKVxuICAgICAgbGV0IGZzdGF0XG5cbiAgICAgIGlmICh1c2VEb3VibGVDYWNoZSkge1xuICAgICAgICBmc3RhdCA9IHRlbXBDYWNoZVtmaWxlcGF0aF0gPSB0ZW1wQ2FjaGVbZmlsZXBhdGhdIHx8IGF3YWl0IHN0YXQoZmlsZXBhdGgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmc3RhdCA9IGF3YWl0IHN0YXQoZmlsZXBhdGgpXG4gICAgICB9XG5cbiAgICAgIC8vIGhhcyBiZWVuIG1vZGlmaWVkXG4gICAgICBpZiAobWF0Y2goZmlsZSwgY3VycikpIHtcbiAgICAgICAgaWYgKGZzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgaWYgKHJlY2FjaGUgfHwgIXN0YXRDYWNoZS5oYXNPd25Qcm9wZXJ0eShmaWxlcGF0aCkgfHwgc3RhdENhY2hlW2ZpbGVwYXRoXSAhPT0gK2ZzdGF0Lm10aW1lKSB7XG4gICAgICAgICAgICBzdGF0Q2FjaGVbZmlsZXBhdGhdID0gK2ZzdGF0Lm10aW1lXG4gICAgICAgICAgICBsb2NhbFJlc3VsdHMucHVzaChmaWxlcGF0aClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9jYWxSZXN1bHRzID0gbG9jYWxSZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4sIGZpbGVwYXRoLCByZWN1cnNpdmUgfHwgY3VyciA9PT0gJyoqJykpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZnN0YXQuaXNEaXJlY3RvcnkoKSAmJiByZWN1cnNpdmUpIHtcbiAgICAgICAgbG9jYWxSZXN1bHRzID0gbG9jYWxSZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKFtjdXJyXS5jb25jYXQocHR0biksIGZpbGVwYXRoLCByZWN1cnNpdmUpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsb2NhbFJlc3VsdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYWxsIHBhdHRlcm5zIGFnYWluc3QgZGlyZWN0b3J5LlxuICAgKi9cbiAgbGV0IHJlc3VsdHMgPSBbXVxuICBmb3IgKGxldCBwdHRuIG9mIHBhdHRlcm4pIHtcbiAgICBpZiAocHR0blswXSA9PT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzdXJlIHdoYXQgdG8gZG8gd2l0aCB0aGUgLyBpbiB5b3VyIGdsb2IuJylcbiAgICB9XG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhwdHRuLnNwbGl0KCcvJyksIGN3ZCkpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGNhY2hlLlxuICAgKi9cbiAgY2FjaGUudmFsKCdzYycsIHN0YXRDYWNoZSlcblxuICAvKipcbiAgICogUmV0dXJuIGZpbmFsIHJlc3VsdHMgb2JqZWN0LlxuICAgKi9cbiAgcmV0dXJuIHJlc3VsdHNcbn0iXX0=