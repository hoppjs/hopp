'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.val = exports.load = undefined;

/**
 * Creates a new cache (overwrites existing).
 * @param {String} lockfile location of lockfile
 * @return {Object} contents of new cache
 */
var createCache = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(lockfile) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            debug('Creating empty cache'

            // write empty cache
            );_context.next = 3;
            return (0, _fs.writeFile)(lockfile, '{"s":{}}'

            // return the empty cache
            );

          case 3:
            return _context.abrupt('return', lock = {
              s: {}
            });

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function createCache(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Loads a cache from the project.
 * @param {String} directory project directory
 * @return {Object} the loaded cache
 */


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

var lock = void 0;var load = exports.load = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(directory) {
    var lockfile;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!lock) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return', lock);

          case 2:
            _context2.t0 = typeof directory !== 'string';

            if (_context2.t0) {
              _context2.next = 7;
              break;
            }

            _context2.next = 6;
            return (0, _fs.exists)(directory);

          case 6:
            _context2.t0 = !_context2.sent;

          case 7:
            if (!_context2.t0) {
              _context2.next = 9;
              break;
            }

            throw new Error('Invalid directory given: ' + directory);

          case 9:

            // set cache file
            lockfile = directory + '/hopp.lock';

            // bring cache into existence

            _context2.next = 12;
            return (0, _fs.exists)(lockfile);

          case 12:
            if (_context2.sent) {
              _context2.next = 16;
              break;
            }

            _context2.next = 15;
            return createCache(lockfile);

          case 15:
            return _context2.abrupt('return', _context2.sent);

          case 16:

            // load lock file
            debug('Loading cache');
            _context2.prev = 17;
            _context2.t1 = JSON;
            _context2.next = 21;
            return (0, _fs.readFile)(lockfile, 'utf8');

          case 21:
            _context2.t2 = _context2.sent;
            return _context2.abrupt('return', lock = _context2.t1.parse.call(_context2.t1, _context2.t2));

          case 25:
            _context2.prev = 25;
            _context2.t3 = _context2['catch'](17);

            log('Corrupted cache; ejecting.');
            _context2.next = 30;
            return createCache(lockfile);

          case 30:
            return _context2.abrupt('return', _context2.sent);

          case 31:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[17, 25]]);
  }));

  return function load(_x2) {
    return _ref2.apply(this, arguments);
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
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(directory) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function save(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJsb2NrZmlsZSIsImRlYnVnIiwibG9jayIsInMiLCJjcmVhdGVDYWNoZSIsInJlcXVpcmUiLCJsb2ciLCJsb2FkIiwiZGlyZWN0b3J5IiwiRXJyb3IiLCJKU09OIiwicGFyc2UiLCJ2YWwiLCJrZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInNhdmUiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFrQkE7Ozs7Ozt1REFLQSxpQkFBNEJBLFFBQTVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDRUMsa0JBQU07O0FBRU47QUFGQSxjQURGO0FBQUEsbUJBSVEsbUJBQVVELFFBQVYsRUFBb0I7O0FBRTFCO0FBRk0sYUFKUjs7QUFBQTtBQUFBLDZDQU9VRSxPQUFPO0FBQ2JDLGlCQUFHO0FBRFUsYUFQakI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7a0JBQWVDLFc7Ozs7O0FBWWY7Ozs7Ozs7QUE3QkE7O0FBT0E7Ozs7OzsyY0FiQTs7Ozs7O2VBZXVCQyxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQztJQUFmSixLLFlBQUFBLEs7SUFBT0ssRyxZQUFBQSxHOztBQUNmLElBQUlKLGFBQUosQ0F3Qk8sSUFBTUs7QUFBQSx3REFBTyxrQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFFZE4sSUFGYztBQUFBO0FBQUE7QUFBQTs7QUFBQSw4Q0FFREEsSUFGQzs7QUFBQTtBQUFBLDJCQUtkLE9BQU9NLFNBQVAsS0FBcUIsUUFMUDs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG1CQUswQixnQkFBT0EsU0FBUCxDQUwxQjs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBTVYsSUFBSUMsS0FBSixDQUFVLDhCQUE4QkQsU0FBeEMsQ0FOVTs7QUFBQTs7QUFTbEI7QUFDTVIsb0JBVlksR0FVRVEsU0FWRjs7QUFZbEI7O0FBWmtCO0FBQUEsbUJBYVAsZ0JBQU9SLFFBQVAsQ0FiTzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBY0hJLFlBQVlKLFFBQVosQ0FkRzs7QUFBQTtBQUFBOztBQUFBOztBQWlCbEI7QUFDQUMsa0JBQU0sZUFBTjtBQWxCa0I7QUFBQSwyQkFvQkRTLElBcEJDO0FBQUE7QUFBQSxtQkFvQmdCLGtCQUFTVixRQUFULEVBQW1CLE1BQW5CLENBcEJoQjs7QUFBQTtBQUFBO0FBQUEsOENBb0JSRSxJQXBCUSxnQkFvQklTLEtBcEJKOztBQUFBO0FBQUE7QUFBQTs7QUFzQmhCTCxnQkFBSSw0QkFBSjtBQXRCZ0I7QUFBQSxtQkF1QkhGLFlBQVlKLFFBQVosQ0F2Qkc7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU47O0FBMkJQOzs7OztBQUtPLElBQU1ZLG9CQUFNLFNBQU5BLEdBQU0sQ0FBQ0MsR0FBRCxFQUFNQyxLQUFOLEVBQWdCO0FBQ2pDLE1BQUlBLFVBQVVDLFNBQWQsRUFBeUI7QUFDdkIsV0FBT2IsS0FBS1csR0FBTCxDQUFQO0FBQ0Q7O0FBRURYLE9BQUtXLEdBQUwsSUFBWUMsS0FBWjtBQUNELENBTk07O0FBUVA7Ozs7QUFJTyxJQUFNRTtBQUFBLHdEQUFPLGtCQUFNUixTQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUNaLG1CQUFVQSxZQUFZLFlBQXRCLEVBQW9DRSxLQUFLTyxTQUFMLENBQWVmLElBQWYsQ0FBcEMsQ0FEWTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU4iLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9jYWNoZS9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7XG4gIHN0YXQsXG4gIG1rZGlyLFxuICBleGlzdHMsXG4gIHJlYWRGaWxlLFxuICB3cml0ZUZpbGUsXG59IGZyb20gJy4vZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCB7IGRlYnVnLCBsb2cgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxubGV0IGxvY2tcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGNhY2hlIChvdmVyd3JpdGVzIGV4aXN0aW5nKS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NrZmlsZSBsb2NhdGlvbiBvZiBsb2NrZmlsZVxuICogQHJldHVybiB7T2JqZWN0fSBjb250ZW50cyBvZiBuZXcgY2FjaGVcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQ2FjaGUoIGxvY2tmaWxlICkge1xuICBkZWJ1ZygnQ3JlYXRpbmcgZW1wdHkgY2FjaGUnKVxuXG4gIC8vIHdyaXRlIGVtcHR5IGNhY2hlXG4gIGF3YWl0IHdyaXRlRmlsZShsb2NrZmlsZSwgJ3tcInNcIjp7fX0nKVxuXG4gIC8vIHJldHVybiB0aGUgZW1wdHkgY2FjaGVcbiAgcmV0dXJuIChsb2NrID0ge1xuICAgIHM6IHt9XG4gIH0pXG59XG5cbi8qKlxuICogTG9hZHMgYSBjYWNoZSBmcm9tIHRoZSBwcm9qZWN0LlxuICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdG9yeSBwcm9qZWN0IGRpcmVjdG9yeVxuICogQHJldHVybiB7T2JqZWN0fSB0aGUgbG9hZGVkIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgLy8gc2VuZCBiYWNrIGludGVybmFsIGNhY2hlIGlmIHJlbG9hZGluZ1xuICBpZiAobG9jaykgcmV0dXJuIGxvY2tcblxuICAvLyB2ZXJpZnkgZGlyZWN0b3J5XG4gIGlmICh0eXBlb2YgZGlyZWN0b3J5ICE9PSAnc3RyaW5nJyB8fCAhYXdhaXQgZXhpc3RzKGRpcmVjdG9yeSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGlyZWN0b3J5IGdpdmVuOiAnICsgZGlyZWN0b3J5KVxuICB9XG5cbiAgLy8gc2V0IGNhY2hlIGZpbGVcbiAgY29uc3QgbG9ja2ZpbGUgPSBgJHtkaXJlY3Rvcnl9L2hvcHAubG9ja2BcblxuICAvLyBicmluZyBjYWNoZSBpbnRvIGV4aXN0ZW5jZVxuICBpZiAoIWF3YWl0IGV4aXN0cyhsb2NrZmlsZSkpIHtcbiAgICByZXR1cm4gYXdhaXQgY3JlYXRlQ2FjaGUobG9ja2ZpbGUpXG4gIH1cblxuICAvLyBsb2FkIGxvY2sgZmlsZVxuICBkZWJ1ZygnTG9hZGluZyBjYWNoZScpXG4gIHRyeSB7XG4gICAgcmV0dXJuIChsb2NrID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShsb2NrZmlsZSwgJ3V0ZjgnKSkpXG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBsb2coJ0NvcnJ1cHRlZCBjYWNoZTsgZWplY3RpbmcuJylcbiAgICByZXR1cm4gYXdhaXQgY3JlYXRlQ2FjaGUobG9ja2ZpbGUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzL3JlcGxhY2VzIGEgdmFsdWUgaW4gdGhlIGNhY2hlLlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtBbnl9IHZhbHVlIGFueXRoaW5nIHN0cmluZ2lmaWFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbCA9IChrZXksIHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGxvY2tba2V5XVxuICB9XG4gIFxuICBsb2NrW2tleV0gPSB2YWx1ZVxufVxuXG4vKipcbiAqIFNhdmVzIHRoZSBsb2NrZmlsZSBhZ2Fpbi5cbiAqIEBwYXJhbSB7Kn0gZGlyZWN0b3J5IFxuICovXG5leHBvcnQgY29uc3Qgc2F2ZSA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIGF3YWl0IHdyaXRlRmlsZShkaXJlY3RvcnkgKyAnL2hvcHAubG9jaycsIEpTT04uc3RyaW5naWZ5KGxvY2spKVxufSJdfQ==