'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.val = exports.load = undefined;

var _fs = require('./fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/cache/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
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
 * @returns {Any?} value from cache
 */
var val = exports.val = function val(key, value) {
  if (value === undefined) {
    return lock[key];
  }

  lock[key] = value;
};

/**
 * Get/set a sourcemap.
 * @param {String} taskName name of the task
 * @param {Object} sm sourcemap to save for the task
 * @returns {Object} sourcemap from cache
 */
var sourcemap = exports.sourcemap = function sourcemap(taskName, sm) {
  var sourcemap = val('sm');

  if (!sourcemap) {
    val('sm', sourcemap = {});
  }

  if (sm) {
    sourcemap[taskName] = sm;
  } else {
    sourcemap[taskName] = sourcemap[taskName] || {};
  }

  return sourcemap;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVidWciLCJsb2ciLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJKU09OIiwicGFyc2UiLCJ2YWwiLCJrZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInNvdXJjZW1hcCIsInRhc2tOYW1lIiwic20iLCJzYXZlIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBT0E7Ozs7OzsyY0FiQTs7Ozs7O2VBZXVCQSxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQztJQUFmQyxLLFlBQUFBLEs7SUFBT0MsRyxZQUFBQSxHOztBQUNmLElBQUlDLGFBQUo7O0FBRUE7Ozs7O0FBS08sSUFBTUM7QUFBQSx1REFBTyxpQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFFZEYsSUFGYztBQUFBO0FBQUE7QUFBQTs7QUFBQSw2Q0FFREEsSUFGQzs7QUFBQTtBQUFBLDBCQUtkLE9BQU9FLFNBQVAsS0FBcUIsUUFMUDs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG1CQUswQixnQkFBT0EsU0FBUCxDQUwxQjs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBTVYsSUFBSUMsS0FBSixDQUFVLDhCQUE4QkQsU0FBeEMsQ0FOVTs7QUFBQTs7QUFTbEI7QUFDTUUsb0JBVlksR0FVRUYsU0FWRjs7QUFZbEI7O0FBWmtCO0FBQUEsbUJBYVAsZ0JBQU9FLFFBQVAsQ0FiTzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQWNSSixPQUFPLEVBZEM7O0FBQUE7O0FBaUJsQjtBQUNBRixrQkFBTSxlQUFOO0FBbEJrQjtBQUFBLDBCQW9CRE8sSUFwQkM7QUFBQTtBQUFBLG1CQW9CZ0Isa0JBQVNELFFBQVQsRUFBbUIsTUFBbkIsQ0FwQmhCOztBQUFBO0FBQUE7QUFBQSw2Q0FvQlJKLElBcEJRLGVBb0JJTSxLQXBCSjs7QUFBQTtBQUFBO0FBQUE7O0FBc0JoQlAsZ0JBQUksNEJBQUo7QUF0QmdCLDZDQXVCUkMsT0FBTyxFQXZCQzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU47O0FBMkJQOzs7Ozs7QUFNTyxJQUFNTyxvQkFBTSxTQUFOQSxHQUFNLENBQUNDLEdBQUQsRUFBTUMsS0FBTixFQUFnQjtBQUNqQyxNQUFJQSxVQUFVQyxTQUFkLEVBQXlCO0FBQ3ZCLFdBQU9WLEtBQUtRLEdBQUwsQ0FBUDtBQUNEOztBQUVEUixPQUFLUSxHQUFMLElBQVlDLEtBQVo7QUFDRCxDQU5NOztBQVFQOzs7Ozs7QUFNTyxJQUFNRSxnQ0FBWSxtQkFBQ0MsUUFBRCxFQUFXQyxFQUFYLEVBQWtCO0FBQ3pDLE1BQUlGLFlBQVlKLElBQUksSUFBSixDQUFoQjs7QUFFQSxNQUFJLENBQUNJLFNBQUwsRUFBZ0I7QUFDZEosUUFBSSxJQUFKLEVBQVVJLFlBQVksRUFBdEI7QUFDRDs7QUFFRCxNQUFJRSxFQUFKLEVBQVE7QUFDTkYsY0FBVUMsUUFBVixJQUFzQkMsRUFBdEI7QUFDRCxHQUZELE1BRU87QUFDTEYsY0FBVUMsUUFBVixJQUFzQkQsVUFBVUMsUUFBVixLQUF1QixFQUE3QztBQUNEOztBQUVELFNBQU9ELFNBQVA7QUFDRCxDQWRNOztBQWdCUDs7OztBQUlPLElBQU1HO0FBQUEsd0RBQU8sa0JBQU1aLFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNsQkosa0JBQU0sY0FBTjtBQURrQjtBQUFBLG1CQUVaLG1CQUFVSSxZQUFZLFlBQXRCLEVBQW9DRyxLQUFLVSxTQUFMLENBQWVmLElBQWYsQ0FBcEMsQ0FGWTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU4iLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9jYWNoZS9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCB7XG4gIHN0YXQsXG4gIG1rZGlyLFxuICBleGlzdHMsXG4gIHJlYWRGaWxlLFxuICB3cml0ZUZpbGUsXG59IGZyb20gJy4vZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCB7IGRlYnVnLCBsb2cgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxubGV0IGxvY2tcblxuLyoqXG4gKiBMb2FkcyBhIGNhY2hlIGZyb20gdGhlIHByb2plY3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0b3J5IHByb2plY3QgZGlyZWN0b3J5XG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBsb2FkZWQgY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWQgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICAvLyBzZW5kIGJhY2sgaW50ZXJuYWwgY2FjaGUgaWYgcmVsb2FkaW5nXG4gIGlmIChsb2NrKSByZXR1cm4gbG9ja1xuXG4gIC8vIHZlcmlmeSBkaXJlY3RvcnlcbiAgaWYgKHR5cGVvZiBkaXJlY3RvcnkgIT09ICdzdHJpbmcnIHx8ICFhd2FpdCBleGlzdHMoZGlyZWN0b3J5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkaXJlY3RvcnkgZ2l2ZW46ICcgKyBkaXJlY3RvcnkpXG4gIH1cblxuICAvLyBzZXQgY2FjaGUgZmlsZVxuICBjb25zdCBsb2NrZmlsZSA9IGAke2RpcmVjdG9yeX0vaG9wcC5sb2NrYFxuXG4gIC8vIGJyaW5nIGNhY2hlIGludG8gZXhpc3RlbmNlXG4gIGlmICghYXdhaXQgZXhpc3RzKGxvY2tmaWxlKSkge1xuICAgIHJldHVybiAobG9jayA9IHt9KVxuICB9XG5cbiAgLy8gbG9hZCBsb2NrIGZpbGVcbiAgZGVidWcoJ0xvYWRpbmcgY2FjaGUnKVxuICB0cnkge1xuICAgIHJldHVybiAobG9jayA9IEpTT04ucGFyc2UoYXdhaXQgcmVhZEZpbGUobG9ja2ZpbGUsICd1dGY4JykpKVxuICB9IGNhdGNoIChfKSB7XG4gICAgbG9nKCdDb3JydXB0ZWQgY2FjaGU7IGVqZWN0aW5nLicpXG4gICAgcmV0dXJuIChsb2NrID0ge30pXG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzL3JlcGxhY2VzIGEgdmFsdWUgaW4gdGhlIGNhY2hlLlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtBbnl9IHZhbHVlIGFueXRoaW5nIHN0cmluZ2lmaWFibGVcbiAqIEByZXR1cm5zIHtBbnk/fSB2YWx1ZSBmcm9tIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCB2YWwgPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBsb2NrW2tleV1cbiAgfVxuICBcbiAgbG9ja1trZXldID0gdmFsdWVcbn1cblxuLyoqXG4gKiBHZXQvc2V0IGEgc291cmNlbWFwLlxuICogQHBhcmFtIHtTdHJpbmd9IHRhc2tOYW1lIG5hbWUgb2YgdGhlIHRhc2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBzbSBzb3VyY2VtYXAgdG8gc2F2ZSBmb3IgdGhlIHRhc2tcbiAqIEByZXR1cm5zIHtPYmplY3R9IHNvdXJjZW1hcCBmcm9tIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCBzb3VyY2VtYXAgPSAodGFza05hbWUsIHNtKSA9PiB7XG4gIGxldCBzb3VyY2VtYXAgPSB2YWwoJ3NtJylcblxuICBpZiAoIXNvdXJjZW1hcCkge1xuICAgIHZhbCgnc20nLCBzb3VyY2VtYXAgPSB7fSlcbiAgfVxuXG4gIGlmIChzbSkge1xuICAgIHNvdXJjZW1hcFt0YXNrTmFtZV0gPSBzbVxuICB9IGVsc2Uge1xuICAgIHNvdXJjZW1hcFt0YXNrTmFtZV0gPSBzb3VyY2VtYXBbdGFza05hbWVdIHx8IHt9XG4gIH1cblxuICByZXR1cm4gc291cmNlbWFwXG59XG5cbi8qKlxuICogU2F2ZXMgdGhlIGxvY2tmaWxlIGFnYWluLlxuICogQHBhcmFtIHsqfSBkaXJlY3RvcnkgXG4gKi9cbmV4cG9ydCBjb25zdCBzYXZlID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgZGVidWcoJ1NhdmluZyBjYWNoZScpXG4gIGF3YWl0IHdyaXRlRmlsZShkaXJlY3RvcnkgKyAnL2hvcHAubG9jaycsIEpTT04uc3RyaW5naWZ5KGxvY2spKVxufVxuIl19