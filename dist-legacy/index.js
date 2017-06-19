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

var _goal = require('./tasks/goal');

var Goal = _interopRequireWildcard(_goal);

var _hoppfile = require('./hoppfile');

var hoppfile = _interopRequireWildcard(_hoppfile);

var _log = require('./utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file index.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _createLogger = (0, _log2.default)('hopp'),
    log = _createLogger.log,
    debug = _createLogger.debug,
    error = _createLogger.error;

/**
 * Extend the number of default listeners because 10
 * gets hit pretty quickly with piping streams.
 */


require('events').EventEmitter.defaultMaxListeners = 50;

/**
 * Parse args
 */
var argv = function (args) {
  var o = {
    _: []
  };

  for (var i = 2; i < args.length; i += 1) {
    var a = args[i];

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-H' || a === '--harmony') o.harmony = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a[0] !== '-') o._.push(a);
  }

  return o;
}(process.argv);

/**
 * Print help.
 */
function help() {
  console.log('usage: hopp [OPTIONS] [TASKS]');
  console.log('');
  console.log('  -d, --directory [dir]\tpath to project directory');
  console.log('  -v, --verbose\tenable debug messages');
  console.log('  -H, --harmony\tauto-transpile hoppfile features');
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
  var projectDir, file, lock, hopp, _resolve, _ref2, _ref3, fromCache, busted, taskDefns, _addDependencies, fullList;

  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          /**
           * Pass verbosity through to the env.
           */
          process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !!argv.verbose;
          debug('Setting HOPP_DEBUG = %j', process.env.HOPP_DEBUG);

          /**
           * Harmony flag for transpiling hoppfiles.
           */
          process.env.HARMONY_FLAG = process.env.HARMONY_FLAG || !!argv.harmony;

          /**
           * If project directory not specified, do lookup for the
           * hoppfile.js
           */

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
            _context.next = 9;
            break;
          }

          _context.next = 8;
          return hoppfile.find(_path2.default.dirname(__dirname));

        case 8:
          _context.t1 = _context.sent;

        case 9:
          _context.t2 = _context.t1;
          projectDir = (0, _context.t0)(_context.t2);


          /**
           * Set hoppfile location relative to the project.
           * 
           * This will cause errors later if the directory was supplied
           * manually but contains no hoppfile. We don't want to do a magic
           * lookup for the user because they overrode the magic with the
           * manual flag.
           */
          file = projectDir + '/hoppfile.js';

          debug('Using hoppfile.js @ %s', file);

          /**
           * Load cache.
           */
          _context.next = 15;
          return cache.load(projectDir);

        case 15:
          lock = _context.sent;
          _context.next = 18;
          return (0, _hopp2.default)(projectDir);

        case 18:
          hopp = _context.sent;


          /**
           * Cache the hopp handler to make `require()` work
           * in the hoppfile.
           */
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
          };_context.next = 24;
          return hoppfile.load(file);

        case 24:
          _ref2 = _context.sent;
          _ref3 = _slicedToArray(_ref2, 3);
          fromCache = _ref3[0];
          busted = _ref3[1];
          taskDefns = _ref3[2];


          /**
           * Parse from cache.
           */
          if (fromCache) {

            // walk the full tree
            _addDependencies = function _addDependencies(task) {
              if (taskDefns[task] instanceof Array) {
                fullList = fullList.concat(taskDefns[task][1]);
                taskDefns[task].forEach(function (sub) {
                  return _addDependencies(sub);
                });
              }
            };

            // start walking from top


            // create copy of tasks, we don't want to modify
            // the actual goal list
            fullList = [].slice.call(tasks);
            fullList.forEach(function (task) {
              return _addDependencies(task);
            });

            // parse all tasks and their dependencies
            (0, _tree2.default)(taskDefns, fullList);
          }

          /**
           * Wait for task completion.
           */
          Goal.defineTasks(taskDefns, busted);
          _context.next = 33;
          return Goal.create(tasks, projectDir);

        case 33:
          _context.next = 35;
          return cache.save(projectDir);

        case 35:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
}))().catch(function (err) {
  error(err.stack || err);
  process.exit(-1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsImFyZ3YiLCJvIiwiXyIsImkiLCJhcmdzIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImhhcm1vbnkiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwiSEFSTU9OWV9GTEFHIiwicmVzb2x2ZSIsImN3ZCIsImZpbmQiLCJkaXJuYW1lIiwiX19kaXJuYW1lIiwicHJvamVjdERpciIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiQXJyYXkiLCJmdWxsTGlzdCIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJzbGljZSIsImNhbGwiLCJkZWZpbmVUYXNrcyIsImNyZWF0ZSIsInNhdmUiLCJjYXRjaCIsImVyciIsInN0YWNrIl0sIm1hcHBpbmdzIjoiOzs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLEk7O0FBQ1o7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7OzJjQWZBOzs7Ozs7b0JBaUI4QixtQkFBYSxNQUFiLEM7SUFBdEJDLEcsaUJBQUFBLEc7SUFBS0MsSyxpQkFBQUEsSztJQUFPQyxLLGlCQUFBQSxLOztBQUVwQjs7Ozs7O0FBSUFDLFFBQVEsUUFBUixFQUFrQkMsWUFBbEIsQ0FBK0JD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QSxTQUFTQyxNQUFULENBQWdCTCxVQUFVRSxJQUFWLEVBQWdCLENBQWhCLENBQWhCLENBQVg7QUFDQUYsMEJBQVVFLElBQVYsRUFBZ0JJLE9BQWhCLENBQXdCO0FBQUEseUJBQU9MLGlCQUFnQk0sR0FBaEIsQ0FBUDtBQUFBLGlCQUF4QjtBQUNEO0FBQ0YsYUFYWTs7QUFhYjs7O0FBWkE7QUFDQTtBQUNJSCxvQkFIUyxHQUdFLEdBQUdJLEtBQUgsQ0FBU0MsSUFBVCxDQUFjakMsS0FBZCxDQUhGO0FBY2I0QixxQkFBU0UsT0FBVCxDQUFpQjtBQUFBLHFCQUFRTCxpQkFBZ0JDLElBQWhCLENBQVI7QUFBQSxhQUFqQjs7QUFFQTtBQUNBLGdDQUFTRixTQUFULEVBQW9CSSxRQUFwQjtBQUNEOztBQUVEOzs7QUFHQXBELGVBQUswRCxXQUFMLENBQWlCVixTQUFqQixFQUE0QkQsTUFBNUI7QUFuR0E7QUFBQSxpQkFvR00vQyxLQUFLMkQsTUFBTCxDQUFZbkMsS0FBWixFQUFtQlMsVUFBbkIsQ0FwR047O0FBQUE7QUFBQTtBQUFBLGlCQXlHTWxDLE1BQU02RCxJQUFOLENBQVczQixVQUFYLENBekdOOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQsS0EwR0k0QixLQTFHSixDQTBHVSxlQUFPO0FBQ2hCekQsUUFBTTBELElBQUlDLEtBQUosSUFBYUQsR0FBbkI7QUFDQXpDLFVBQVFFLElBQVIsQ0FBYSxDQUFDLENBQWQ7QUFDRCxDQTdHQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWlcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBHb2FsIGZyb20gJy4vdGFza3MvZ29hbCdcbmltcG9ydCAqIGFzIGhvcHBmaWxlIGZyb20gJy4vaG9wcGZpbGUnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4vdXRpbHMvbG9nJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSBjcmVhdGVMb2dnZXIoJ2hvcHAnKVxuXG4vKipcbiAqIEV4dGVuZCB0aGUgbnVtYmVyIG9mIGRlZmF1bHQgbGlzdGVuZXJzIGJlY2F1c2UgMTBcbiAqIGdldHMgaGl0IHByZXR0eSBxdWlja2x5IHdpdGggcGlwaW5nIHN0cmVhbXMuXG4gKi9cbnJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gNTBcblxuLyoqXG4gKiBQYXJzZSBhcmdzXG4gKi9cbmNvbnN0IGFyZ3YgPSAoYXJncyA9PiB7XG4gIGNvbnN0IG8gPSB7XG4gICAgXzogW11cbiAgfVxuXG4gIGZvciAobGV0IGkgPSAyOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGxldCBhID0gYXJnc1tpXVxuXG4gICAgaWYgKGEgPT09ICctaCcgfHwgYSA9PT0gJy0taGVscCcpIG8uaGVscCA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLVYnIHx8IGEgPT09ICctLXZlcnNpb24nKSBvLnZlcnNpb24gPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy12JyB8fCBhID09PSAnLS12ZXJib3NlJykgby52ZXJib3NlID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctSCcgfHwgYSA9PT0gJy0taGFybW9ueScpIG8uaGFybW9ueSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLWQnIHx8IGEgPT09ICctLWRpcmVjdG9yeScpIG8uZGlyZWN0b3J5ID0gYXJnc1srK2ldXG4gICAgZWxzZSBpZiAoYVswXSAhPT0gJy0nKSBvLl8ucHVzaChhKVxuICB9XG5cbiAgcmV0dXJuIG9cbn0pKHByb2Nlc3MuYXJndilcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgY29uc29sZS5sb2coJyAgLWQsIC0tZGlyZWN0b3J5IFtkaXJdXFx0cGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeScpXG4gIGNvbnNvbGUubG9nKCcgIC12LCAtLXZlcmJvc2VcXHRlbmFibGUgZGVidWcgbWVzc2FnZXMnKVxuICBjb25zb2xlLmxvZygnICAtSCwgLS1oYXJtb255XFx0YXV0by10cmFuc3BpbGUgaG9wcGZpbGUgZmVhdHVyZXMnKVxuICBjb25zb2xlLmxvZygnICAtViwgLS12ZXJzaW9uXFx0Z2V0IHZlcnNpb24gaW5mbycpXG4gIGNvbnNvbGUubG9nKCcgIC1oLCAtLWhlbHBcXHRkaXNwbGF5IHRoaXMgbWVzc2FnZScpXG5cbiAgcHJvY2Vzcy5leGl0KDEpXG59XG5cbmlmIChhcmd2LnZlcnNpb24pIHtcbiAgY29uc29sZS5sb2cocmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvbilcbiAgcHJvY2Vzcy5leGl0KDApXG59XG5cbi8qKlxuICogQ3VycmVudGx5IHRoZSBvbmx5IHdheSBmb3IgaGVscCB0byBiZSBjYWxsZWQuXG4gKiBMYXRlciwgaXQgc2hvdWxkIGFsc28gaGFwcGVuIG9uIGludmFsaWQgYXJncyBidXQgd2VcbiAqIGRvbid0IGhhdmUgaW52YWxpZCBhcmd1bWVudHMgeWV0LlxuICogXG4gKiBJbnZhbGlkIGFyZ3VtZW50cyBpcyBhIGZsYWcgbWlzdXNlIC0gbmV2ZXIgYSBtaXNzaW5nXG4gKiB0YXNrLiBUaGF0IGVycm9yIHNob3VsZCBiZSBtb3JlIG1pbmltYWwgYW5kIHNlcGFyYXRlLlxuICovXG5pZiAoYXJndi5oZWxwKSB7XG4gIGhlbHAoKVxufVxuXG4vKipcbiAqIFNldCB0YXNrcy5cbiAqL1xuY29uc3QgdGFza3MgPSBhcmd2Ll8ubGVuZ3RoID09PSAwID8gWydkZWZhdWx0J10gOiBhcmd2Ll9cblxuOyhhc3luYyAoKSA9PiB7XG4gIC8qKlxuICAgKiBQYXNzIHZlcmJvc2l0eSB0aHJvdWdoIHRvIHRoZSBlbnYuXG4gICAqL1xuICBwcm9jZXNzLmVudi5IT1BQX0RFQlVHID0gcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyB8fCAhISBhcmd2LnZlcmJvc2VcbiAgZGVidWcoJ1NldHRpbmcgSE9QUF9ERUJVRyA9ICVqJywgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRylcblxuICAvKipcbiAgICogSGFybW9ueSBmbGFnIGZvciB0cmFuc3BpbGluZyBob3BwZmlsZXMuXG4gICAqL1xuICBwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgPSBwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgfHwgISEgYXJndi5oYXJtb255XG5cbiAgLyoqXG4gICAqIElmIHByb2plY3QgZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQsIGRvIGxvb2t1cCBmb3IgdGhlXG4gICAqIGhvcHBmaWxlLmpzXG4gICAqL1xuICBjb25zdCBwcm9qZWN0RGlyID0gKGRpcmVjdG9yeSA9PiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgZG9uJ3QgbmVlZCBjb3JyZWN0aW5nXG4gICAgaWYgKGRpcmVjdG9yeVswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gc29ydC1vZiByZWxhdGl2ZXMgc2hvdWxkIGJlIG1hZGUgaW50byByZWxhdGl2ZVxuICAgIGlmIChkaXJlY3RvcnlbMF0gIT09ICcuJykge1xuICAgICAgZGlyZWN0b3J5ID0gJy4vJyArIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIG1hcCB0byBjdXJyZW50IGRpcmVjdG9yeVxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgZGlyZWN0b3J5KVxuICB9KShhcmd2LmRpcmVjdG9yeSB8fCBhd2FpdCBob3BwZmlsZS5maW5kKHBhdGguZGlybmFtZShfX2Rpcm5hbWUpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgYnVzdGVkLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIC8vIGNyZWF0ZSBjb3B5IG9mIHRhc2tzLCB3ZSBkb24ndCB3YW50IHRvIG1vZGlmeVxuICAgIC8vIHRoZSBhY3R1YWwgZ29hbCBsaXN0XG4gICAgbGV0IGZ1bGxMaXN0ID0gW10uc2xpY2UuY2FsbCh0YXNrcylcblxuICAgIC8vIHdhbGsgdGhlIGZ1bGwgdHJlZVxuICAgIGZ1bmN0aW9uIGFkZERlcGVuZGVuY2llcyh0YXNrKSB7XG4gICAgICBpZiAodGFza0RlZm5zW3Rhc2tdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZnVsbExpc3QgPSBmdWxsTGlzdC5jb25jYXQodGFza0RlZm5zW3Rhc2tdWzFdKVxuICAgICAgICB0YXNrRGVmbnNbdGFza10uZm9yRWFjaChzdWIgPT4gYWRkRGVwZW5kZW5jaWVzKHN1YikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3RhcnQgd2Fsa2luZyBmcm9tIHRvcFxuICAgIGZ1bGxMaXN0LmZvckVhY2godGFzayA9PiBhZGREZXBlbmRlbmNpZXModGFzaykpXG5cbiAgICAvLyBwYXJzZSBhbGwgdGFza3MgYW5kIHRoZWlyIGRlcGVuZGVuY2llc1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgZnVsbExpc3QpXG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGFzayBjb21wbGV0aW9uLlxuICAgKi9cbiAgR29hbC5kZWZpbmVUYXNrcyh0YXNrRGVmbnMsIGJ1c3RlZClcbiAgYXdhaXQgR29hbC5jcmVhdGUodGFza3MsIHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgcHJvY2Vzcy5leGl0KC0xKVxufSlcbiJdfQ==