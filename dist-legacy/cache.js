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

            _context.t1 = process.env.RECACHE;

            if (_context.t1) {
              _context.next = 15;
              break;
            }

            _context.next = 14;
            return (0, _fs.exists)(lockfile);

          case 14:
            _context.t1 = !_context.sent;

          case 15:
            if (!_context.t1) {
              _context.next = 17;
              break;
            }

            return _context.abrupt('return', lock = { p: {} });

          case 17:

            // load lock file
            debug('Loading cache');
            _context.prev = 18;
            _context.t2 = JSON;
            _context.next = 22;
            return (0, _fs.readFile)(lockfile, 'utf8');

          case 22:
            _context.t3 = _context.sent;
            return _context.abrupt('return', lock = _context.t2.parse.call(_context.t2, _context.t3));

          case 26:
            _context.prev = 26;
            _context.t4 = _context['catch'](18);

            log('Corrupted cache; ejecting.');
            return _context.abrupt('return', lock = { p: {} });

          case 30:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[18, 26]]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWNoZS5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiZGVidWciLCJsb2ciLCJsb2NrIiwibG9hZCIsImRpcmVjdG9yeSIsIkVycm9yIiwibG9ja2ZpbGUiLCJwcm9jZXNzIiwiZW52IiwiUkVDQUNIRSIsInAiLCJKU09OIiwicGFyc2UiLCJ2YWwiLCJrZXkiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInBsdWdpbiIsInBsdWdpbnMiLCJoYXNPd25Qcm9wZXJ0eSIsInBsdWdpbk5hbWUiLCJzb3VyY2VtYXAiLCJ0YXNrTmFtZSIsInNtIiwic2F2ZSIsInN0cmluZ2lmeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOztBQU9BOzs7Ozs7MmNBYkE7Ozs7OztlQWV1QkEsUUFBUSxhQUFSLEVBQXVCLE1BQXZCLEM7SUFBZkMsSyxZQUFBQSxLO0lBQU9DLEcsWUFBQUEsRzs7QUFDZixJQUFJQyxhQUFKOztBQUVBOzs7OztBQUtPLElBQU1DO0FBQUEsdURBQU8saUJBQU1DLFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBRWRGLElBRmM7QUFBQTtBQUFBO0FBQUE7O0FBQUEsNkNBRURBLElBRkM7O0FBQUE7QUFBQSwwQkFLZCxPQUFPRSxTQUFQLEtBQXFCLFFBTFA7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxtQkFLMEIsZ0JBQU9BLFNBQVAsQ0FMMUI7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQU1WLElBQUlDLEtBQUosQ0FBVSw4QkFBOEJELFNBQXhDLENBTlU7O0FBQUE7O0FBU2xCO0FBQ01FLG9CQVZZLEdBVUVGLFNBVkY7O0FBWWxCOztBQVprQiwwQkFhZEcsUUFBUUMsR0FBUixDQUFZQyxPQWJFOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBYWdCLGdCQUFPSCxRQUFQLENBYmhCOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQSw2Q0FjUkosT0FBTyxFQUFDUSxHQUFFLEVBQUgsRUFkQzs7QUFBQTs7QUFpQmxCO0FBQ0FWLGtCQUFNLGVBQU47QUFsQmtCO0FBQUEsMEJBb0JEVyxJQXBCQztBQUFBO0FBQUEsbUJBb0JnQixrQkFBU0wsUUFBVCxFQUFtQixNQUFuQixDQXBCaEI7O0FBQUE7QUFBQTtBQUFBLDZDQW9CUkosSUFwQlEsZUFvQklVLEtBcEJKOztBQUFBO0FBQUE7QUFBQTs7QUFzQmhCWCxnQkFBSSw0QkFBSjtBQXRCZ0IsNkNBdUJSQyxPQUFPLEVBQUNRLEdBQUUsRUFBSCxFQXZCQzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQOztBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQU47O0FBMkJQOzs7Ozs7QUFNTyxJQUFNRyxvQkFBTSxTQUFOQSxHQUFNLENBQUNDLEdBQUQsRUFBTUMsS0FBTixFQUFnQjtBQUNqQyxNQUFJQSxVQUFVQyxTQUFkLEVBQXlCO0FBQ3ZCLFdBQU9kLEtBQUtZLEdBQUwsQ0FBUDtBQUNEOztBQUVEWixPQUFLWSxHQUFMLElBQVlDLEtBQVo7QUFDRCxDQU5NOztBQVFQOzs7O0FBSU8sSUFBTUUsMEJBQVMsU0FBVEEsTUFBUyxhQUFjO0FBQ2xDLE1BQU1DLFVBQVVMLElBQUksR0FBSixDQUFoQjs7QUFFQSxNQUFJLENBQUNLLFFBQVFDLGNBQVIsQ0FBdUJDLFVBQXZCLENBQUwsRUFBeUM7QUFDdkNGLFlBQVFFLFVBQVIsSUFBc0IsRUFBdEI7QUFDRDs7QUFFRCxTQUFPRixRQUFRRSxVQUFSLENBQVA7QUFDRCxDQVJNOztBQVVQOzs7Ozs7QUFNTyxJQUFNQyxnQ0FBWSxtQkFBQ0MsUUFBRCxFQUFXQyxFQUFYLEVBQWtCO0FBQ3pDLE1BQUlGLFlBQVlSLElBQUksSUFBSixDQUFoQjs7QUFFQSxNQUFJLENBQUNRLFNBQUwsRUFBZ0I7QUFDZFIsUUFBSSxJQUFKLEVBQVVRLFlBQVksRUFBdEI7QUFDRDs7QUFFRCxNQUFJRSxFQUFKLEVBQVE7QUFDTkYsY0FBVUMsUUFBVixJQUFzQkMsRUFBdEI7QUFDRCxHQUZELE1BRU87QUFDTEYsY0FBVUMsUUFBVixJQUFzQkQsVUFBVUMsUUFBVixLQUF1QixFQUE3QztBQUNEOztBQUVELFNBQU9ELFNBQVA7QUFDRCxDQWRNOztBQWdCUDs7OztBQUlPLElBQU1HO0FBQUEsd0RBQU8sa0JBQU1wQixTQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbEJKLGtCQUFNLGNBQU47QUFEa0I7QUFBQSxtQkFFWixtQkFBVUksWUFBWSxZQUF0QixFQUFvQ08sS0FBS2MsU0FBTCxDQUFldkIsSUFBZixDQUFwQyxDQUZZOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQVA7O0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBTiIsImZpbGUiOiJjYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2NhY2hlL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IHtcbiAgc3RhdCxcbiAgbWtkaXIsXG4gIGV4aXN0cyxcbiAgcmVhZEZpbGUsXG4gIHdyaXRlRmlsZSxcbn0gZnJvbSAnLi9mcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmNvbnN0IHsgZGVidWcsIGxvZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5sZXQgbG9ja1xuXG4vKipcbiAqIExvYWRzIGEgY2FjaGUgZnJvbSB0aGUgcHJvamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3RvcnkgcHJvamVjdCBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIGxvYWRlZCBjYWNoZVxuICovXG5leHBvcnQgY29uc3QgbG9hZCA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIC8vIHNlbmQgYmFjayBpbnRlcm5hbCBjYWNoZSBpZiByZWxvYWRpbmdcbiAgaWYgKGxvY2spIHJldHVybiBsb2NrXG5cbiAgLy8gdmVyaWZ5IGRpcmVjdG9yeVxuICBpZiAodHlwZW9mIGRpcmVjdG9yeSAhPT0gJ3N0cmluZycgfHwgIWF3YWl0IGV4aXN0cyhkaXJlY3RvcnkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdG9yeSBnaXZlbjogJyArIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8vIHNldCBjYWNoZSBmaWxlXG4gIGNvbnN0IGxvY2tmaWxlID0gYCR7ZGlyZWN0b3J5fS9ob3BwLmxvY2tgXG5cbiAgLy8gYnJpbmcgY2FjaGUgaW50byBleGlzdGVuY2VcbiAgaWYgKHByb2Nlc3MuZW52LlJFQ0FDSEUgfHwgIWF3YWl0IGV4aXN0cyhsb2NrZmlsZSkpIHtcbiAgICByZXR1cm4gKGxvY2sgPSB7cDp7fX0pXG4gIH1cblxuICAvLyBsb2FkIGxvY2sgZmlsZVxuICBkZWJ1ZygnTG9hZGluZyBjYWNoZScpXG4gIHRyeSB7XG4gICAgcmV0dXJuIChsb2NrID0gSlNPTi5wYXJzZShhd2FpdCByZWFkRmlsZShsb2NrZmlsZSwgJ3V0ZjgnKSkpXG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBsb2coJ0NvcnJ1cHRlZCBjYWNoZTsgZWplY3RpbmcuJylcbiAgICByZXR1cm4gKGxvY2sgPSB7cDp7fX0pXG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzL3JlcGxhY2VzIGEgdmFsdWUgaW4gdGhlIGNhY2hlLlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtBbnl9IHZhbHVlIGFueXRoaW5nIHN0cmluZ2lmaWFibGVcbiAqIEByZXR1cm5zIHtBbnk/fSB2YWx1ZSBmcm9tIGNhY2hlXG4gKi9cbmV4cG9ydCBjb25zdCB2YWwgPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBsb2NrW2tleV1cbiAgfVxuICBcbiAgbG9ja1trZXldID0gdmFsdWVcbn1cblxuLyoqXG4gKiBMb2FkL2NyZWF0ZSBjYWNoZSBmb3IgYSBwbHVnaW4uXG4gKiBAcGFyYW0ge31cbiAqL1xuZXhwb3J0IGNvbnN0IHBsdWdpbiA9IHBsdWdpbk5hbWUgPT4ge1xuICBjb25zdCBwbHVnaW5zID0gdmFsKCdwJylcblxuICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luTmFtZSkpIHtcbiAgICBwbHVnaW5zW3BsdWdpbk5hbWVdID0ge31cbiAgfVxuXG4gIHJldHVybiBwbHVnaW5zW3BsdWdpbk5hbWVdXG59XG5cbi8qKlxuICogR2V0L3NldCBhIHNvdXJjZW1hcC5cbiAqIEBwYXJhbSB7U3RyaW5nfSB0YXNrTmFtZSBuYW1lIG9mIHRoZSB0YXNrXG4gKiBAcGFyYW0ge09iamVjdH0gc20gc291cmNlbWFwIHRvIHNhdmUgZm9yIHRoZSB0YXNrXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBzb3VyY2VtYXAgZnJvbSBjYWNoZVxuICovXG5leHBvcnQgY29uc3Qgc291cmNlbWFwID0gKHRhc2tOYW1lLCBzbSkgPT4ge1xuICBsZXQgc291cmNlbWFwID0gdmFsKCdzbScpXG5cbiAgaWYgKCFzb3VyY2VtYXApIHtcbiAgICB2YWwoJ3NtJywgc291cmNlbWFwID0ge30pXG4gIH1cblxuICBpZiAoc20pIHtcbiAgICBzb3VyY2VtYXBbdGFza05hbWVdID0gc21cbiAgfSBlbHNlIHtcbiAgICBzb3VyY2VtYXBbdGFza05hbWVdID0gc291cmNlbWFwW3Rhc2tOYW1lXSB8fCB7fVxuICB9XG5cbiAgcmV0dXJuIHNvdXJjZW1hcFxufVxuXG4vKipcbiAqIFNhdmVzIHRoZSBsb2NrZmlsZSBhZ2Fpbi5cbiAqIEBwYXJhbSB7Kn0gZGlyZWN0b3J5IFxuICovXG5leHBvcnQgY29uc3Qgc2F2ZSA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIGRlYnVnKCdTYXZpbmcgY2FjaGUnKVxuICBhd2FpdCB3cml0ZUZpbGUoZGlyZWN0b3J5ICsgJy9ob3BwLmxvY2snLCBKU09OLnN0cmluZ2lmeShsb2NrKSlcbn1cbiJdfQ==