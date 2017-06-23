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

var _ = require('./');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/glob.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('../utils/log')('hopp:glob'),
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
                return (0, _.readdir)(directory);

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
                return (0, _.stat)(filepath);

              case 22:
                _context.t1 = _context.sent;

              case 23:
                fstat = tempCache[filepath] = _context.t1;
                _context.next = 29;
                break;

              case 26:
                _context.next = 28;
                return (0, _.stat)(filepath);

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
            }

            // allow overrides from the env
            recache = recache || process.env.RECACHE === 'true';results = [];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 7;
            _iterator2 = pattern[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context2.next = 21;
              break;
            }

            pttn = _step2.value;

            if (!(pttn[0] === '/')) {
              _context2.next = 13;
              break;
            }

            throw new Error('Not sure what to do with the / in your glob.');

          case 13:
            _context2.t0 = results;
            _context2.next = 16;
            return walk(pttn.split('/'), cwd);

          case 16:
            _context2.t1 = _context2.sent;
            results = _context2.t0.concat.call(_context2.t0, _context2.t1);

          case 18:
            _iteratorNormalCompletion2 = true;
            _context2.next = 9;
            break;

          case 21:
            _context2.next = 27;
            break;

          case 23:
            _context2.prev = 23;
            _context2.t2 = _context2['catch'](7);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t2;

          case 27:
            _context2.prev = 27;
            _context2.prev = 28;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 30:
            _context2.prev = 30;

            if (!_didIteratorError2) {
              _context2.next = 33;
              break;
            }

            throw _iteratorError2;

          case 33:
            return _context2.finish(30);

          case 34:
            return _context2.finish(27);

          case 35:

            /**
             * Update cache.
             */
            cache.val('sc', statCache);

            /**
             * Return final results object.
             */
            return _context2.abrupt('return', results);

          case 37:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[7, 23, 27, 35], [28,, 30, 34]]);
  }));

  return function (_x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwicmVxdWlyZSIsImRlYnVnIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInVzZURvdWJsZUNhY2hlIiwicHR0biIsImRpcmVjdG9yeSIsInJlY3Vyc2l2ZSIsImxlbmd0aCIsImN1cnIiLCJzaGlmdCIsImxvY2FsUmVzdWx0cyIsInJlY2FjaGUiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsImlzRmlsZSIsImhhc093blByb3BlcnR5IiwibXRpbWUiLCJwdXNoIiwid2FsayIsImNvbmNhdCIsImlzRGlyZWN0b3J5IiwiQXJyYXkiLCJ1bmRlZmluZWQiLCJ2YWwiLCJwcm9jZXNzIiwiZW52IiwiUkVDQUNIRSIsInJlc3VsdHMiLCJFcnJvciIsInNwbGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7OzsyY0FUQTs7Ozs7O2VBV2tCQyxRQUFRLGNBQVIsRUFBd0IsV0FBeEIsQztJQUFWQyxLLFlBQUFBLEs7O0FBRVIsSUFBSUMsa0JBQUo7QUFDQSxJQUFNQyxZQUFZLEVBQWxCOzs7dURBRWUsa0JBQU9DLE9BQVAsRUFBZ0JDLEdBQWhCO0FBQUEsUUFBcUJDLGNBQXJCLHVFQUFzQyxLQUF0Qzs7QUFjYjs7O0FBZGE7QUFBQSw0REFpQmIsaUJBQW9CQyxJQUFwQixFQUEwQkMsU0FBMUI7QUFBQSxZQUFxQ0MsU0FBckMsdUVBQWlELEtBQWpEOztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQ01GLEtBQUtHLE1BQUwsS0FBZ0IsQ0FEdEI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFLUUMsb0JBTFIsR0FLZUosS0FBS0ssS0FBTCxFQUxmO0FBTU1DLDRCQU5OLEdBTXFCLEVBTnJCOzs7QUFRRVosc0JBQU0sOENBQU4sRUFBc0RVLElBQXRELEVBQTRESCxTQUE1RCxF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OURJOztBQUFBLGtCQStEUEEsS0FBSyxDQUFMLE1BQVksR0EvREw7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBZ0VILElBQUkwQixLQUFKLENBQVUsOENBQVYsQ0FoRUc7O0FBQUE7QUFBQSwyQkFtRURELE9BbkVDO0FBQUE7QUFBQSxtQkFtRW9CVCxLQUFLaEIsS0FBSzJCLEtBQUwsQ0FBVyxHQUFYLENBQUwsRUFBc0I3QixHQUF0QixDQW5FcEI7O0FBQUE7QUFBQTtBQW1FWDJCLG1CQW5FVyxnQkFtRU9SLE1BbkVQOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7O0FBc0ViOzs7QUFHQXpCLGtCQUFNNkIsR0FBTixDQUFVLElBQVYsRUFBZ0IxQixTQUFoQjs7QUFFQTs7O0FBM0VhLDhDQThFTjhCLE9BOUVNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoiZ2xvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2dsb2IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBtYXRjaCBmcm9tICdtaW5pbWF0Y2gnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IHJlYWRkaXIsIHN0YXQgfSBmcm9tICcuLydcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvbG9nJykoJ2hvcHA6Z2xvYicpXG5cbmxldCBzdGF0Q2FjaGVcbmNvbnN0IHRlbXBDYWNoZSA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChwYXR0ZXJuLCBjd2QsIHVzZURvdWJsZUNhY2hlID0gZmFsc2UsIHJlY2FjaGUgPSBmYWxzZSkgPT4ge1xuICAvLyBwcmVmZXIgYXJyYXlzXG4gIGlmICghKHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXR0ZXJuID0gW3BhdHRlcm5dXG4gIH1cblxuICAvLyBnZXQgY2FjaGVcbiAgaWYgKHN0YXRDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhdENhY2hlID0gY2FjaGUudmFsKCdzYycpIHx8IHt9XG4gIH1cbiAgXG4gIC8vIGFsbG93IG92ZXJyaWRlcyBmcm9tIHRoZSBlbnZcbiAgcmVjYWNoZSA9IHJlY2FjaGUgfHwgcHJvY2Vzcy5lbnYuUkVDQUNIRSA9PT0gJ3RydWUnXG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZSB3YWxrLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gd2FsayhwdHRuLCBkaXJlY3RvcnksIHJlY3Vyc2l2ZSA9IGZhbHNlKSB7XG4gICAgaWYgKHB0dG4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBjdXJyID0gcHR0bi5zaGlmdCgpXG4gICAgbGV0IGxvY2FsUmVzdWx0cyA9IFtdXG5cbiAgICBkZWJ1ZygnY3VycjogJXMsIGRpciA9ICVzLCByZWN1ciA9ICVzLCByZWNhY2hlID0gJXMnLCBjdXJyLCBkaXJlY3RvcnksIHJlY3Vyc2l2ZSwgcmVjYWNoZSlcblxuICAgIGZvciAobGV0IGZpbGUgb2YgKGF3YWl0IHJlYWRkaXIoZGlyZWN0b3J5KSkpIHtcbiAgICAgIC8vIGZpeCBmaWxlIHBhdGhcbiAgICAgIGNvbnN0IGZpbGVwYXRoID0gZGlyZWN0b3J5ICsgcGF0aC5zZXAgKyBmaWxlXG5cbiAgICAgIC8vIGdldCBzdGF0IGZyb20gdGVtcCBjYWNoZSAoZm9yIG5vbi13YXRjaCB0YXNrcykgb3Igc3RhdCgpXG4gICAgICBsZXQgZnN0YXRcblxuICAgICAgaWYgKHVzZURvdWJsZUNhY2hlKSB7XG4gICAgICAgIGZzdGF0ID0gdGVtcENhY2hlW2ZpbGVwYXRoXSA9IHRlbXBDYWNoZVtmaWxlcGF0aF0gfHwgYXdhaXQgc3RhdChmaWxlcGF0aClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzdGF0ID0gYXdhaXQgc3RhdChmaWxlcGF0aClcbiAgICAgIH1cblxuICAgICAgLy8gaGFzIGJlZW4gbW9kaWZpZWRcbiAgICAgIGlmIChtYXRjaChmaWxlLCBjdXJyKSkge1xuICAgICAgICBpZiAoZnN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgICBpZiAocmVjYWNoZSB8fCAhc3RhdENhY2hlLmhhc093blByb3BlcnR5KGZpbGVwYXRoKSB8fCBzdGF0Q2FjaGVbZmlsZXBhdGhdICE9PSArZnN0YXQubXRpbWUpIHtcbiAgICAgICAgICAgIHN0YXRDYWNoZVtmaWxlcGF0aF0gPSArZnN0YXQubXRpbWVcbiAgICAgICAgICAgIGxvY2FsUmVzdWx0cy5wdXNoKGZpbGVwYXRoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2NhbFJlc3VsdHMgPSBsb2NhbFJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsocHR0biwgZmlsZXBhdGgsIHJlY3Vyc2l2ZSB8fCBjdXJyID09PSAnKionKSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChmc3RhdC5pc0RpcmVjdG9yeSgpICYmIHJlY3Vyc2l2ZSkge1xuICAgICAgICBsb2NhbFJlc3VsdHMgPSBsb2NhbFJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsoW2N1cnJdLmNvbmNhdChwdHRuKSwgZmlsZXBhdGgsIHJlY3Vyc2l2ZSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2FsUmVzdWx0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbGwgcGF0dGVybnMgYWdhaW5zdCBkaXJlY3RvcnkuXG4gICAqL1xuICBsZXQgcmVzdWx0cyA9IFtdXG4gIGZvciAobGV0IHB0dG4gb2YgcGF0dGVybikge1xuICAgIGlmIChwdHRuWzBdID09PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IHN1cmUgd2hhdCB0byBkbyB3aXRoIHRoZSAvIGluIHlvdXIgZ2xvYi4nKVxuICAgIH1cblxuICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4uc3BsaXQoJy8nKSwgY3dkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2FjaGUuXG4gICAqL1xuICBjYWNoZS52YWwoJ3NjJywgc3RhdENhY2hlKVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gZmluYWwgcmVzdWx0cyBvYmplY3QuXG4gICAqL1xuICByZXR1cm4gcmVzdWx0c1xufVxuIl19