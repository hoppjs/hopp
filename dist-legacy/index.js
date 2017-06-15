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
  var projectDir, file, lock, hopp, _resolve, _ref2, _ref3, fromCache, taskDefns, goal, name;

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
            (function () {
              // create copy of tasks, we don't want to modify
              // the actual goal list
              var fullList = [].slice.call(tasks

              // loop until we walk the whole tree
              );while (true) {
                var length = fullList.length;

                // add task dependencies to list
                tasks.forEach(function (task) {
                  if (taskDefns[task] instanceof Array) {
                    fullList.push(task);
                  }
                }

                // once length is unchanging, we've hit the bottom
                // of the tree
                );if (length === fullList.length) {
                  break;
                }
              }

              // parse all tasks and their dependencies
              (0, _tree2.default)(taskDefns, fullList);
            })();
          }

          /**
           * Run tasks.
           */
          goal = void 0;


          if (tasks.length === 1) {
            name = tasks[0];

            goal = taskDefns[tasks[0]];

            if (goal instanceof Array) {
              goal = (0, _parallel2.default)(name, goal, taskDefns);
            }

            goal = goal.start(name);
          } else {
            goal = Promise.all(tasks.map(function (name) {
              var task = taskDefns[name];

              if (task instanceof Array) {
                task = (0, _parallel2.default)(name, task, taskDefns);
              }

              return task.start(name);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwicmVxdWlyZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJhcmd2IiwibyIsIl8iLCJpIiwiYXJncyIsImxlbmd0aCIsImEiLCJoZWxwIiwidmVyc2lvbiIsInZlcmJvc2UiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwicmVzb2x2ZSIsImN3ZCIsImZpbmQiLCJkaXJuYW1lIiwiX19kaXJuYW1lIiwicHJvamVjdERpciIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJ0YXNrRGVmbnMiLCJmdWxsTGlzdCIsInNsaWNlIiwiY2FsbCIsImZvckVhY2giLCJ0YXNrIiwiQXJyYXkiLCJnb2FsIiwibmFtZSIsInN0YXJ0IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInNhdmUiLCJjYXRjaCIsImVyciIsInN0YWNrIl0sIm1hcHBpbmdzIjoiOzs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7OzJjQWRBOzs7Ozs7ZUFnQjhCQyxRQUFRLGFBQVIsRUFBdUI7O0FBRXJEOzs7QUFGOEIsQztJQUF0QkMsRyxZQUFBQSxHO0lBQUtDLEssWUFBQUEsSztJQUFPQyxLLFlBQUFBLEs7O0FBS3BCLElBQU1DLE9BQVEsZ0JBQVE7QUFDcEIsTUFBTUMsSUFBSTtBQUNSQyxPQUFHO0FBREssR0FBVjs7QUFJQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUMsS0FBS0MsTUFBekIsRUFBaUNGLEtBQUssQ0FBdEMsRUFB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dEIsTUFBTSxDQUFOLENBQVYsQ0FBUDs7QUFFQSxnQkFBSTZCLGdCQUFnQkQsS0FBcEIsRUFBMkI7QUFDekJDLHFCQUFPLHdCQUFlQyxJQUFmLEVBQXFCRCxJQUFyQixFQUEyQlAsU0FBM0IsQ0FBUDtBQUNEOztBQUVETyxtQkFBT0EsS0FBS0UsS0FBTCxDQUFXRCxJQUFYLENBQVA7QUFDRCxXQVRELE1BU087QUFDTEQsbUJBQU9HLFFBQVFDLEdBQVIsQ0FBWWpDLE1BQU1rQyxHQUFOLENBQVUsZ0JBQVE7QUFDbkMsa0JBQUlQLE9BQU9MLFVBQVVRLElBQVYsQ0FBWDs7QUFFQSxrQkFBSUgsZ0JBQWdCQyxLQUFwQixFQUEyQjtBQUN6QkQsdUJBQU8sd0JBQWVHLElBQWYsRUFBcUJILElBQXJCLEVBQTJCTCxTQUEzQixDQUFQO0FBQ0Q7O0FBRUQscUJBQU9LLEtBQUtJLEtBQUwsQ0FBV0QsSUFBWCxDQUFQO0FBQ0QsYUFSa0IsQ0FBWixDQUFQO0FBU0Q7O0FBRUQ7OztBQTVIQTtBQUFBLGlCQStITUQsSUEvSE47O0FBQUE7QUFBQTtBQUFBLGlCQW9JTWxELE1BQU13RCxJQUFOLENBQVczQixVQUFYLENBcElOOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQsS0FxSUk0QixLQXJJSixDQXFJVSxlQUFPO0FBQ2hCcEQsUUFBTXFELElBQUlDLEtBQUosSUFBYUQsR0FBbkI7QUFDQXhDLFVBQVFFLElBQVIsQ0FBYSxDQUFDLENBQWQ7QUFDRCxDQXhJQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWlcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBob3BwZmlsZSBmcm9tICcuL2hvcHBmaWxlJ1xuaW1wb3J0IGNyZWF0ZVBhcmFsbGVsIGZyb20gJy4vdGFza3MvcGFyYWxsZWwnXG5cbmNvbnN0IHsgbG9nLCBkZWJ1ZywgZXJyb3IgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIElmIHByb2plY3QgZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQsIGRvIGxvb2t1cCBmb3IgdGhlXG4gICAqIGhvcHBmaWxlLmpzXG4gICAqL1xuICBjb25zdCBwcm9qZWN0RGlyID0gKGRpcmVjdG9yeSA9PiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgZG9uJ3QgbmVlZCBjb3JyZWN0aW5nXG4gICAgaWYgKGRpcmVjdG9yeVswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gc29ydC1vZiByZWxhdGl2ZXMgc2hvdWxkIGJlIG1hZGUgaW50byByZWxhdGl2ZVxuICAgIGlmIChkaXJlY3RvcnlbMF0gIT09ICcuJykge1xuICAgICAgZGlyZWN0b3J5ID0gJy4vJyArIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIG1hcCB0byBjdXJyZW50IGRpcmVjdG9yeVxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgZGlyZWN0b3J5KVxuICB9KShhcmd2LmRpcmVjdG9yeSB8fCBhd2FpdCBob3BwZmlsZS5maW5kKHBhdGguZGlybmFtZShfX2Rpcm5hbWUpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGNvbnN0IGZ1bGxMaXN0ID0gW10uc2xpY2UuY2FsbCh0YXNrcylcblxuICAgIC8vIGxvb3AgdW50aWwgd2Ugd2FsayB0aGUgd2hvbGUgdHJlZVxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgbGVuZ3RoID0gZnVsbExpc3QubGVuZ3RoXG5cbiAgICAgIC8vIGFkZCB0YXNrIGRlcGVuZGVuY2llcyB0byBsaXN0XG4gICAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xuICAgICAgICBpZiAodGFza0RlZm5zW3Rhc2tdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICBmdWxsTGlzdC5wdXNoKHRhc2spXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIG9uY2UgbGVuZ3RoIGlzIHVuY2hhbmdpbmcsIHdlJ3ZlIGhpdCB0aGUgYm90dG9tXG4gICAgICAvLyBvZiB0aGUgdHJlZVxuICAgICAgaWYgKGxlbmd0aCA9PT0gZnVsbExpc3QubGVuZ3RoKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrcy5cbiAgICovXG4gIGxldCBnb2FsXG5cbiAgaWYgKHRhc2tzLmxlbmd0aCA9PT0gMSkge1xuICAgIGxldCBuYW1lID0gdGFza3NbMF1cbiAgICBnb2FsID0gdGFza0RlZm5zW3Rhc2tzWzBdXVxuICAgIFxuICAgIGlmIChnb2FsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGdvYWwgPSBjcmVhdGVQYXJhbGxlbChuYW1lLCBnb2FsLCB0YXNrRGVmbnMpXG4gICAgfVxuICAgIFxuICAgIGdvYWwgPSBnb2FsLnN0YXJ0KG5hbWUpXG4gIH0gZWxzZSB7XG4gICAgZ29hbCA9IFByb21pc2UuYWxsKHRhc2tzLm1hcChuYW1lID0+IHtcbiAgICAgIGxldCB0YXNrID0gdGFza0RlZm5zW25hbWVdXG5cbiAgICAgIGlmICh0YXNrIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGFzayA9IGNyZWF0ZVBhcmFsbGVsKG5hbWUsIHRhc2ssIHRhc2tEZWZucylcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhc2suc3RhcnQobmFtZSlcbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciB0YXNrIGNvbXBsZXRpb24uXG4gICAqL1xuICBhd2FpdCBnb2FsXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgcHJvY2Vzcy5leGl0KC0xKVxufSlcbiJdfQ==