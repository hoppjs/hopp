'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _module = require('module');

var _module2 = _interopRequireDefault(_module);

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _hopp = require('./hopp');

var _hopp2 = _interopRequireDefault(_hopp);

var _tree = require('./tasks/tree');

var _tree2 = _interopRequireDefault(_tree);

var _hoppfile = require('./hoppfile');

var hoppfile = _interopRequireWildcard(_hoppfile);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file index.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('./utils/log')('hopp'

/**
 * Parse args
 */
),
    log = _require.log,
    debug = _require.debug,
    error = _require.error;

var argv = function (args) {
  var o = {
    _: []
  };

  for (var i = 2; i < args.length; i += 1) {
    var a = args[i];

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a[0] !== '-') o._.push(a);
  }

  return o;
}(process.argv

/**
 * Print help.
 */
);function help() {
  console.log('usage: hopp [OPTIONS] [TASKS]');
  console.log('');
  console.log('  -d, --directory [dir]\tpath to project directory');
  console.log('  -v, --verbose\tenable debug messages');
  console.log('  -V, --version\tget version info');
  console.log('  -h, --help\tdisplay this message');

  process.exit(1);
}

if (argv.version) {
  console.log(require('../package.json').version);
  process.exit(0);
}

/**
 * Currently the only way for help to be called.
 * Later, it should also happen on invalid args but we
 * don't have invalid arguments yet.
 * 
 * Invalid arguments is a flag misuse - never a missing
 * task. That error should be more minimal and separate.
 */
if (argv.help) {
  help();
}

/**
 * Set tasks.
 */
