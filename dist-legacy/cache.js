'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.plugin = exports.val = exports.load = undefined;

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

            return _context.abrupt('return', lock = { p: {} });

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
            return _context.abrupt('return', lock = { p: {} });

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
 * Load/create cache for a plugin.
 * @param {}
 */
var plugin = exports.plugin = function plugin(pluginName) {
  var plugins = val('p');

  if (!plugins.hasOwnProperty(pluginName)) {
    plugins[pluginName] = {};
  }

  return plugins[pluginName];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVidWciLCJsb2ciLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJwIiwiSlNPTiIsInBhcnNlIiwidmFsIiwia2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJwbHVnaW4iLCJwbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJwbHVnaW5OYW1lIiwic291cmNlbWFwIiwidGFza05hbWUiLCJzbSIsInNhdmUiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7QUFPQTs7Ozs7OzJjQWJBOzs7Ozs7ZUFldUJBLFFBQVEsYUFBUixFQUF1QixNQUF2QixDO0lBQWZDLEssWUFBQUEsSztJQUFPQyxHLFlBQUFBLEc7O0FBQ2YsSUFBSUMsYUFBSjs7QUFFQTs7Ozs7QUFLTyxJQUFNQztBQUFBLHVEQUFPLGlCQUFNQyxTQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUVkRixJQUZjO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQUVEQSxJQUZDOztBQUFBO0FBQUEsMEJBS2QsT0FBT0UsU0FBUCxLQUFxQixRQUxQOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBSzBCLGdCQUFPQSxTQUFQLENBTDFCOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkFNVixJQUFJQyxLQUFKLENBQVUsOEJBQThCRCxTQUF4QyxDQU5VOztBQUFBOztBQVNsQjtBQUNNRSxvQkFWWSxHQVVFRixTQVZGOztBQVlsQjs7QUFaa0I7QUFBQSxtQkFhUCxnQkFBT0UsUUFBUCxDQWJPOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsNkNBY1JKLE9BQU8sRUFBQ0ssR0FBRSxFQUFILEVBZEM7O0FBQUE7O0FBaUJsQjtBQUNBUCxrQkFBTSxlQUFOO0FBbEJrQjtBQUFBLDBCQW9CRFEsSUFwQkM7QUFBQTtBQUFBLG1CQW9CZ0Isa0JBQVNGLFFBQVQsRUFBbUIsTUFBbkIsQ0FwQmhCOztBQUFBO0FBQUE7QUFBQSw2Q0FvQlJKLElBcEJRLGVBb0JJTyxLQXBCSjs7QUFBQTtBQUFBO0FBQUE7O0FBc0JoQlIsZ0JBQUksNEJBQUo7QUF0QmdCLDZDQXVCUkMsT0FBTyxFQUFDSyxHQUFFLEVBQUgsRUF2QkM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFOOztBQTJCUDs7Ozs7O0FBTU8sSUFBTUcsb0JBQU0sU0FBTkEsR0FBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sRUFBZ0I7QUFDakMsTUFBSUEsVUFBVUMsU0FBZCxFQUF5QjtBQUN2QixXQUFPWCxLQUFLUyxHQUFMLENBQVA7QUFDRDs7QUFFRFQsT0FBS1MsR0FBTCxJQUFZQyxLQUFaO0FBQ0QsQ0FOTTs7QUFRUDs7OztBQUlPLElBQU1FLDBCQUFTLFNBQVRBLE1BQVMsYUFBYztBQUNsQyxNQUFNQyxVQUFVTCxJQUFJLEdBQUosQ0FBaEI7O0FBRUEsTUFBSSxDQUFDSyxRQUFRQyxjQUFSLENBQXVCQyxVQUF2QixDQUFMLEVBQXlDO0FBQ3ZDRixZQUFRRSxVQUFSLElBQXNCLEVBQXRCO0FBQ0Q7O0FBRUQsU0FBT0YsUUFBUUUsVUFBUixDQUFQO0FBQ0QsQ0FSTTs7QUFVUDs7Ozs7O0FBTU8sSUFBTUMsZ0NBQVksbUJBQUNDLFFBQUQsRUFBV0MsRUFBWCxFQUFrQjtBQUN6QyxNQUFJRixZQUFZUixJQUFJLElBQUosQ0FBaEI7O0FBRUEsTUFBSSxDQUFDUSxTQUFMLEVBQWdCO0FBQ2RSLFFBQUksSUFBSixFQUFVUSxZQUFZLEVBQXRCO0FBQ0Q7O0FBRUQsTUFBSUUsRUFBSixFQUFRO0FBQ05GLGNBQVVDLFFBQVYsSUFBc0JDLEVBQXRCO0FBQ0QsR0FGRCxNQUVPO0FBQ0xGLGNBQVVDLFFBQVYsSUFBc0JELFVBQVVDLFFBQVYsS0FBdUIsRUFBN0M7QUFDRDs7QUFFRCxTQUFPRCxTQUFQO0FBQ0QsQ0FkTTs7QUFnQlA7Ozs7QUFJTyxJQUFNRztBQUFBLHdEQUFPLGtCQUFNakIsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2xCSixrQkFBTSxjQUFOO0FBRGtCO0FBQUEsbUJBRVosbUJBQVVJLFlBQVksWUFBdEIsRUFBb0NJLEtBQUtjLFNBQUwsQ0FBZXBCLElBQWYsQ0FBcEMsQ0FGWTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU4iLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9jYWNoZS9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCB7XG4gIHN0YXQsXG4gIG1rZGlyLFxuICBleGlzdHMsXG4gIHJlYWRGaWxlLFxuICB3cml0ZUZpbGUsXG59IGZyb20gJy4vZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCB7IGRlYnVnLCBsb2cgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxubGV0IGxvY2tcblxuLyoqXG4gKiBMb2FkcyBhIGNhY2hlIGZyb20gdGhlIHByb2plY3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0b3J5IHByb2plY3QgZGlyZWN0b3J5XG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBsb2FkZWQgY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWQgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICAvLyBzZW5kIGJhY2sgaW50ZXJuYWwgY2FjaGUgaWYgcmVsb2FkaW5nXG4gIGlmIChsb2NrKSByZXR1cm4gbG9ja1xuXG4gIC8vIHZlcmlmeSBkaXJlY3RvcnlcbiAgaWYgKHR5cGVvZiBkaXJlY3RvcnkgIT09ICdzdHJpbmcnIHx8ICFhd2FpdCBleGlzdHMoZGlyZWN0b3J5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkaXJlY3RvcnkgZ2l2ZW46ICcgKyBkaXJlY3RvcnkpXG4gIH1cblxuICAvLyBzZXQgY2FjaGUgZmlsZVxuICBjb25zdCBsb2NrZmlsZSA9IGAke2RpcmVjdG9yeX0vaG9wcC5sb2NrYFxuXG4gIC8vIGJyaW5nIGNhY2hlIGludG8gZXhpc3RlbmNlXG4gIGlmICghYXdhaXQgZXhpc3RzKGxvY2tmaWxlKSkge1xuICAgIHJldHVybiAobG9jayA9IHtwOnt9fSlcbiAgfVxuXG4gIC8vIGxvYWQgbG9jayBmaWxlXG4gIGRlYnVnKCdMb2FkaW5nIGNhY2hlJylcbiAgdHJ5IHtcbiAgICByZXR1cm4gKGxvY2sgPSBKU09OLnBhcnNlKGF3YWl0IHJlYWRGaWxlKGxvY2tmaWxlLCAndXRmOCcpKSlcbiAgfSBjYXRjaCAoXykge1xuICAgIGxvZygnQ29ycnVwdGVkIGNhY2hlOyBlamVjdGluZy4nKVxuICAgIHJldHVybiAobG9jayA9IHtwOnt9fSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMvcmVwbGFjZXMgYSB2YWx1ZSBpbiB0aGUgY2FjaGUuXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge0FueX0gdmFsdWUgYW55dGhpbmcgc3RyaW5naWZpYWJsZVxuICogQHJldHVybnMge0FueT99IHZhbHVlIGZyb20gY2FjaGVcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbCA9IChrZXksIHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGxvY2tba2V5XVxuICB9XG4gIFxuICBsb2NrW2tleV0gPSB2YWx1ZVxufVxuXG4vKipcbiAqIExvYWQvY3JlYXRlIGNhY2hlIGZvciBhIHBsdWdpbi5cbiAqIEBwYXJhbSB7fVxuICovXG5leHBvcnQgY29uc3QgcGx1Z2luID0gcGx1Z2luTmFtZSA9PiB7XG4gIGNvbnN0IHBsdWdpbnMgPSB2YWwoJ3AnKVxuXG4gIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW5OYW1lKSkge1xuICAgIHBsdWdpbnNbcGx1Z2luTmFtZV0gPSB7fVxuICB9XG5cbiAgcmV0dXJuIHBsdWdpbnNbcGx1Z2luTmFtZV1cbn1cblxuLyoqXG4gKiBHZXQvc2V0IGEgc291cmNlbWFwLlxuICogQHBhcmFtIHtTdHJpbmd9IHRhc2tOYW1lIG5hbWUgb2YgdGhlIHRhc2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBzbSBzb3VyY2VtYXAgdG8gc2F2ZSBmb3IgdGhlIHRhc2tcbiAqIEByZXR1cm5zIHtPYmplY3R9IHNvdXJjZW1hcCBmcm9tIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCBzb3VyY2VtYXAgPSAodGFza05hbWUsIHNtKSA9PiB7XG4gIGxldCBzb3VyY2VtYXAgPSB2YWwoJ3NtJylcblxuICBpZiAoIXNvdXJjZW1hcCkge1xuICAgIHZhbCgnc20nLCBzb3VyY2VtYXAgPSB7fSlcbiAgfVxuXG4gIGlmIChzbSkge1xuICAgIHNvdXJjZW1hcFt0YXNrTmFtZV0gPSBzbVxuICB9IGVsc2Uge1xuICAgIHNvdXJjZW1hcFt0YXNrTmFtZV0gPSBzb3VyY2VtYXBbdGFza05hbWVdIHx8IHt9XG4gIH1cblxuICByZXR1cm4gc291cmNlbWFwXG59XG5cbi8qKlxuICogU2F2ZXMgdGhlIGxvY2tmaWxlIGFnYWluLlxuICogQHBhcmFtIHsqfSBkaXJlY3RvcnkgXG4gKi9cbmV4cG9ydCBjb25zdCBzYXZlID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgZGVidWcoJ1NhdmluZyBjYWNoZScpXG4gIGF3YWl0IHdyaXRlRmlsZShkaXJlY3RvcnkgKyAnL2hvcHAubG9jaycsIEpTT04uc3RyaW5naWZ5KGxvY2spKVxufVxuIl19