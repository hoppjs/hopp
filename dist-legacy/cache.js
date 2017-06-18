'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.val = exports.load = undefined;

var _fs = require('./fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/cache/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('./utils/log')('hopp'),
    debug = _require.debug,
    log = _require.log;

var lock = void 0;

/**
 * Loads a cache from the project.
 * @param {String} directory project directory
 * @return {Object} the loaded cache
 */
var load = exports.load = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    var lockfile;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!lock) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', lock);

          case 2:
            _context.t0 = typeof directory !== 'string';

            if (_context.t0) {
              _context.next = 7;
              break;
            }

            _context.next = 6;
            return (0, _fs.exists)(directory);

          case 6:
            _context.t0 = !_context.sent;

          case 7:
            if (!_context.t0) {
              _context.next = 9;
              break;
            }

            throw new Error('Invalid directory given: ' + directory);

          case 9:

            // set cache file
            lockfile = directory + '/hopp.lock';

            // bring cache into existence

            _context.next = 12;
            return (0, _fs.exists)(lockfile);

          case 12:
            if (_context.sent) {
              _context.next = 14;
              break;
            }

            return _context.abrupt('return', lock = {});

          case 14:

            // load lock file
            debug('Loading cache');
            _context.prev = 15;
            _context.t1 = JSON;
            _context.next = 19;
            return (0, _fs.readFile)(lockfile, 'utf8');

          case 19:
            _context.t2 = _context.sent;
            return _context.abrupt('return', lock = _context.t1.parse.call(_context.t1, _context.t2));

          case 23:
            _context.prev = 23;
            _context.t3 = _context['catch'](15);

            log('Corrupted cache; ejecting.');
            return _context.abrupt('return', lock = {});

          case 27:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[15, 23]]);
  }));

  return function load(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Adds/replaces a value in the cache.
 * @param {String} key
 * @param {Any} value anything stringifiable
 */
var val = exports.val = function val(key, value) {
  if (value === undefined) {
    return lock[key];
  }

  lock[key] = value;
};

/**
 * Saves the lockfile again.
 * @param {*} directory 
 */
var save = exports.save = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(directory) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            debug('Saving cache');
            _context2.next = 3;
            return (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));

          case 3:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function save(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVidWciLCJsb2ciLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJKU09OIiwicGFyc2UiLCJ2YWwiLCJrZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInNhdmUiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7QUFPQTs7Ozs7OzJjQWJBOzs7Ozs7ZUFldUJBLFFBQVEsYUFBUixFQUF1QixNQUF2QixDO0lBQWZDLEssWUFBQUEsSztJQUFPQyxHLFlBQUFBLEc7O0FBQ2YsSUFBSUMsYUFBSjs7QUFFQTs7Ozs7QUFLTyxJQUFNQztBQUFBLHVEQUFPLGlCQUFNQyxTQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUVkRixJQUZjO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQUVEQSxJQUZDOztBQUFBO0FBQUEsMEJBS2QsT0FBT0UsU0FBUCxLQUFxQixRQUxQOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBSzBCLGdCQUFPQSxTQUFQLENBTDFCOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkFNVixJQUFJQyxLQUFKLENBQVUsOEJBQThCRCxTQUF4QyxDQU5VOztBQUFBOztBQVNsQjtBQUNNRSxvQkFWWSxHQVVFRixTQVZGOztBQVlsQjs7QUFaa0I7QUFBQSxtQkFhUCxnQkFBT0UsUUFBUCxDQWJPOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsNkNBY1JKLE9BQU8sRUFkQzs7QUFBQTs7QUFpQmxCO0FBQ0FGLGtCQUFNLGVBQU47QUFsQmtCO0FBQUEsMEJBb0JETyxJQXBCQztBQUFBO0FBQUEsbUJBb0JnQixrQkFBU0QsUUFBVCxFQUFtQixNQUFuQixDQXBCaEI7O0FBQUE7QUFBQTtBQUFBLDZDQW9CUkosSUFwQlEsZUFvQklNLEtBcEJKOztBQUFBO0FBQUE7QUFBQTs7QUFzQmhCUCxnQkFBSSw0QkFBSjtBQXRCZ0IsNkNBdUJSQyxPQUFPLEVBdkJDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQVA7O0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBTjs7QUEyQlA7Ozs7O0FBS08sSUFBTU8sb0JBQU0sU0FBTkEsR0FBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sRUFBZ0I7QUFDakMsTUFBSUEsVUFBVUMsU0FBZCxFQUF5QjtBQUN2QixXQUFPVixLQUFLUSxHQUFMLENBQVA7QUFDRDs7QUFFRFIsT0FBS1EsR0FBTCxJQUFZQyxLQUFaO0FBQ0QsQ0FOTTs7QUFRUDs7OztBQUlPLElBQU1FO0FBQUEsd0RBQU8sa0JBQU1ULFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNsQkosa0JBQU0sY0FBTjtBQURrQjtBQUFBLG1CQUVaLG1CQUFVSSxZQUFZLFlBQXRCLEVBQW9DRyxLQUFLTyxTQUFMLENBQWVaLElBQWYsQ0FBcEMsQ0FGWTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU4iLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9jYWNoZS9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7XG4gIHN0YXQsXG4gIG1rZGlyLFxuICBleGlzdHMsXG4gIHJlYWRGaWxlLFxuICB3cml0ZUZpbGUsXG59IGZyb20gJy4vZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCB7IGRlYnVnLCBsb2cgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxubGV0IGxvY2tcblxuLyoqXG4gKiBMb2FkcyBhIGNhY2hlIGZyb20gdGhlIHByb2plY3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0b3J5IHByb2plY3QgZGlyZWN0b3J5XG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBsb2FkZWQgY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWQgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICAvLyBzZW5kIGJhY2sgaW50ZXJuYWwgY2FjaGUgaWYgcmVsb2FkaW5nXG4gIGlmIChsb2NrKSByZXR1cm4gbG9ja1xuXG4gIC8vIHZlcmlmeSBkaXJlY3RvcnlcbiAgaWYgKHR5cGVvZiBkaXJlY3RvcnkgIT09ICdzdHJpbmcnIHx8ICFhd2FpdCBleGlzdHMoZGlyZWN0b3J5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkaXJlY3RvcnkgZ2l2ZW46ICcgKyBkaXJlY3RvcnkpXG4gIH1cblxuICAvLyBzZXQgY2FjaGUgZmlsZVxuICBjb25zdCBsb2NrZmlsZSA9IGAke2RpcmVjdG9yeX0vaG9wcC5sb2NrYFxuXG4gIC8vIGJyaW5nIGNhY2hlIGludG8gZXhpc3RlbmNlXG4gIGlmICghYXdhaXQgZXhpc3RzKGxvY2tmaWxlKSkge1xuICAgIHJldHVybiAobG9jayA9IHt9KVxuICB9XG5cbiAgLy8gbG9hZCBsb2NrIGZpbGVcbiAgZGVidWcoJ0xvYWRpbmcgY2FjaGUnKVxuICB0cnkge1xuICAgIHJldHVybiAobG9jayA9IEpTT04ucGFyc2UoYXdhaXQgcmVhZEZpbGUobG9ja2ZpbGUsICd1dGY4JykpKVxuICB9IGNhdGNoIChfKSB7XG4gICAgbG9nKCdDb3JydXB0ZWQgY2FjaGU7IGVqZWN0aW5nLicpXG4gICAgcmV0dXJuIChsb2NrID0ge30pXG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzL3JlcGxhY2VzIGEgdmFsdWUgaW4gdGhlIGNhY2hlLlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtBbnl9IHZhbHVlIGFueXRoaW5nIHN0cmluZ2lmaWFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbCA9IChrZXksIHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGxvY2tba2V5XVxuICB9XG4gIFxuICBsb2NrW2tleV0gPSB2YWx1ZVxufVxuXG4vKipcbiAqIFNhdmVzIHRoZSBsb2NrZmlsZSBhZ2Fpbi5cbiAqIEBwYXJhbSB7Kn0gZGlyZWN0b3J5IFxuICovXG5leHBvcnQgY29uc3Qgc2F2ZSA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIGRlYnVnKCdTYXZpbmcgY2FjaGUnKVxuICBhd2FpdCB3cml0ZUZpbGUoZGlyZWN0b3J5ICsgJy9ob3BwLmxvY2snLCBKU09OLnN0cmluZ2lmeShsb2NrKSlcbn0iXX0=