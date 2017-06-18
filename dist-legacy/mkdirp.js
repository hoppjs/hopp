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

var exists = {};

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
              _context.next = 24;
              break;
            }

            dir = _step.value;

            if (!(dir && !exists[cwd + _path2.default.sep + dir])) {
              _context.next = 20;
              break;
            }

            _context.prev = 9;

            debug('mkdir %s', cwd + _path2.default.sep + dir);
            _context.next = 13;
            return (0, _fs.mkdir)(cwd + _path2.default.sep + dir);

          case 13:
            _context.next = 19;
            break;

          case 15:
            _context.prev = 15;
            _context.t0 = _context['catch'](9);

            if (!(String(_context.t0).indexOf('EEXIST') === -1)) {
              _context.next = 19;
              break;
            }

            throw _context.t0;

          case 19:

            exists[cwd + _path2.default.sep + dir] = true;

          case 20:

            cwd += _path2.default.sep + dir;

          case 21:
            _iteratorNormalCompletion = true;
            _context.next = 6;
            break;

          case 24:
            _context.next = 30;
            break;

          case 26:
            _context.prev = 26;
            _context.t1 = _context['catch'](4);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 30:
            _context.prev = 30;
            _context.prev = 31;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 33:
            _context.prev = 33;

            if (!_didIteratorError) {
              _context.next = 36;
              break;
            }

            throw _iteratorError;

          case 36:
            return _context.finish(33);

          case 37:
            return _context.finish(30);

          case 38:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[4, 26, 30, 38], [9, 15], [31,, 33, 37]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ta2RpcnAuanMiXSwibmFtZXMiOlsicmVxdWlyZSIsImRlYnVnIiwiZXhpc3RzIiwiZGlyZWN0b3J5IiwiY3dkIiwic3BsaXQiLCJzZXAiLCJkaXIiLCJTdHJpbmciLCJpbmRleE9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7OzJjQVBBOzs7Ozs7ZUFTa0JBLFFBQVEsYUFBUixFQUF1QixNQUF2QixDO0lBQVZDLEssWUFBQUEsSzs7QUFDUixJQUFNQyxTQUFTLEVBQWY7Ozt1REFFZSxpQkFBT0MsU0FBUCxFQUFrQkMsR0FBbEI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNiO0FBQ0FELHdCQUFZQSxVQUFVRSxLQUFWLENBQWdCLGVBQUtDOztBQUVqQztBQUZZLGFBQVosQ0FGYTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUtHSCxTQUxIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS0pJLGVBTEk7O0FBQUEsa0JBTVBBLE9BQU8sQ0FBQ0wsT0FBT0UsTUFBTSxlQUFLRSxHQUFYLEdBQWlCQyxHQUF4QixDQU5EO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQVFQTixrQkFBTSxVQUFOLEVBQWtCRyxNQUFNLGVBQUtFLEdBQVgsR0FBaUJDLEdBQW5DO0FBUk87QUFBQSxtQkFTRCxlQUFNSCxNQUFNLGVBQUtFLEdBQVgsR0FBaUJDLEdBQXZCLENBVEM7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkFXSEMsb0JBQVlDLE9BQVosQ0FBb0IsUUFBcEIsTUFBa0MsQ0FBQyxDQVhoQztBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTs7QUFnQlRQLG1CQUFPRSxNQUFNLGVBQUtFLEdBQVgsR0FBaUJDLEdBQXhCLElBQStCLElBQS9COztBQWhCUzs7QUFtQlhILG1CQUFPLGVBQUtFLEdBQUwsR0FBV0MsR0FBbEI7O0FBbkJXO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsImZpbGUiOiJta2RpcnAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9ta2RpcnAuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IG1rZGlyIH0gZnJvbSAnLi9mcydcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5jb25zdCBleGlzdHMgPSB7fVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoZGlyZWN0b3J5LCBjd2QpID0+IHtcbiAgLy8gZXhwbG9kZSBpbnRvIHNlcGFyYXRlXG4gIGRpcmVjdG9yeSA9IGRpcmVjdG9yeS5zcGxpdChwYXRoLnNlcClcblxuICAvLyB3YWxrXG4gIGZvciAobGV0IGRpciBvZiBkaXJlY3RvcnkpIHtcbiAgICBpZiAoZGlyICYmICFleGlzdHNbY3dkICsgcGF0aC5zZXAgKyBkaXJdKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWJ1ZygnbWtkaXIgJXMnLCBjd2QgKyBwYXRoLnNlcCArIGRpcilcbiAgICAgICAgYXdhaXQgbWtkaXIoY3dkICsgcGF0aC5zZXAgKyBkaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKFN0cmluZyhlcnIpLmluZGV4T2YoJ0VFWElTVCcpID09PSAtMSkge1xuICAgICAgICAgIHRocm93IGVyclxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGV4aXN0c1tjd2QgKyBwYXRoLnNlcCArIGRpcl0gPSB0cnVlXG4gICAgfVxuXG4gICAgY3dkICs9IHBhdGguc2VwICsgZGlyXG4gIH1cbn0iXX0=