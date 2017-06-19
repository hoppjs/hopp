'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('../utils/log')('hopp'),
    debug = _require.debug;

/**
 * Looks for hoppfile.js in {directory} and its parents.
 * @param {String} directory
 * @returns {String} the directory in which the file exists
 * @throws {Error} if file was not found
 */


exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    var files;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _fs.readdir)(directory);

          case 2:
            _context.t0 = function (f) {
              return f === 'hoppfile.js';
            };

            files = _context.sent.filter(_context.t0);


            debug('found %s hoppfiles in %s', files.length, directory);

            if (!(files.length === 0 && directory === '/')) {
              _context.next = 7;
              break;
            }

            throw new Error('Failed to find hoppfile.js');

          case 7:
            if (!(files.length === 1)) {
              _context.next = 11;
              break;
            }

            _context.t1 = directory;
            _context.next = 14;
            break;

          case 11:
            _context.next = 13;
            return find(_path2.default.dirname(directory));

          case 13:
            _context.t1 = _context.sent;

          case 14:
            return _context.abrupt('return', _context.t1);

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function find(_x) {
    return _ref.apply(this, arguments);
  }

  return find;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9maW5kLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJkZWJ1ZyIsImRpcmVjdG9yeSIsImYiLCJmaWxlcyIsImZpbHRlciIsImxlbmd0aCIsIkVycm9yIiwiZmluZCIsImRpcm5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7MmNBUEE7Ozs7OztlQVNrQkEsUUFBUSxjQUFSLEVBQXdCLE1BQXhCLEM7SUFBVkMsSyxZQUFBQSxLOztBQUVSOzs7Ozs7Ozs7dURBTWUsaUJBQXFCQyxTQUFyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUNRLGlCQUFRQSxTQUFSLENBRFI7O0FBQUE7QUFBQSwwQkFDbUM7QUFBQSxxQkFBS0MsTUFBTSxhQUFYO0FBQUEsYUFEbkM7O0FBQ1BDLGlCQURPLGlCQUM0QkMsTUFENUI7OztBQUdiSixrQkFBTSwwQkFBTixFQUFrQ0csTUFBTUUsTUFBeEMsRUFBZ0RKLFNBQWhEOztBQUhhLGtCQUtURSxNQUFNRSxNQUFOLEtBQWlCLENBQWpCLElBQXNCSixjQUFjLEdBTDNCO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQU1MLElBQUlLLEtBQUosQ0FBVSw0QkFBVixDQU5LOztBQUFBO0FBQUEsa0JBU05ILE1BQU1FLE1BQU4sS0FBaUIsQ0FUWDtBQUFBO0FBQUE7QUFBQTs7QUFBQSwwQkFTZUosU0FUZjtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG1CQVNpQ00sS0FBSyxlQUFLQyxPQUFMLENBQWFQLFNBQWIsQ0FBTCxDQVRqQzs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7V0FBZU0sSTs7OztTQUFBQSxJIiwiZmlsZSI6ImZpbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyByZWFkZGlyIH0gZnJvbSAnLi4vZnMnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4uL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBMb29rcyBmb3IgaG9wcGZpbGUuanMgaW4ge2RpcmVjdG9yeX0gYW5kIGl0cyBwYXJlbnRzLlxuICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdG9yeVxuICogQHJldHVybnMge1N0cmluZ30gdGhlIGRpcmVjdG9yeSBpbiB3aGljaCB0aGUgZmlsZSBleGlzdHNcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBmaWxlIHdhcyBub3QgZm91bmRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gZmluZCggZGlyZWN0b3J5ICkge1xuICBjb25zdCBmaWxlcyA9IChhd2FpdCByZWFkZGlyKGRpcmVjdG9yeSkpLmZpbHRlcihmID0+IGYgPT09ICdob3BwZmlsZS5qcycpXG5cbiAgZGVidWcoJ2ZvdW5kICVzIGhvcHBmaWxlcyBpbiAlcycsIGZpbGVzLmxlbmd0aCwgZGlyZWN0b3J5KVxuXG4gIGlmIChmaWxlcy5sZW5ndGggPT09IDAgJiYgZGlyZWN0b3J5ID09PSAnLycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmaW5kIGhvcHBmaWxlLmpzJylcbiAgfVxuXG4gIHJldHVybiBmaWxlcy5sZW5ndGggPT09IDEgPyBkaXJlY3RvcnkgOiBhd2FpdCBmaW5kKHBhdGguZGlybmFtZShkaXJlY3RvcnkpKVxufSJdfQ==