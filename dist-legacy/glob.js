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
                  _context.next = 35;
                  break;
                }

                file = _step.value;

                // fix file path
                filepath = directory + _path2.default.sep + file;

                // todo: cache this shit

                _context.next = 17;
                return (0, _fs.stat)(filepath

                // has been modified
                );

              case 17:
                fstat = _context.sent;

                if (!(!statCache.hasOwnProperty(filepath) || statCache[filepath] !== +fstat.mtime)) {
                  _context.next = 32;
                  break;
                }

                statCache[filepath] = +fstat.mtime;

                if (!(0, _minimatch2.default)(file, curr)) {
                  _context.next = 29;
                  break;
                }

                if (!fstat.isFile()) {
                  _context.next = 25;
                  break;
                }

                localResults.push(filepath);
                _context.next = 27;
                break;

              case 25:
                _context.next = 27;
                return walk(pttn, filepath, recursive || curr === '**');

              case 27:
                _context.next = 32;
                break;

              case 29:
                if (!(fstat.isDirectory() && recursive)) {
                  _context.next = 32;
                  break;
                }

                _context.next = 32;
                return walk([curr].concat(pttn), filepath, recursive);

              case 32:
                _iteratorNormalCompletion = true;
                _context.next = 12;
                break;

              case 35:
                _context.next = 41;
                break;

              case 37:
                _context.prev = 37;
                _context.t1 = _context['catch'](7);
                _didIteratorError = true;
                _iteratorError = _context.t1;

              case 41:
                _context.prev = 41;
                _context.prev = 42;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 44:
                _context.prev = 44;

                if (!_didIteratorError) {
                  _context.next = 47;
                  break;
                }

                throw _iteratorError;

              case 47:
                return _context.finish(44);

              case 48:
                return _context.finish(41);

              case 49:
                return _context.abrupt('return', localResults);

              case 50:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[7, 37, 41, 49], [42,, 44, 48]]);
      }));

      return function walk(_x4, _x5) {
        return _ref2.apply(this, arguments);
      };
    }();

    /**
     * Run all patterns against directory.
     */


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

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwic3RhdENhY2hlIiwicGF0dGVybiIsImN3ZCIsInB0dG4iLCJkaXJlY3RvcnkiLCJyZWN1cnNpdmUiLCJsZW5ndGgiLCJjdXJyIiwic2hpZnQiLCJsb2NhbFJlc3VsdHMiLCJmaWxlIiwiZmlsZXBhdGgiLCJzZXAiLCJmc3RhdCIsImhhc093blByb3BlcnR5IiwibXRpbWUiLCJpc0ZpbGUiLCJwdXNoIiwid2FsayIsImlzRGlyZWN0b3J5IiwiY29uY2F0IiwiQXJyYXkiLCJ1bmRlZmluZWQiLCJ2YWwiLCJyZXN1bHRzIiwiRXJyb3IiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7OzsyY0FWQTs7Ozs7O0FBWUEsSUFBSUMsa0JBQUo7Ozt1REFFZSxrQkFBT0MsT0FBUCxFQUFnQkMsR0FBaEI7O0FBV2I7OztBQVhhO0FBQUEsNERBY2IsaUJBQW9CQyxJQUFwQixFQUEwQkMsU0FBMUI7QUFBQSxZQUFxQ0MsU0FBckMsdUVBQWlELEtBQWpEOztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQ01GLEtBQUtHLE1BQUwsS0FBZ0IsQ0FEdEI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFLUUMsb0JBTFIsR0FLZUosS0FBS0ssS0FBTCxFQUxmO0FBTVFDLDRCQU5SLEdBTXVCLEVBTnZCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQVEwQixpQkFBUUwsU0FBUixDQVIxQjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFRV00sb0JBUlg7O0FBU0k7QUFDTUMsd0JBVlYsR0FVcUJQLFlBQVksZUFBS1EsR0FBakIsR0FBdUJGLElBVjVDOztBQVlJOztBQVpKO0FBQUEsdUJBYXNCLGNBQUtDOztBQUV2QjtBQUZrQixpQkFidEI7O0FBQUE7QUFhUUUscUJBYlI7O0FBQUEsc0JBZ0JRLENBQUNiLFVBQVVjLGNBQVYsQ0FBeUJILFFBQXpCLENBQUQsSUFBdUNYLFVBQVVXLFFBQVYsTUFBd0IsQ0FBQ0UsTUFBTUUsS0FoQjlFO0FBQUE7QUFBQTtBQUFBOztBQWlCTWYsMEJBQVVXLFFBQVYsSUFBc0IsQ0FBQ0UsTUFBTUUsS0FBN0I7O0FBakJOLHFCQW1CVSx5QkFBTUwsSUFBTixFQUFZSCxJQUFaLENBbkJWO0FBQUE7QUFBQTtBQUFBOztBQUFBLHFCQW9CWU0sTUFBTUcsTUFBTixFQXBCWjtBQUFBO0FBQUE7QUFBQTs7QUFxQlVQLDZCQUFhUSxJQUFiLENBQWtCTixRQUFsQjtBQXJCVjtBQUFBOztBQUFBO0FBQUE7QUFBQSx1QkF1QmdCTyxLQUFLZixJQUFMLEVBQVdRLFFBQVgsRUFBcUJOLGFBQWFFLFNBQVMsSUFBM0MsQ0F2QmhCOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHNCQXlCaUJNLE1BQU1NLFdBQU4sTUFBdUJkLFNBekJ4QztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHVCQTBCY2EsS0FBSyxDQUFDWCxJQUFELEVBQU9hLE1BQVAsQ0FBY2pCLElBQWQsQ0FBTCxFQUEwQlEsUUFBMUIsRUFBb0NOLFNBQXBDLENBMUJkOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQSxpREErQlNJLFlBL0JUOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BZGE7O0FBQUEsc0JBY0VTLElBZEY7QUFBQTtBQUFBO0FBQUE7O0FBZ0RiOzs7OztBQWhEYTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNiO0FBQ0EsZ0JBQUksRUFBRWpCLG1CQUFtQm9CLEtBQXJCLENBQUosRUFBaUM7QUFDL0JwQix3QkFBVSxDQUFDQSxPQUFELENBQVY7QUFDRDs7QUFFRDtBQUNBLGdCQUFJRCxjQUFjc0IsU0FBbEIsRUFBNkI7QUFDM0J0QiwwQkFBWUQsTUFBTXdCLEdBQU4sQ0FBVSxJQUFWLEtBQW1CLEVBQS9CO0FBQ0QsYUEwQ0dDLE9BbkRTLEdBbURDLEVBbkREO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx5QkFvREl2QixPQXBESjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW9ESkUsZ0JBcERJOztBQUFBLGtCQXFEUEEsS0FBSyxDQUFMLE1BQVksR0FyREw7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBc0RILElBQUlzQixLQUFKLENBQVUsOENBQVYsQ0F0REc7O0FBQUE7QUFBQSwyQkF5RERELE9BekRDO0FBQUE7QUFBQSxtQkF5RG9CTixLQUFLZixLQUFLdUIsS0FBTCxDQUFXLEdBQVgsQ0FBTCxFQUFzQnhCLEdBQXRCLENBekRwQjs7QUFBQTtBQUFBO0FBeURYc0IsbUJBekRXLGdCQXlET0osTUF6RFA7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTs7QUE0RGI7OztBQUdBckIsa0JBQU13QixHQUFOLENBQVUsSUFBVixFQUFnQnZCOztBQUVoQjs7O0FBRkEsY0EvRGEsa0NBb0VOd0IsT0FwRU07O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsImZpbGUiOiJnbG9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZ2xvYi5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IG1hdGNoIGZyb20gJ21pbmltYXRjaCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuL2dldC1wYXRoJ1xuaW1wb3J0IHsgcmVhZGRpciwgc3RhdCB9IGZyb20gJy4vZnMnXG5cbmxldCBzdGF0Q2FjaGVcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHBhdHRlcm4sIGN3ZCkgPT4ge1xuICAvLyBwcmVmZXIgYXJyYXlzXG4gIGlmICghKHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXR0ZXJuID0gW3BhdHRlcm5dXG4gIH1cblxuICAvLyBnZXQgY2FjaGVcbiAgaWYgKHN0YXRDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhdENhY2hlID0gY2FjaGUudmFsKCdzYycpIHx8IHt9XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlIHdhbGsuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiB3YWxrKHB0dG4sIGRpcmVjdG9yeSwgcmVjdXJzaXZlID0gZmFsc2UpIHtcbiAgICBpZiAocHR0bi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnIgPSBwdHRuLnNoaWZ0KClcbiAgICBjb25zdCBsb2NhbFJlc3VsdHMgPSBbXVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiAoYXdhaXQgcmVhZGRpcihkaXJlY3RvcnkpKSkge1xuICAgICAgLy8gZml4IGZpbGUgcGF0aFxuICAgICAgY29uc3QgZmlsZXBhdGggPSBkaXJlY3RvcnkgKyBwYXRoLnNlcCArIGZpbGVcblxuICAgICAgLy8gdG9kbzogY2FjaGUgdGhpcyBzaGl0XG4gICAgICBsZXQgZnN0YXQgPSBhd2FpdCBzdGF0KGZpbGVwYXRoKVxuXG4gICAgICAvLyBoYXMgYmVlbiBtb2RpZmllZFxuICAgICAgaWYgKCFzdGF0Q2FjaGUuaGFzT3duUHJvcGVydHkoZmlsZXBhdGgpIHx8IHN0YXRDYWNoZVtmaWxlcGF0aF0gIT09ICtmc3RhdC5tdGltZSkge1xuICAgICAgICBzdGF0Q2FjaGVbZmlsZXBhdGhdID0gK2ZzdGF0Lm10aW1lXG5cbiAgICAgICAgaWYgKG1hdGNoKGZpbGUsIGN1cnIpKSB7XG4gICAgICAgICAgaWYgKGZzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICBsb2NhbFJlc3VsdHMucHVzaChmaWxlcGF0aClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgd2FsayhwdHRuLCBmaWxlcGF0aCwgcmVjdXJzaXZlIHx8IGN1cnIgPT09ICcqKicpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGZzdGF0LmlzRGlyZWN0b3J5KCkgJiYgcmVjdXJzaXZlKSB7XG4gICAgICAgICAgYXdhaXQgd2FsayhbY3Vycl0uY29uY2F0KHB0dG4pLCBmaWxlcGF0aCwgcmVjdXJzaXZlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvY2FsUmVzdWx0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbGwgcGF0dGVybnMgYWdhaW5zdCBkaXJlY3RvcnkuXG4gICAqL1xuICBsZXQgcmVzdWx0cyA9IFtdXG4gIGZvciAobGV0IHB0dG4gb2YgcGF0dGVybikge1xuICAgIGlmIChwdHRuWzBdID09PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IHN1cmUgd2hhdCB0byBkbyB3aXRoIHRoZSAvIGluIHlvdXIgZ2xvYi4nKVxuICAgIH1cblxuICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChhd2FpdCB3YWxrKHB0dG4uc3BsaXQoJy8nKSwgY3dkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2FjaGUuXG4gICAqL1xuICBjYWNoZS52YWwoJ3NjJywgc3RhdENhY2hlKVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gZmluYWwgcmVzdWx0cyBvYmplY3QuXG4gICAqL1xuICByZXR1cm4gcmVzdWx0c1xufSJdfQ==