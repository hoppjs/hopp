'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.get = exports.val = exports.load = undefined;

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
            return (0, _fs.writeFile)(lockfile, '{"lmod":0,"stat":{},"files":{}}'

            // return the empty cache
            );

          case 3:
            return _context.abrupt('return', lock = {
              lmod: 0,
              stat: {},
              files: {}
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
 * Fetches a file - cache-first.
 */
var get = exports.get = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(file) {
    var lmod, data;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _fs.stat)(file);

          case 2:
            lmod = +_context3.sent.mtime;

            if (!(lock.stat[file] === lmod)) {
              _context3.next = 6;
              break;
            }

            log('loading %s from cache', _path2.default.basename(file));
            return _context3.abrupt('return', lock.files[file]);

          case 6:
            _context3.next = 8;
            return (0, _fs.readFile)(file, 'utf8'

            // add to cache
            );

          case 8:
            data = _context3.sent;
            lock.stat[file] = lmod;
            lock.files[file] = data;

            // return contents finally
            return _context3.abrupt('return', data);

          case 12:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function get(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Saves the lockfile again.
 * @param {*} directory 
 */
var save = exports.save = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(directory) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));

          case 2:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function save(_x4) {
    return _ref4.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJsb2NrZmlsZSIsImRlYnVnIiwibG9jayIsImxtb2QiLCJzdGF0IiwiZmlsZXMiLCJjcmVhdGVDYWNoZSIsInJlcXVpcmUiLCJsb2ciLCJsb2FkIiwiZGlyZWN0b3J5IiwiRXJyb3IiLCJKU09OIiwicGFyc2UiLCJ2YWwiLCJrZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsImdldCIsImZpbGUiLCJtdGltZSIsImJhc2VuYW1lIiwiZGF0YSIsInNhdmUiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFrQkE7Ozs7Ozt1REFLQSxpQkFBNEJBLFFBQTVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDRUMsa0JBQU07O0FBRU47QUFGQSxjQURGO0FBQUEsbUJBSVEsbUJBQVVELFFBQVYsRUFBb0I7O0FBRTFCO0FBRk0sYUFKUjs7QUFBQTtBQUFBLDZDQU9VRSxPQUFPO0FBQ2JDLG9CQUFNLENBRE87QUFFYkMsb0JBQU0sRUFGTztBQUdiQyxxQkFBTztBQUhNLGFBUGpCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEc7O2tCQUFlQyxXOzs7OztBQWNmOzs7Ozs7O0FBL0JBOztBQU9BOzs7Ozs7MmNBYkE7Ozs7OztlQWV1QkMsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLEM7SUFBZk4sSyxZQUFBQSxLO0lBQU9PLEcsWUFBQUEsRzs7QUFDZixJQUFJTixhQUFKLENBMEJPLElBQU1PO0FBQUEsd0RBQU8sa0JBQU1DLFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBRWRSLElBRmM7QUFBQTtBQUFBO0FBQUE7O0FBQUEsOENBRURBLElBRkM7O0FBQUE7QUFBQSwyQkFLZCxPQUFPUSxTQUFQLEtBQXFCLFFBTFA7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxtQkFLMEIsZ0JBQU9BLFNBQVAsQ0FMMUI7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQU1WLElBQUlDLEtBQUosQ0FBVSw4QkFBOEJELFNBQXhDLENBTlU7O0FBQUE7O0FBU2xCO0FBQ01WLG9CQVZZLEdBVUVVLFNBVkY7O0FBWWxCOztBQVprQjtBQUFBLG1CQWFQLGdCQUFPVixRQUFQLENBYk87O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG1CQWNITSxZQUFZTixRQUFaLENBZEc7O0FBQUE7QUFBQTs7QUFBQTs7QUFpQmxCO0FBQ0FDLGtCQUFNLGVBQU47QUFsQmtCO0FBQUEsMkJBb0JEVyxJQXBCQztBQUFBO0FBQUEsbUJBb0JnQixrQkFBU1osUUFBVCxFQUFtQixNQUFuQixDQXBCaEI7O0FBQUE7QUFBQTtBQUFBLDhDQW9CUkUsSUFwQlEsZ0JBb0JJVyxLQXBCSjs7QUFBQTtBQUFBO0FBQUE7O0FBc0JoQkwsZ0JBQUksNEJBQUo7QUF0QmdCO0FBQUEsbUJBdUJIRixZQUFZTixRQUFaLENBdkJHOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFOOztBQTJCUDs7Ozs7QUFLTyxJQUFNYyxvQkFBTSxTQUFOQSxHQUFNLENBQUNDLEdBQUQsRUFBTUMsS0FBTixFQUFnQjtBQUNqQyxNQUFJQSxVQUFVQyxTQUFkLEVBQXlCO0FBQ3ZCLFdBQU9mLEtBQUthLEdBQUwsQ0FBUDtBQUNEOztBQUVEYixPQUFLYSxHQUFMLElBQVlDLEtBQVo7QUFDRCxDQU5NOztBQVFQOzs7QUFHTyxJQUFNRTtBQUFBLHdEQUFNLGtCQUFNQyxJQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQ0ksY0FBS0EsSUFBTCxDQURKOztBQUFBO0FBQ1hoQixnQkFEVyxtQkFDZ0JpQixLQURoQjs7QUFBQSxrQkFJYmxCLEtBQUtFLElBQUwsQ0FBVWUsSUFBVixNQUFvQmhCLElBSlA7QUFBQTtBQUFBO0FBQUE7O0FBS2ZLLGdCQUFJLHVCQUFKLEVBQTZCLGVBQUthLFFBQUwsQ0FBY0YsSUFBZCxDQUE3QjtBQUxlLDhDQU1SakIsS0FBS0csS0FBTCxDQUFXYyxJQUFYLENBTlE7O0FBQUE7QUFBQTtBQUFBLG1CQVVFLGtCQUFTQSxJQUFULEVBQWU7O0FBRWxDO0FBRm1CLGFBVkY7O0FBQUE7QUFVWEcsZ0JBVlc7QUFhakJwQixpQkFBS0UsSUFBTCxDQUFVZSxJQUFWLElBQWtCaEIsSUFBbEI7QUFDQUQsaUJBQUtHLEtBQUwsQ0FBV2MsSUFBWCxJQUFtQkcsSUFBbkI7O0FBRUE7QUFoQmlCLDhDQWlCVkEsSUFqQlU7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBTjs7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFOOztBQW9CUDs7OztBQUlPLElBQU1DO0FBQUEsd0RBQU8sa0JBQU1iLFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQ1osbUJBQVVBLFlBQVksWUFBdEIsRUFBb0NFLEtBQUtZLFNBQUwsQ0FBZXRCLElBQWYsQ0FBcEMsQ0FEWTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU4iLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9jYWNoZS9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7XG4gIHN0YXQsXG4gIG1rZGlyLFxuICBleGlzdHMsXG4gIHJlYWRGaWxlLFxuICB3cml0ZUZpbGUsXG59IGZyb20gJy4vZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCB7IGRlYnVnLCBsb2cgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxubGV0IGxvY2tcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGNhY2hlIChvdmVyd3JpdGVzIGV4aXN0aW5nKS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NrZmlsZSBsb2NhdGlvbiBvZiBsb2NrZmlsZVxuICogQHJldHVybiB7T2JqZWN0fSBjb250ZW50cyBvZiBuZXcgY2FjaGVcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQ2FjaGUoIGxvY2tmaWxlICkge1xuICBkZWJ1ZygnQ3JlYXRpbmcgZW1wdHkgY2FjaGUnKVxuXG4gIC8vIHdyaXRlIGVtcHR5IGNhY2hlXG4gIGF3YWl0IHdyaXRlRmlsZShsb2NrZmlsZSwgJ3tcImxtb2RcIjowLFwic3RhdFwiOnt9LFwiZmlsZXNcIjp7fX0nKVxuXG4gIC8vIHJldHVybiB0aGUgZW1wdHkgY2FjaGVcbiAgcmV0dXJuIChsb2NrID0ge1xuICAgIGxtb2Q6IDAsXG4gICAgc3RhdDoge30sXG4gICAgZmlsZXM6IHt9XG4gIH0pXG59XG5cbi8qKlxuICogTG9hZHMgYSBjYWNoZSBmcm9tIHRoZSBwcm9qZWN0LlxuICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdG9yeSBwcm9qZWN0IGRpcmVjdG9yeVxuICogQHJldHVybiB7T2JqZWN0fSB0aGUgbG9hZGVkIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgLy8gc2VuZCBiYWNrIGludGVybmFsIGNhY2hlIGlmIHJlbG9hZGluZ1xuICBpZiAobG9jaykgcmV0dXJuIGxvY2tcblxuICAvLyB2ZXJpZnkgZGlyZWN0b3J5XG4gIGlmICh0eXBlb2YgZGlyZWN0b3J5ICE9PSAnc3RyaW5nJyB8fCAhYXdhaXQgZXhpc3RzKGRpcmVjdG9yeSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGlyZWN0b3J5IGdpdmVuOiAnICsgZGlyZWN0b3J5KVxuICB9XG5cbiAgLy8gc2V0IGNhY2hlIGZpbGVcbiAgY29uc3QgbG9ja2ZpbGUgPSBgJHtkaXJlY3Rvcnl9L2hvcHAubG9ja2BcblxuICAvLyBicmluZyBjYWNoZSBpbnRvIGV4aXN0ZW5jZVxuICBpZiAoIWF3YWl0IGV4aXN0cyhsb2NrZmlsZSkpIHtcbiAgICByZXR1cm4gYXdhaXQgY3JlYXRlQ2FjaGUobG9ja2ZpbGUpXG4gIH1cblxuICAvLyBsb2FkIGxvY2sgZmlsZVxuICBkZWJ1ZygnTG9hZGluZyBjYWNoZScpXG4gIHRyeSB7XG4gICAgcmV0dXJuIChsb2NrID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShsb2NrZmlsZSwgJ3V0ZjgnKSkpXG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBsb2coJ0NvcnJ1cHRlZCBjYWNoZTsgZWplY3RpbmcuJylcbiAgICByZXR1cm4gYXdhaXQgY3JlYXRlQ2FjaGUobG9ja2ZpbGUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzL3JlcGxhY2VzIGEgdmFsdWUgaW4gdGhlIGNhY2hlLlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtBbnl9IHZhbHVlIGFueXRoaW5nIHN0cmluZ2lmaWFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbCA9IChrZXksIHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGxvY2tba2V5XVxuICB9XG4gIFxuICBsb2NrW2tleV0gPSB2YWx1ZVxufVxuXG4vKipcbiAqIEZldGNoZXMgYSBmaWxlIC0gY2FjaGUtZmlyc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXQgPSBhc3luYyBmaWxlID0+IHtcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcbiAgXG4gIC8vIHRyeSBsb2FkaW5nIGZyb20gY2FjaGVcbiAgaWYgKGxvY2suc3RhdFtmaWxlXSA9PT0gbG1vZCkge1xuICAgIGxvZygnbG9hZGluZyAlcyBmcm9tIGNhY2hlJywgcGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICByZXR1cm4gbG9jay5maWxlc1tmaWxlXVxuICB9XG5cbiAgLy8gbG9hZCBmaWxlIG9mZiBmc1xuICBjb25zdCBkYXRhID0gYXdhaXQgcmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKVxuXG4gIC8vIGFkZCB0byBjYWNoZVxuICBsb2NrLnN0YXRbZmlsZV0gPSBsbW9kXG4gIGxvY2suZmlsZXNbZmlsZV0gPSBkYXRhXG5cbiAgLy8gcmV0dXJuIGNvbnRlbnRzIGZpbmFsbHlcbiAgcmV0dXJuIGRhdGFcbn1cblxuLyoqXG4gKiBTYXZlcyB0aGUgbG9ja2ZpbGUgYWdhaW4uXG4gKiBAcGFyYW0geyp9IGRpcmVjdG9yeSBcbiAqL1xuZXhwb3J0IGNvbnN0IHNhdmUgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICBhd2FpdCB3cml0ZUZpbGUoZGlyZWN0b3J5ICsgJy9ob3BwLmxvY2snLCBKU09OLnN0cmluZ2lmeShsb2NrKSlcbn0iXX0=