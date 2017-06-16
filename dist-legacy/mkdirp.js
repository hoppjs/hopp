'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('./fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/mkdirp.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('./utils/log')('hopp'),
    debug = _require.debug;

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory, cwd) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, dir;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // explode into separate
            directory = directory.split(_path2.default.sep

            // walk
            );_iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 4;
            _iterator = directory[Symbol.iterator]();

          case 6:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 21;
              break;
            }

            dir = _step.value;

            if (!dir) {
              _context.next = 18;
              break;
            }

            _context.prev = 9;

            debug('mkdir %s', cwd + _path2.default.sep + dir);
            _context.next = 13;
            return (0, _fs.mkdir)(cwd + _path2.default.sep + dir);

          case 13:
            _context.next = 17;
            break;

          case 15:
            _context.prev = 15;
            _context.t0 = _context['catch'](9);

          case 17:

            cwd += _path2.default.sep + dir;

          case 18:
            _iteratorNormalCompletion = true;
            _context.next = 6;
            break;

          case 21:
            _context.next = 27;
            break;

          case 23:
            _context.prev = 23;
            _context.t1 = _context['catch'](4);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 27:
            _context.prev = 27;
            _context.prev = 28;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 30:
            _context.prev = 30;

            if (!_didIteratorError) {
              _context.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context.finish(30);

          case 34:
            return _context.finish(27);

          case 35:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[4, 23, 27, 35], [9, 15], [28,, 30, 34]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ta2RpcnAuanMiXSwibmFtZXMiOlsicmVxdWlyZSIsImRlYnVnIiwiZGlyZWN0b3J5IiwiY3dkIiwic3BsaXQiLCJzZXAiLCJkaXIiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7MmNBUEE7Ozs7OztlQVNrQkEsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLEM7SUFBVkMsSyxZQUFBQSxLOzs7dURBRU8saUJBQU9DLFNBQVAsRUFBa0JDLEdBQWxCO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDYjtBQUNBRCx3QkFBWUEsVUFBVUUsS0FBVixDQUFnQixlQUFLQzs7QUFFakM7QUFGWSxhQUFaLENBRmE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFLR0gsU0FMSDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUtKSSxlQUxJOztBQUFBLGlCQU1QQSxHQU5PO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQVFQTCxrQkFBTSxVQUFOLEVBQWtCRSxNQUFNLGVBQUtFLEdBQVgsR0FBaUJDLEdBQW5DO0FBUk87QUFBQSxtQkFTRCxlQUFNSCxNQUFNLGVBQUtFLEdBQVgsR0FBaUJDLEdBQXZCLENBVEM7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFZVEgsbUJBQU8sZUFBS0UsR0FBTCxHQUFXQyxHQUFsQjs7QUFaUztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoibWtkaXJwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvbWtkaXJwLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBta2RpciB9IGZyb20gJy4vZnMnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoZGlyZWN0b3J5LCBjd2QpID0+IHtcbiAgLy8gZXhwbG9kZSBpbnRvIHNlcGFyYXRlXG4gIGRpcmVjdG9yeSA9IGRpcmVjdG9yeS5zcGxpdChwYXRoLnNlcClcblxuICAvLyB3YWxrXG4gIGZvciAobGV0IGRpciBvZiBkaXJlY3RvcnkpIHtcbiAgICBpZiAoZGlyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWJ1ZygnbWtkaXIgJXMnLCBjd2QgKyBwYXRoLnNlcCArIGRpcilcbiAgICAgICAgYXdhaXQgbWtkaXIoY3dkICsgcGF0aC5zZXAgKyBkaXIpXG4gICAgICB9IGNhdGNoIChfKSB7fVxuXG4gICAgICBjd2QgKz0gcGF0aC5zZXAgKyBkaXJcbiAgICB9XG4gIH1cbn0iXX0=