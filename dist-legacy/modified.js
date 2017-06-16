'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _uninum = require('./utils/uninum');

var _uninum2 = _interopRequireDefault(_uninum);

var _fs = require('./fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/modified.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var statCache = void 0;

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(files) {
    var mod, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, lmod;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            mod = [];

            /**
             * Load from cache.
             */

            if (statCache === undefined) {
              statCache = cache.val('sc') || {};
            }

            /**
             * Update cache.
             */
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 5;
            _iterator = files[Symbol.iterator]();

          case 7:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 16;
              break;
            }

            file = _step.value;
            _context.next = 11;
            return (0, _fs.stat)(file);

          case 11:
            lmod = +_context.sent.mtime;


            if (lmod !== statCache[file]) {
              statCache[file] = lmod;
              mod.push(file);
            }

          case 13:
            _iteratorNormalCompletion = true;
            _context.next = 7;
            break;

          case 16:
            _context.next = 22;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context['catch'](5);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 22:
            _context.prev = 22;
            _context.prev = 23;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 25:
            _context.prev = 25;

            if (!_didIteratorError) {
              _context.next = 28;
              break;
            }

            throw _iteratorError;

          case 28:
            return _context.finish(25);

          case 29:
            return _context.finish(22);

          case 30:

            cache.val('sc', statCache

            // end
            );return _context.abrupt('return', mod);

          case 32:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[5, 18, 22, 30], [23,, 25, 29]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RpZmllZC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsInN0YXRDYWNoZSIsImZpbGVzIiwibW9kIiwidW5kZWZpbmVkIiwidmFsIiwiZmlsZSIsImxtb2QiLCJtdGltZSIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7OzsyY0FSQTs7Ozs7O0FBVUEsSUFBSUMsa0JBQUo7Ozt1REFFZSxpQkFBTUMsS0FBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1BDLGVBRE8sR0FDRCxFQURDOztBQUdiOzs7O0FBR0EsZ0JBQUlGLGNBQWNHLFNBQWxCLEVBQTZCO0FBQzNCSCwwQkFBWUQsTUFBTUssR0FBTixDQUFVLElBQVYsS0FBbUIsRUFBL0I7QUFDRDs7QUFFRDs7O0FBVmE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFhSUgsS0FiSjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWFKSSxnQkFiSTtBQUFBO0FBQUEsbUJBY1UsY0FBS0EsSUFBTCxDQWRWOztBQUFBO0FBY0xDLGdCQWRLLGtCQWNzQkMsS0FkdEI7OztBQWdCWCxnQkFBSUQsU0FBU04sVUFBVUssSUFBVixDQUFiLEVBQThCO0FBQzVCTCx3QkFBVUssSUFBVixJQUFrQkMsSUFBbEI7QUFDQUosa0JBQUlNLElBQUosQ0FBU0gsSUFBVDtBQUNEOztBQW5CVTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBOztBQXNCYk4sa0JBQU1LLEdBQU4sQ0FBVSxJQUFWLEVBQWdCSjs7QUFFaEI7QUFGQSxjQXRCYSxpQ0F5Qk5FLEdBekJNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoibW9kaWZpZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9tb2RpZmllZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IFVOIGZyb20gJy4vdXRpbHMvdW5pbnVtJ1xuaW1wb3J0IHsgc3RhdCB9IGZyb20gJy4vZnMnXG5cbmxldCBzdGF0Q2FjaGVcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZXMgPT4ge1xuICBjb25zdCBtb2QgPSBbXVxuXG4gIC8qKlxuICAgKiBMb2FkIGZyb20gY2FjaGUuXG4gICAqL1xuICBpZiAoc3RhdENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0Q2FjaGUgPSBjYWNoZS52YWwoJ3NjJykgfHwge31cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2FjaGUuXG4gICAqL1xuICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcblxuICAgIGlmIChsbW9kICE9PSBzdGF0Q2FjaGVbZmlsZV0pIHtcbiAgICAgIHN0YXRDYWNoZVtmaWxlXSA9IGxtb2RcbiAgICAgIG1vZC5wdXNoKGZpbGUpXG4gICAgfVxuICB9XG5cbiAgY2FjaGUudmFsKCdzYycsIHN0YXRDYWNoZSlcblxuICAvLyBlbmRcbiAgcmV0dXJuIG1vZFxufSJdfQ==