var tasks = argv._.length === 0 ? ['default'] : argv._;_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
  var projectDir, file, lock, hopp, _resolve, _ref2, _ref3, fromCache, taskDefns, goal;

  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          /**
           * Pass verbosity through to the env.
           */
          process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !!argv.verbose;
          debug('Setting HOPP_DEBUG = %j', process.env.HOPP_DEBUG

          /**
           * If project directory not specified, do lookup for the
           * hoppfile.js
           */
          );
          _context.t0 = function (directory) {
            // absolute paths don't need correcting
            if (directory[0] === '/') {
              return directory;
            }

            // sort-of relatives should be made into relative
            if (directory[0] !== '.') {
              directory = './' + directory;
            }

            // map to current directory
            return _path2.default.resolve(process.cwd(), directory);
          };

          _context.t1 = argv.directory;

          if (_context.t1) {
            _context.next = 8;
            break;
          }

          _context.next = 7;
          return hoppfile.find(_path2.default.dirname(__dirname));

        case 7:
          _context.t1 = _context.sent;

        case 8:
          _context.t2 = _context.t1;
          projectDir = (0, _context.t0)(_context.t2);
          file = projectDir + '/hoppfile.js';

          debug('Using hoppfile.js @ %s', file

          /**
           * Load cache.
           */
          );_context.next = 14;
          return cache.load(projectDir

          /**
           * Create hopp instance creator.
           */
          );

        case 14:
          lock = _context.sent;
          _context.next = 17;
          return (0, _hopp2.default)(projectDir

          /**
           * Cache the hopp handler to make `require()` work
           * in the hoppfile.
           */
          );

        case 17:
          hopp = _context.sent;
          _resolve = _module2.default._resolveFilename;

          _module2.default._resolveFilename = function (what, parent) {
            return what === 'hopp' ? what : _resolve(what, parent);
          };

          require.cache.hopp = {
            id: 'hopp',
            filename: 'hopp',
            loaded: true,
            exports: hopp

            /**
             * Load tasks from file.
             */
          };_context.next = 23;
          return hoppfile.load(file

          /**
           * Parse from cache.
           */
          );

        case 23:
          _ref2 = _context.sent;
          _ref3 = _slicedToArray(_ref2, 2);
          fromCache = _ref3[0];
          taskDefns = _ref3[1];
          if (fromCache) {
            (0, _tree2.default)(taskDefns, tasks);
          }

          /**
           * Run tasks.
           */
          goal = void 0;


          if (tasks.length === 1) {
            goal = taskDefns[tasks[0]];

            if (goal instanceof Array) {
              goal = (0, _parallel2.default)(goal);
            }

            goal = goal.start();
          } else {
            goal = Promise.all(tasks.map(function (task) {
              task = taskDefns[task];

              if (task instanceof Array) {
                task = (0, _parallel2.default)(task);
              }

              return task.start();
            }));
          }

          /**
           * Wait for task completion.
           */
          _context.next = 32;
          return goal;

        case 32:
          _context.next = 34;
          return cache.save(projectDir);

        case 34:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
}))().catch(function (err) {
  error(err.stack || err);
  process.exit(-1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwicmVxdWlyZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJhcmd2IiwibyIsIl8iLCJpIiwiYXJncyIsImxlbmd0aCIsImEiLCJoZWxwIiwidmVyc2lvbiIsInZlcmJvc2UiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwicmVzb2x2ZSIsImN3ZCIsImZpbmQiLCJkaXJuYW1lIiwiX19kaXJuYW1lIiwicHJvamVjdERpciIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJ0YXNrRGVmbnMiLCJnb2FsIiwiQXJyYXkiLCJzdGFydCIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0YXNrIiwic2F2ZSIsImNhdGNoIiwiZXJyIiwic3RhY2siXSwibWFwcGluZ3MiOiI7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUMsUTs7QUFDWjs7Ozs7Ozs7MmNBZEE7Ozs7OztlQWdCOEJDLFFBQVEsYUFBUixFQUF1Qjs7QUFFckQ7OztBQUY4QixDO0lBQXRCQyxHLFlBQUFBLEc7SUFBS0MsSyxZQUFBQSxLO0lBQU9DLEssWUFBQUEsSzs7QUFLcEIsSUFBTUMsT0FBUSxnQkFBUTtBQUNwQixNQUFNQyxJQUFJO0FBQ1JDLE9BQUc7QUFESyxHQUFWOztBQUlBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJQyxLQUFLQyxNQUF6QixFQUFpQ0YsS0FBSyxDQUF0QyxFQUF5QztBQUN2QyxRQUFJRyxJQUFJRixLQUFLRCxDQUFMLENBQVI7O0FBRUEs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V3RCLFVBQVgsQ0E1R047O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCxLQTZHSXVCLEtBN0dKLENBNkdVLGVBQU87QUFDaEIvQyxRQUFNZ0QsSUFBSUMsS0FBSixJQUFhRCxHQUFuQjtBQUNBbkMsVUFBUUUsSUFBUixDQUFhLENBQUMsQ0FBZDtBQUNELENBaEhBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBpbmRleC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaVxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IE1vZHVsZSBmcm9tICdtb2R1bGUnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUhvcHAgZnJvbSAnLi9ob3BwJ1xuaW1wb3J0IGZyb21UcmVlIGZyb20gJy4vdGFza3MvdHJlZSdcbmltcG9ydCAqIGFzIGhvcHBmaWxlIGZyb20gJy4vaG9wcGZpbGUnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi90YXNrcy9wYXJhbGxlbCdcblxuY29uc3QgeyBsb2csIGRlYnVnLCBlcnJvciB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5cbi8qKlxuICogUGFyc2UgYXJnc1xuICovXG5jb25zdCBhcmd2ID0gKGFyZ3MgPT4ge1xuICBjb25zdCBvID0ge1xuICAgIF86IFtdXG4gIH1cblxuICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBsZXQgYSA9IGFyZ3NbaV1cblxuICAgIGlmIChhID09PSAnLWgnIHx8IGEgPT09ICctLWhlbHAnKSBvLmhlbHAgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1WJyB8fCBhID09PSAnLS12ZXJzaW9uJykgby52ZXJzaW9uID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctdicgfHwgYSA9PT0gJy0tdmVyYm9zZScpIG8udmVyYm9zZSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLWQnIHx8IGEgPT09ICctLWRpcmVjdG9yeScpIG8uZGlyZWN0b3J5ID0gYXJnc1srK2ldXG4gICAgZWxzZSBpZiAoYVswXSAhPT0gJy0nKSBvLl8ucHVzaChhKVxuICB9XG5cbiAgcmV0dXJuIG9cbn0pKHByb2Nlc3MuYXJndilcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgY29uc29sZS5sb2coJyAgLWQsIC0tZGlyZWN0b3J5IFtkaXJdXFx0cGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeScpXG4gIGNvbnNvbGUubG9nKCcgIC12LCAtLXZlcmJvc2VcXHRlbmFibGUgZGVidWcgbWVzc2FnZXMnKVxuICBjb25zb2xlLmxvZygnICAtViwgLS12ZXJzaW9uXFx0Z2V0IHZlcnNpb24gaW5mbycpXG4gIGNvbnNvbGUubG9nKCcgIC1oLCAtLWhlbHBcXHRkaXNwbGF5IHRoaXMgbWVzc2FnZScpXG5cbiAgcHJvY2Vzcy5leGl0KDEpXG59XG5cbmlmIChhcmd2LnZlcnNpb24pIHtcbiAgY29uc29sZS5sb2cocmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvbilcbiAgcHJvY2Vzcy5leGl0KDApXG59XG5cbi8qKlxuICogQ3VycmVudGx5IHRoZSBvbmx5IHdheSBmb3IgaGVscCB0byBiZSBjYWxsZWQuXG4gKiBMYXRlciwgaXQgc2hvdWxkIGFsc28gaGFwcGVuIG9uIGludmFsaWQgYXJncyBidXQgd2VcbiAqIGRvbid0IGhhdmUgaW52YWxpZCBhcmd1bWVudHMgeWV0LlxuICogXG4gKiBJbnZhbGlkIGFyZ3VtZW50cyBpcyBhIGZsYWcgbWlzdXNlIC0gbmV2ZXIgYSBtaXNzaW5nXG4gKiB0YXNrLiBUaGF0IGVycm9yIHNob3VsZCBiZSBtb3JlIG1pbmltYWwgYW5kIHNlcGFyYXRlLlxuICovXG5pZiAoYXJndi5oZWxwKSB7XG4gIGhlbHAoKVxufVxuXG4vKipcbiAqIFNldCB0YXNrcy5cbiAqL1xuY29uc3QgdGFza3MgPSBhcmd2Ll8ubGVuZ3RoID09PSAwID8gWydkZWZhdWx0J10gOiBhcmd2Ll9cblxuOyhhc3luYyAoKSA9PiB7XG4gIC8qKlxuICAgKiBQYXNzIHZlcmJvc2l0eSB0aHJvdWdoIHRvIHRoZSBlbnYuXG4gICAqL1xuICBwcm9jZXNzLmVudi5IT1BQX0RFQlVHID0gcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyB8fCAhISBhcmd2LnZlcmJvc2VcbiAgZGVidWcoJ1NldHRpbmcgSE9QUF9ERUJVRyA9ICVqJywgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRylcblxuICAvKipcbiAgICogSWYgcHJvamVjdCBkaXJlY3Rvcnkgbm90IHNwZWNpZmllZCwgZG8gbG9va3VwIGZvciB0aGVcbiAgICogaG9wcGZpbGUuanNcbiAgICovXG4gIGNvbnN0IHByb2plY3REaXIgPSAoZGlyZWN0b3J5ID0+IHtcbiAgICAvLyBhYnNvbHV0ZSBwYXRocyBkb24ndCBuZWVkIGNvcnJlY3RpbmdcbiAgICBpZiAoZGlyZWN0b3J5WzBdID09PSAnLycpIHtcbiAgICAgIHJldHVybiBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBzb3J0LW9mIHJlbGF0aXZlcyBzaG91bGQgYmUgbWFkZSBpbnRvIHJlbGF0aXZlXG4gICAgaWYgKGRpcmVjdG9yeVswXSAhPT0gJy4nKSB7XG4gICAgICBkaXJlY3RvcnkgPSAnLi8nICsgZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gbWFwIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBkaXJlY3RvcnkpXG4gIH0pKGFyZ3YuZGlyZWN0b3J5IHx8IGF3YWl0IGhvcHBmaWxlLmZpbmQocGF0aC5kaXJuYW1lKF9fZGlybmFtZSkpKVxuXG4gIC8qKlxuICAgKiBTZXQgaG9wcGZpbGUgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIHByb2plY3QuXG4gICAqIFxuICAgKiBUaGlzIHdpbGwgY2F1c2UgZXJyb3JzIGxhdGVyIGlmIHRoZSBkaXJlY3Rvcnkgd2FzIHN1cHBsaWVkXG4gICAqIG1hbnVhbGx5IGJ1dCBjb250YWlucyBubyBob3BwZmlsZS4gV2UgZG9uJ3Qgd2FudCB0byBkbyBhIG1hZ2ljXG4gICAqIGxvb2t1cCBmb3IgdGhlIHVzZXIgYmVjYXVzZSB0aGV5IG92ZXJyb2RlIHRoZSBtYWdpYyB3aXRoIHRoZVxuICAgKiBtYW51YWwgZmxhZy5cbiAgICovXG4gIGNvbnN0IGZpbGUgPSBwcm9qZWN0RGlyICsgJy9ob3BwZmlsZS5qcydcbiAgZGVidWcoJ1VzaW5nIGhvcHBmaWxlLmpzIEAgJXMnLCBmaWxlKVxuXG4gIC8qKlxuICAgKiBMb2FkIGNhY2hlLlxuICAgKi9cbiAgY29uc3QgbG9jayA9IGF3YWl0IGNhY2hlLmxvYWQocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ3JlYXRlIGhvcHAgaW5zdGFuY2UgY3JlYXRvci5cbiAgICovXG4gIGNvbnN0IGhvcHAgPSBhd2FpdCBjcmVhdGVIb3BwKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENhY2hlIHRoZSBob3BwIGhhbmRsZXIgdG8gbWFrZSBgcmVxdWlyZSgpYCB3b3JrXG4gICAqIGluIHRoZSBob3BwZmlsZS5cbiAgICovXG4gIGNvbnN0IF9yZXNvbHZlID0gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWVcbiAgTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgPSAod2hhdCwgcGFyZW50KSA9PiB7XG4gICAgcmV0dXJuIHdoYXQgPT09ICdob3BwJyA/IHdoYXQgOiBfcmVzb2x2ZSh3aGF0LCBwYXJlbnQpXG4gIH1cblxuICByZXF1aXJlLmNhY2hlLmhvcHAgPSB7XG4gICAgaWQ6ICdob3BwJyxcbiAgICBmaWxlbmFtZTogJ2hvcHAnLFxuICAgIGxvYWRlZDogdHJ1ZSxcbiAgICBleHBvcnRzOiBob3BwXG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0YXNrcyBmcm9tIGZpbGUuXG4gICAqL1xuICBjb25zdCBbZnJvbUNhY2hlLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgdGFza3MpXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2tzLlxuICAgKi9cbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gY3JlYXRlUGFyYWxsZWwoZ29hbClcbiAgICB9XG4gICAgXG4gICAgZ29hbCA9IGdvYWwuc3RhcnQoKVxuICB9IGVsc2Uge1xuICAgIGdvYWwgPSBQcm9taXNlLmFsbCh0YXNrcy5tYXAodGFzayA9PiB7XG4gICAgICB0YXNrID0gdGFza0RlZm5zW3Rhc2tdXG5cbiAgICAgIGlmICh0YXNrIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGFzayA9IGNyZWF0ZVBhcmFsbGVsKHRhc2spXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0YXNrLnN0YXJ0KClcbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciB0YXNrIGNvbXBsZXRpb24uXG4gICAqL1xuICBhd2FpdCBnb2FsXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgcHJvY2Vzcy5leGl0KC0xKVxufSlcbiJdfQ==