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

var _createLogger = (0, _log2.default)('hopp'

/**
 * Parse args
 */
),
    log = _createLogger.log,
    debug = _createLogger.debug,
    error = _createLogger.error;

var argv = function (args) {
  var o = {
    _: []
  };

  for (var i = 2; i < args.length; i += 1) {
    var a = args[i];

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-H' || a === '--harmony') o.harmony = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a[0] !== '-') o._.push(a);
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
  var projectDir, file, lock, hopp, _resolve, _ref2, _ref3, fromCache, taskDefns, _addDependencies, fullList;

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
           * Harmony flag for transpiling hoppfiles.
           */
          );process.env.HARMONY_FLAG = process.env.HARMONY_FLAG || !!argv.harmony;

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
          file = projectDir + '/hoppfile.js';

          debug('Using hoppfile.js @ %s', file

          /**
           * Load cache.
           */
          );_context.next = 15;
          return cache.load(projectDir

          /**
           * Create hopp instance creator.
           */
          );

        case 15:
          lock = _context.sent;
          _context.next = 18;
          return (0, _hopp2.default)(projectDir

          /**
           * Cache the hopp handler to make `require()` work
           * in the hoppfile.
           */
          );

        case 18:
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
          };_context.next = 24;
          return hoppfile.load(file

          /**
           * Parse from cache.
           */
          );

        case 24:
          _ref2 = _context.sent;
          _ref3 = _slicedToArray(_ref2, 2);
          fromCache = _ref3[0];
          taskDefns = _ref3[1];
          if (fromCache) {
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
            fullList = [].slice.call(tasks

            // walk the full tree
            );
            fullList.forEach(function (task) {
              return _addDependencies(task);
            }

            // parse all tasks and their dependencies
            );(0, _tree2.default)(taskDefns, fullList);
          }

          /**
           * Wait for task completion.
           */
          Goal.defineTasks(taskDefns);
          _context.next = 32;
          return Goal.create(tasks, projectDir

          /**
           * Store cache for later.
           */
          );

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJhcmd2IiwibyIsIl8iLCJpIiwiYXJncyIsImxlbmd0aCIsImEiLCJoZWxwIiwidmVyc2lvbiIsInZlcmJvc2UiLCJoYXJtb255IiwiZGlyZWN0b3J5IiwicHVzaCIsInByb2Nlc3MiLCJjb25zb2xlIiwiZXhpdCIsInJlcXVpcmUiLCJ0YXNrcyIsImVudiIsIkhPUFBfREVCVUciLCJIQVJNT05ZX0ZMQUciLCJyZXNvbHZlIiwiY3dkIiwiZmluZCIsImRpcm5hbWUiLCJfX2Rpcm5hbWUiLCJwcm9qZWN0RGlyIiwiZmlsZSIsImxvYWQiLCJsb2NrIiwiaG9wcCIsIl9yZXNvbHZlIiwiX3Jlc29sdmVGaWxlbmFtZSIsIndoYXQiLCJwYXJlbnQiLCJpZCIsImZpbGVuYW1lIiwibG9hZGVkIiwiZXhwb3J0cyIsImZyb21DYWNoZSIsInRhc2tEZWZucyIsImFkZERlcGVuZGVuY2llcyIsInRhc2siLCJBcnJheSIsImZ1bGxMaXN0IiwiY29uY2F0IiwiZm9yRWFjaCIsInN1YiIsInNsaWNlIiwiY2FsbCIsImRlZmluZVRhc2tzIiwiY3JlYXRlIiwic2F2ZSIsImNhdGNoIiwiZXJyIiwic3RhY2siXSwibWFwcGluZ3MiOiI7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUMsSTs7QUFDWjs7SUFBWUMsUTs7QUFDWjs7Ozs7Ozs7MmNBZkE7Ozs7OztvQkFpQjhCLG1CQUFhOztBQUUzQzs7O0FBRjhCLEM7SUFBdEJDLEcsaUJBQUFBLEc7SUFBS0MsSyxpQkFBQUEsSztJQUFPQyxLLGlCQUFBQSxLOztBQUtwQixJQUFNQyxPQUFRLGdCQUFRO0FBQ3BCLE1BQU1DLElBQUk7QUFDUkMsT0FBRztBQURLLEdBQVY7O0FBSUEsT0FBSyxJQUFJQyxJQUFJ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QUFDRDtBQUNGLGFBWFk7O0FBYWI7OztBQVpBO0FBQ0E7QUFDSUgsb0JBSFMsR0FHRSxHQUFHSSxLQUFILENBQVNDLElBQVQsQ0FBY2hDOztBQUU3QjtBQUZlLGFBSEY7QUFjYjJCLHFCQUFTRSxPQUFULENBQWlCO0FBQUEscUJBQVFMLGlCQUFnQkMsSUFBaEIsQ0FBUjtBQUFBOztBQUVqQjtBQUZBLGNBR0Esb0JBQVNGLFNBQVQsRUFBb0JJLFFBQXBCO0FBQ0Q7O0FBRUQ7OztBQUdBakQsZUFBS3VELFdBQUwsQ0FBaUJWLFNBQWpCO0FBbkdBO0FBQUEsaUJBb0dNN0MsS0FBS3dELE1BQUwsQ0FBWWxDLEtBQVosRUFBbUJTOztBQUV6Qjs7O0FBRk0sV0FwR047O0FBQUE7QUFBQTtBQUFBLGlCQXlHTWhDLE1BQU0wRCxJQUFOLENBQVcxQixVQUFYLENBekdOOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQsS0EwR0kyQixLQTFHSixDQTBHVSxlQUFPO0FBQ2hCdEQsUUFBTXVELElBQUlDLEtBQUosSUFBYUQsR0FBbkI7QUFDQXpDLFVBQVFFLElBQVIsQ0FBYSxDQUFDLENBQWQ7QUFDRCxDQTdHQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWlcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBHb2FsIGZyb20gJy4vdGFza3MvZ29hbCdcbmltcG9ydCAqIGFzIGhvcHBmaWxlIGZyb20gJy4vaG9wcGZpbGUnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4vdXRpbHMvbG9nJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSBjcmVhdGVMb2dnZXIoJ2hvcHAnKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1IJyB8fCBhID09PSAnLS1oYXJtb255Jykgby5oYXJtb255ID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctZCcgfHwgYSA9PT0gJy0tZGlyZWN0b3J5Jykgby5kaXJlY3RvcnkgPSBhcmdzWysraV1cbiAgICBlbHNlIGlmIChhWzBdICE9PSAnLScpIG8uXy5wdXNoKGEpXG4gIH1cblxuICByZXR1cm4gb1xufSkocHJvY2Vzcy5hcmd2KVxuXG4vKipcbiAqIFByaW50IGhlbHAuXG4gKi9cbmZ1bmN0aW9uIGhlbHAoKSB7XG4gIGNvbnNvbGUubG9nKCd1c2FnZTogaG9wcCBbT1BUSU9OU10gW1RBU0tTXScpXG4gIGNvbnNvbGUubG9nKCcnKVxuICBjb25zb2xlLmxvZygnICAtZCwgLS1kaXJlY3RvcnkgW2Rpcl1cXHRwYXRoIHRvIHByb2plY3QgZGlyZWN0b3J5JylcbiAgY29uc29sZS5sb2coJyAgLXYsIC0tdmVyYm9zZVxcdGVuYWJsZSBkZWJ1ZyBtZXNzYWdlcycpXG4gIGNvbnNvbGUubG9nKCcgIC1ILCAtLWhhcm1vbnlcXHRhdXRvLXRyYW5zcGlsZSBob3BwZmlsZSBmZWF0dXJlcycpXG4gIGNvbnNvbGUubG9nKCcgIC1WLCAtLXZlcnNpb25cXHRnZXQgdmVyc2lvbiBpbmZvJylcbiAgY29uc29sZS5sb2coJyAgLWgsIC0taGVscFxcdGRpc3BsYXkgdGhpcyBtZXNzYWdlJylcblxuICBwcm9jZXNzLmV4aXQoMSlcbn1cblxuaWYgKGFyZ3YudmVyc2lvbikge1xuICBjb25zb2xlLmxvZyhyZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uKVxuICBwcm9jZXNzLmV4aXQoMClcbn1cblxuLyoqXG4gKiBDdXJyZW50bHkgdGhlIG9ubHkgd2F5IGZvciBoZWxwIHRvIGJlIGNhbGxlZC5cbiAqIExhdGVyLCBpdCBzaG91bGQgYWxzbyBoYXBwZW4gb24gaW52YWxpZCBhcmdzIGJ1dCB3ZVxuICogZG9uJ3QgaGF2ZSBpbnZhbGlkIGFyZ3VtZW50cyB5ZXQuXG4gKiBcbiAqIEludmFsaWQgYXJndW1lbnRzIGlzIGEgZmxhZyBtaXN1c2UgLSBuZXZlciBhIG1pc3NpbmdcbiAqIHRhc2suIFRoYXQgZXJyb3Igc2hvdWxkIGJlIG1vcmUgbWluaW1hbCBhbmQgc2VwYXJhdGUuXG4gKi9cbmlmIChhcmd2LmhlbHApIHtcbiAgaGVscCgpXG59XG5cbi8qKlxuICogU2V0IHRhc2tzLlxuICovXG5jb25zdCB0YXNrcyA9IGFyZ3YuXy5sZW5ndGggPT09IDAgPyBbJ2RlZmF1bHQnXSA6IGFyZ3YuX1xuXG47KGFzeW5jICgpID0+IHtcbiAgLyoqXG4gICAqIFBhc3MgdmVyYm9zaXR5IHRocm91Z2ggdG8gdGhlIGVudi5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhPUFBfREVCVUcgPSBwcm9jZXNzLmVudi5IT1BQX0RFQlVHIHx8ICEhIGFyZ3YudmVyYm9zZVxuICBkZWJ1ZygnU2V0dGluZyBIT1BQX0RFQlVHID0gJWonLCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHKVxuXG4gIC8qKlxuICAgKiBIYXJtb255IGZsYWcgZm9yIHRyYW5zcGlsaW5nIGhvcHBmaWxlcy5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyA9IHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyB8fCAhISBhcmd2Lmhhcm1vbnlcblxuICAvKipcbiAgICogSWYgcHJvamVjdCBkaXJlY3Rvcnkgbm90IHNwZWNpZmllZCwgZG8gbG9va3VwIGZvciB0aGVcbiAgICogaG9wcGZpbGUuanNcbiAgICovXG4gIGNvbnN0IHByb2plY3REaXIgPSAoZGlyZWN0b3J5ID0+IHtcbiAgICAvLyBhYnNvbHV0ZSBwYXRocyBkb24ndCBuZWVkIGNvcnJlY3RpbmdcbiAgICBpZiAoZGlyZWN0b3J5WzBdID09PSAnLycpIHtcbiAgICAgIHJldHVybiBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBzb3J0LW9mIHJlbGF0aXZlcyBzaG91bGQgYmUgbWFkZSBpbnRvIHJlbGF0aXZlXG4gICAgaWYgKGRpcmVjdG9yeVswXSAhPT0gJy4nKSB7XG4gICAgICBkaXJlY3RvcnkgPSAnLi8nICsgZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gbWFwIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBkaXJlY3RvcnkpXG4gIH0pKGFyZ3YuZGlyZWN0b3J5IHx8IGF3YWl0IGhvcHBmaWxlLmZpbmQocGF0aC5kaXJuYW1lKF9fZGlybmFtZSkpKVxuXG4gIC8qKlxuICAgKiBTZXQgaG9wcGZpbGUgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIHByb2plY3QuXG4gICAqIFxuICAgKiBUaGlzIHdpbGwgY2F1c2UgZXJyb3JzIGxhdGVyIGlmIHRoZSBkaXJlY3Rvcnkgd2FzIHN1cHBsaWVkXG4gICAqIG1hbnVhbGx5IGJ1dCBjb250YWlucyBubyBob3BwZmlsZS4gV2UgZG9uJ3Qgd2FudCB0byBkbyBhIG1hZ2ljXG4gICAqIGxvb2t1cCBmb3IgdGhlIHVzZXIgYmVjYXVzZSB0aGV5IG92ZXJyb2RlIHRoZSBtYWdpYyB3aXRoIHRoZVxuICAgKiBtYW51YWwgZmxhZy5cbiAgICovXG4gIGNvbnN0IGZpbGUgPSBwcm9qZWN0RGlyICsgJy9ob3BwZmlsZS5qcydcbiAgZGVidWcoJ1VzaW5nIGhvcHBmaWxlLmpzIEAgJXMnLCBmaWxlKVxuXG4gIC8qKlxuICAgKiBMb2FkIGNhY2hlLlxuICAgKi9cbiAgY29uc3QgbG9jayA9IGF3YWl0IGNhY2hlLmxvYWQocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ3JlYXRlIGhvcHAgaW5zdGFuY2UgY3JlYXRvci5cbiAgICovXG4gIGNvbnN0IGhvcHAgPSBhd2FpdCBjcmVhdGVIb3BwKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENhY2hlIHRoZSBob3BwIGhhbmRsZXIgdG8gbWFrZSBgcmVxdWlyZSgpYCB3b3JrXG4gICAqIGluIHRoZSBob3BwZmlsZS5cbiAgICovXG4gIGNvbnN0IF9yZXNvbHZlID0gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWVcbiAgTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgPSAod2hhdCwgcGFyZW50KSA9PiB7XG4gICAgcmV0dXJuIHdoYXQgPT09ICdob3BwJyA/IHdoYXQgOiBfcmVzb2x2ZSh3aGF0LCBwYXJlbnQpXG4gIH1cblxuICByZXF1aXJlLmNhY2hlLmhvcHAgPSB7XG4gICAgaWQ6ICdob3BwJyxcbiAgICBmaWxlbmFtZTogJ2hvcHAnLFxuICAgIGxvYWRlZDogdHJ1ZSxcbiAgICBleHBvcnRzOiBob3BwXG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0YXNrcyBmcm9tIGZpbGUuXG4gICAqL1xuICBjb25zdCBbZnJvbUNhY2hlLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIC8vIGNyZWF0ZSBjb3B5IG9mIHRhc2tzLCB3ZSBkb24ndCB3YW50IHRvIG1vZGlmeVxuICAgIC8vIHRoZSBhY3R1YWwgZ29hbCBsaXN0XG4gICAgbGV0IGZ1bGxMaXN0ID0gW10uc2xpY2UuY2FsbCh0YXNrcylcblxuICAgIC8vIHdhbGsgdGhlIGZ1bGwgdHJlZVxuICAgIGZ1bmN0aW9uIGFkZERlcGVuZGVuY2llcyh0YXNrKSB7XG4gICAgICBpZiAodGFza0RlZm5zW3Rhc2tdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZnVsbExpc3QgPSBmdWxsTGlzdC5jb25jYXQodGFza0RlZm5zW3Rhc2tdWzFdKVxuICAgICAgICB0YXNrRGVmbnNbdGFza10uZm9yRWFjaChzdWIgPT4gYWRkRGVwZW5kZW5jaWVzKHN1YikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3RhcnQgd2Fsa2luZyBmcm9tIHRvcFxuICAgIGZ1bGxMaXN0LmZvckVhY2godGFzayA9PiBhZGREZXBlbmRlbmNpZXModGFzaykpXG5cbiAgICAvLyBwYXJzZSBhbGwgdGFza3MgYW5kIHRoZWlyIGRlcGVuZGVuY2llc1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgZnVsbExpc3QpXG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGFzayBjb21wbGV0aW9uLlxuICAgKi9cbiAgR29hbC5kZWZpbmVUYXNrcyh0YXNrRGVmbnMpXG4gIGF3YWl0IEdvYWwuY3JlYXRlKHRhc2tzLCBwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBTdG9yZSBjYWNoZSBmb3IgbGF0ZXIuXG4gICAqL1xuICBhd2FpdCBjYWNoZS5zYXZlKHByb2plY3REaXIpXG59KSgpLmNhdGNoKGVyciA9PiB7XG4gIGVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gIHByb2Nlc3MuZXhpdCgtMSlcbn0pXG4iXX0=