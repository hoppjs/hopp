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


                debug('curr: %s, dir = %s, recur = %s', curr, directory, recursive);

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

                if (!statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwicmVxdWlyZSIsImRlYnVnIiwic3RhdENhY2hlIiwidGVtcENhY2hlIiwicGF0dGVybiIsImN3ZCIsInB0dG4iLCJkaXJlY3RvcnkiLCJyZWN1cnNpdmUiLCJsZW5ndGgiLCJjdXJyIiwic2hpZnQiLCJsb2NhbFJlc3VsdHMiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsInVzZURvdWJsZUNhY2hlIiwiaXNGaWxlIiwiaGFzT3duUHJvcGVydHkiLCJtdGltZSIsInB1c2giLCJ3YWxrIiwiY29uY2F0IiwiaXNEaXJlY3RvcnkiLCJBcnJheSIsInVuZGVmaW5lZCIsInZhbCIsInJlc3VsdHMiLCJFcnJvciIsInNwbGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7Ozs7OzJjQVZBOzs7Ozs7ZUFZa0JDLFFBQVEsYUFBUixFQUF1QixXQUF2QixDO0lBQVZDLEssWUFBQUEsSzs7QUFFUixJQUFJQyxrQkFBSjtBQUNBLElBQU1DLFlBQVksRUFBbEI7Ozt1REFFZSxrQkFBT0MsT0FBUCxFQUFnQkMsR0FBaEI7O0FBV2I7OztBQVhhO0FBQUEsNERBY2IsaUJBQW9CQyxJQUFwQixFQUEwQkMsU0FBMUI7QUFBQSxZQUFxQ0MsU0FBckMsdUVBQWlELEtBQWpEOztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQ01GLEtBQUtHLE1BQUwsS0FBZ0IsQ0FEdEI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFLUUMsb0JBTFIsR0FLZUosS0FBS0ssS0FBTCxFQUxmO0FBTU1DLDRCQU5OLEdBTXFCLEVBTnJCOzs7QUFRRVgsc0JBQU0sZ0NBQU4sRUFBd0NTLElBQXhDLEVBQThDSCxTQUE5QyxFQUF5REMsU0FBekQ7O0FBUkY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQVUwQixpQkFBUUQsU0FBUixDQVYx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QixLQUFLd0IsS0FBTCxDQUFXLEdBQVgsQ0FBTCxFQUFzQnpCLEdBQXRCLENBaEVwQjs7QUFBQTtBQUFBO0FBZ0VYdUIsbUJBaEVXLGdCQWdFT0wsTUFoRVA7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTs7QUFtRWI7OztBQUdBeEIsa0JBQU00QixHQUFOLENBQVUsSUFBVixFQUFnQnpCOztBQUVoQjs7O0FBRkEsY0F0RWEsa0NBMkVOMEIsT0EzRU07O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsImZpbGUiOiJnbG9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZ2xvYi5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IG1hdGNoIGZyb20gJ21pbmltYXRjaCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuL2dldC1wYXRoJ1xuaW1wb3J0IHsgcmVhZGRpciwgc3RhdCB9IGZyb20gJy4vZnMnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHA6Z2xvYicpXG5cbmxldCBzdGF0Q2FjaGVcbmNvbnN0IHRlbXBDYWNoZSA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChwYXR0ZXJuLCBjd2QsIHVzZURvdWJsZUNhY2hlID0gZmFsc2UpID0+IHtcbiAgLy8gcHJlZmVyIGFycmF5c1xuICBpZiAoIShwYXR0ZXJuIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgcGF0dGVybiA9IFtwYXR0ZXJuXVxuICB9XG5cbiAgLy8gZ2V0IGNhY2hlXG4gIGlmIChzdGF0Q2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXRDYWNoZSA9IGNhY2hlLnZhbCgnc2MnKSB8fCB7fVxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZSB3YWxrLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gd2FsayhwdHRuLCBkaXJlY3RvcnksIHJlY3Vyc2l2ZSA9IGZhbHNlKSB7XG4gICAgaWYgKHB0dG4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBjdXJyID0gcHR0bi5zaGlmdCgpXG4gICAgbGV0IGxvY2FsUmVzdWx0cyA9IFtdXG5cbiAgICBkZWJ1ZygnY3VycjogJXMsIGRpciA9ICVzLCByZWN1ciA9ICVzJywgY3VyciwgZGlyZWN0b3J5LCByZWN1cnNpdmUpXG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIChhd2FpdCByZWFkZGlyKGRpcmVjdG9yeSkpKSB7XG4gICAgICAvLyBmaXggZmlsZSBwYXRoXG4gICAgICBjb25zdCBmaWxlcGF0aCA9IGRpcmVjdG9yeSArIHBhdGguc2VwICsgZmlsZVxuXG4gICAgICAvLyBnZXQgc3RhdCBmcm9tIHRlbXAgY2FjaGUgKGZvciBub24td2F0Y2ggdGFza3MpIG9yIHN0YXQoKVxuICAgICAgbGV0IGZzdGF0XG5cbiAgICAgIGlmICh1c2VEb3VibGVDYWNoZSkge1xuICAgICAgICBmc3RhdCA9IHRlbXBDYWNoZVtmaWxlcGF0aF0gPSB0ZW1wQ2FjaGVbZmlsZXBhdGhdIHx8IGF3YWl0IHN0YXQoZmlsZXBhdGgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmc3RhdCA9IGF3YWl0IHN0YXQoZmlsZXBhdGgpXG4gICAgICB9XG5cbiAgICAgIC8vIGhhcyBiZWVuIG1vZGlmaWVkXG4gICAgICBpZiAobWF0Y2goZmlsZSwgY3VycikpIHtcbiAgICAgICAgaWYgKGZzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgaWYgKCFzdGF0Q2FjaGUuaGFzT3duUHJvcGVydHkoZmlsZXBhdGgpIHx8IHN0YXRDYWNoZVtmaWxlcGF0aF0gIT09ICtmc3RhdC5tdGltZSkge1xuICAgICAgICAgICAgc3RhdENhY2hlW2ZpbGVwYXRoXSA9ICtmc3RhdC5tdGltZVxuICAgICAgICAgICAgbG9jYWxSZXN1bHRzLnB1c2goZmlsZXBhdGgpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2FsUmVzdWx0cyA9IGxvY2FsUmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhwdHRuLCBmaWxlcGF0aCwgcmVjdXJzaXZlIHx8IGN1cnIgPT09ICcqKicpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGZzdGF0LmlzRGlyZWN0b3J5KCkgJiYgcmVjdXJzaXZlKSB7XG4gICAgICAgIGxvY2FsUmVzdWx0cyA9IGxvY2FsUmVzdWx0cy5jb25jYXQoYXdhaXQgd2FsayhbY3Vycl0uY29uY2F0KHB0dG4pLCBmaWxlcGF0aCwgcmVjdXJzaXZlKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9jYWxSZXN1bHRzXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFsbCBwYXR0ZXJucyBhZ2FpbnN0IGRpcmVjdG9yeS5cbiAgICovXG4gIGxldCByZXN1bHRzID0gW11cbiAgZm9yIChsZXQgcHR0biBvZiBwYXR0ZXJuKSB7XG4gICAgaWYgKHB0dG5bMF0gPT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3Qgc3VyZSB3aGF0IHRvIGRvIHdpdGggdGhlIC8gaW4geW91ciBnbG9iLicpXG4gICAgfVxuXG4gICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KGF3YWl0IHdhbGsocHR0bi5zcGxpdCgnLycpLCBjd2QpKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjYWNoZS5cbiAgICovXG4gIGNhY2hlLnZhbCgnc2MnLCBzdGF0Q2FjaGUpXG5cbiAgLyoqXG4gICAqIFJldHVybiBmaW5hbCByZXN1bHRzIG9iamVjdC5cbiAgICovXG4gIHJldHVybiByZXN1bHRzXG59Il19