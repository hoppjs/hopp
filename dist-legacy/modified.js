'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _fs = require('./fs');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RpZmllZC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsInN0YXRDYWNoZSIsImZpbGVzIiwibW9kIiwidW5kZWZpbmVkIiwidmFsIiwiZmlsZSIsImxtb2QiLCJtdGltZSIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztJQUFZQSxLOztBQUNaOzs7OzJjQVBBOzs7Ozs7QUFTQSxJQUFJQyxrQkFBSjs7O3VEQUVlLGlCQUFNQyxLQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUEMsZUFETyxHQUNELEVBREM7O0FBR2I7Ozs7QUFHQSxnQkFBSUYsY0FBY0csU0FBbEIsRUFBNkI7QUFDM0JILDBCQUFZRCxNQUFNSyxHQUFOLENBQVUsSUFBVixLQUFtQixFQUEvQjtBQUNEOztBQUVEOzs7QUFWYTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQWFJSCxLQWJKOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYUpJLGdCQWJJO0FBQUE7QUFBQSxtQkFjVSxjQUFLQSxJQUFMLENBZFY7O0FBQUE7QUFjTEMsZ0JBZEssa0JBY3NCQyxLQWR0Qjs7O0FBZ0JYLGdCQUFJRCxTQUFTTixVQUFVSyxJQUFWLENBQWIsRUFBOEI7QUFDNUJMLHdCQUFVSyxJQUFWLElBQWtCQyxJQUFsQjtBQUNBSixrQkFBSU0sSUFBSixDQUFTSCxJQUFUO0FBQ0Q7O0FBbkJVO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7O0FBc0JiTixrQkFBTUssR0FBTixDQUFVLElBQVYsRUFBZ0JKOztBQUVoQjtBQUZBLGNBdEJhLGlDQXlCTkUsR0F6Qk07O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsImZpbGUiOiJtb2RpZmllZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL21vZGlmaWVkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgeyBzdGF0IH0gZnJvbSAnLi9mcydcblxubGV0IHN0YXRDYWNoZVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlcyA9PiB7XG4gIGNvbnN0IG1vZCA9IFtdXG5cbiAgLyoqXG4gICAqIExvYWQgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChzdGF0Q2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXRDYWNoZSA9IGNhY2hlLnZhbCgnc2MnKSB8fCB7fVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjYWNoZS5cbiAgICovXG4gIGZvciAobGV0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuXG4gICAgaWYgKGxtb2QgIT09IHN0YXRDYWNoZVtmaWxlXSkge1xuICAgICAgc3RhdENhY2hlW2ZpbGVdID0gbG1vZFxuICAgICAgbW9kLnB1c2goZmlsZSlcbiAgICB9XG4gIH1cblxuICBjYWNoZS52YWwoJ3NjJywgc3RhdENhY2hlKVxuXG4gIC8vIGVuZFxuICByZXR1cm4gbW9kXG59Il19