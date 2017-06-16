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
            debug('Saving cache');
            _context3.next = 3;
            return (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));

          case 3:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJsb2NrZmlsZSIsImRlYnVnIiwibG9jayIsInMiLCJjcmVhdGVDYWNoZSIsInJlcXVpcmUiLCJsb2ciLCJsb2FkIiwiZGlyZWN0b3J5IiwiRXJyb3IiLCJKU09OIiwicGFyc2UiLCJ2YWwiLCJrZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInNhdmUiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFrQkE7Ozs7Ozt1REFLQSxpQkFBNEJBLFFBQTVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDRUMsa0JBQU07O0FBRU47QUFGQSxjQURGO0FBQUEsbUJBSVEsbUJBQVVELFFBQVYsRUFBb0I7O0FBRTFCO0FBRk0sYUFKUjs7QUFBQTtBQUFBLDZDQU9VRSxPQUFPO0FBQ2JDLGlCQUFHO0FBRFUsYUFQakI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7a0JBQWVDLFc7Ozs7O0FBWWY7Ozs7Ozs7QUE3QkE7O0FBT0E7Ozs7OzsyY0FiQTs7Ozs7O2VBZXVCQyxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQztJQUFmSixLLFlBQUFBLEs7SUFBT0ssRyxZQUFBQSxHOztBQUNmLElBQUlKLGFBQUosQ0F3Qk8sSUFBTUs7QUFBQSx3REFBTyxrQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFFZE4sSUFGYztBQUFBO0FBQUE7QUFBQTs7QUFBQSw4Q0FFREEsSUFGQzs7QUFBQTtBQUFBLDJCQUtkLE9BQU9NLFNBQVAsS0FBcUIsUUFMUDs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG1CQUswQixnQkFBT0EsU0FBUCxDQUwxQjs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBTVYsSUFBSUMsS0FBSixDQUFVLDhCQUE4QkQsU0FBeEMsQ0FOVTs7QUFBQTs7QUFTbEI7QUFDTVIsb0JBVlksR0FVRVEsU0FWRjs7QUFZbEI7O0FBWmtCO0FBQUEsbUJBYVAsZ0JBQU9SLFFBQVAsQ0FiTzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBY0hJLFlBQVlKLFFBQVosQ0FkRzs7QUFBQTtBQUFBOztBQUFBOztBQWlCbEI7QUFDQUMsa0JBQU0sZUFBTjtBQWxCa0I7QUFBQSwyQkFvQkRTLElBcEJDO0FBQUE7QUFBQSxtQkFvQmdCLGtCQUFTVixRQUFULEVBQW1CLE1BQW5CLENBcEJoQjs7QUFBQTtBQUFBO0FBQUEsOENBb0JSRSxJQXBCUSxnQkFvQklTLEtBcEJKOztBQUFBO0FBQUE7QUFBQTs7QUFzQmhCTCxnQkFBSSw0QkFBSjtBQXRCZ0I7QUFBQSxtQkF1QkhGLFlBQVlKLFFBQVosQ0F2Qkc7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU47O0FBMkJQOzs7OztBQUtPLElBQU1ZLG9CQUFNLFNBQU5BLEdBQU0sQ0FBQ0MsR0FBRCxFQUFNQyxLQUFOLEVBQWdCO0FBQ2pDLE1BQUlBLFVBQVVDLFNBQWQsRUFBeUI7QUFDdkIsV0FBT2IsS0FBS1csR0FBTCxDQUFQO0FBQ0Q7O0FBRURYLE9BQUtXLEdBQUwsSUFBWUMsS0FBWjtBQUNELENBTk07O0FBUVA7Ozs7QUFJTyxJQUFNRTtBQUFBLHdEQUFPLGtCQUFNUixTQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbEJQLGtCQUFNLGNBQU47QUFEa0I7QUFBQSxtQkFFWixtQkFBVU8sWUFBWSxZQUF0QixFQUFvQ0UsS0FBS08sU0FBTCxDQUFlZixJQUFmLENBQXBDLENBRlk7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFOIiwiZmlsZSI6ImNhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvY2FjaGUvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQge1xuICBzdGF0LFxuICBta2RpcixcbiAgZXhpc3RzLFxuICByZWFkRmlsZSxcbiAgd3JpdGVGaWxlLFxufSBmcm9tICcuL2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuY29uc3QgeyBkZWJ1ZywgbG9nIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcbmxldCBsb2NrXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBjYWNoZSAob3ZlcndyaXRlcyBleGlzdGluZykuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9ja2ZpbGUgbG9jYXRpb24gb2YgbG9ja2ZpbGVcbiAqIEByZXR1cm4ge09iamVjdH0gY29udGVudHMgb2YgbmV3IGNhY2hlXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNhY2hlKCBsb2NrZmlsZSApIHtcbiAgZGVidWcoJ0NyZWF0aW5nIGVtcHR5IGNhY2hlJylcblxuICAvLyB3cml0ZSBlbXB0eSBjYWNoZVxuICBhd2FpdCB3cml0ZUZpbGUobG9ja2ZpbGUsICd7XCJzXCI6e319JylcblxuICAvLyByZXR1cm4gdGhlIGVtcHR5IGNhY2hlXG4gIHJldHVybiAobG9jayA9IHtcbiAgICBzOiB7fVxuICB9KVxufVxuXG4vKipcbiAqIExvYWRzIGEgY2FjaGUgZnJvbSB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3RvcnkgcHJvamVjdCBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIGxvYWRlZCBjYWNoZVxuICovXG5leHBvcnQgY29uc3QgbG9hZCA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIC8vIHNlbmQgYmFjayBpbnRlcm5hbCBjYWNoZSBpZiByZWxvYWRpbmdcbiAgaWYgKGxvY2spIHJldHVybiBsb2NrXG5cbiAgLy8gdmVyaWZ5IGRpcmVjdG9yeVxuICBpZiAodHlwZW9mIGRpcmVjdG9yeSAhPT0gJ3N0cmluZycgfHwgIWF3YWl0IGV4aXN0cyhkaXJlY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdG9yeSBnaXZlbjogJyArIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8vIHNldCBjYWNoZSBmaWxlXG4gIGNvbnN0IGxvY2tmaWxlID0gYCR7ZGlyZWN0b3J5fS9ob3BwLmxvY2tgXG5cbiAgLy8gYnJpbmcgY2FjaGUgaW50byBleGlzdGVuY2VcbiAgaWYgKCFhd2FpdCBleGlzdHMobG9ja2ZpbGUpKSB7XG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUNhY2hlKGxvY2tmaWxlKVxuICB9XG5cbiAgLy8gbG9hZCBsb2NrIGZpbGVcbiAgZGVidWcoJ0xvYWRpbmcgY2FjaGUnKVxuICB0cnkge1xuICAgIHJldHVybiAobG9jayA9IEpTT04ucGFyc2UoYXdhaXQgcmVhZEZpbGUobG9ja2ZpbGUsICd1dGY4JykpKVxuICB9IGNhdGNoIChfKSB7XG4gICAgbG9nKCdDb3JydXB0ZWQgY2FjaGU7IGVqZWN0aW5nLicpXG4gICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUNhY2hlKGxvY2tmaWxlKVxuICB9XG59XG5cbi8qKlxuICogQWRkcy9yZXBsYWNlcyBhIHZhbHVlIGluIHRoZSBjYWNoZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7QW55fSB2YWx1ZSBhbnl0aGluZyBzdHJpbmdpZmlhYmxlXG4gKi9cbmV4cG9ydCBjb25zdCB2YWwgPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBsb2NrW2tleV1cbiAgfVxuICBcbiAgbG9ja1trZXldID0gdmFsdWVcbn1cblxuLyoqXG4gKiBTYXZlcyB0aGUgbG9ja2ZpbGUgYWdhaW4uXG4gKiBAcGFyYW0geyp9IGRpcmVjdG9yeSBcbiAqL1xuZXhwb3J0IGNvbnN0IHNhdmUgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICBkZWJ1ZygnU2F2aW5nIGNhY2hlJylcbiAgYXdhaXQgd3JpdGVGaWxlKGRpcmVjdG9yeSArICcvaG9wcC5sb2NrJywgSlNPTi5zdHJpbmdpZnkobG9jaykpXG59Il19