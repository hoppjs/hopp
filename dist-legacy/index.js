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
 * Extend the number of default listeners because 10
 * gets hit pretty quickly with piping streams.
 */
),
    log = _createLogger.log,
    debug = _createLogger.debug,
    error = _createLogger.error;

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
  var projectDir, file, lock, hopp, _resolve, _ref2, _ref3, fromCache, busted, taskDefns, _addDependencies, fullList;

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
          _ref3 = _slicedToArray(_ref2, 3);
          fromCache = _ref3[0];
          busted = _ref3[1];
          taskDefns = _ref3[2];
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
          Goal.defineTasks(taskDefns, busted);
          _context.next = 33;
          return Goal.create(tasks, projectDir

          /**
           * Store cache for later.
           */
          );

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsImFyZ3YiLCJvIiwiXyIsImkiLCJhcmdzIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImhhcm1vbnkiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwiSEFSTU9OWV9GTEFHIiwicmVzb2x2ZSIsImN3ZCIsImZpbmQiLCJkaXJuYW1lIiwiX19kaXJuYW1lIiwicHJvamVjdERpciIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiQXJyYXkiLCJmdWxsTGlzdCIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJzbGljZSIsImNhbGwiLCJkZWZpbmVUYXNrcyIsImNyZWF0ZSIsInNhdmUiLCJjYXRjaCIsImVyciIsInN0YWNrIl0sIm1hcHBpbmdzIjoiOzs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLEk7O0FBQ1o7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7OzJjQWZBOzs7Ozs7b0JBaUI4QixtQkFBYTs7QUFFM0M7Ozs7QUFGOEIsQztJQUF0QkMsRyxpQkFBQUEsRztJQUFLQyxLLGlCQUFBQSxLO0lBQU9DLEssaUJBQUFBLEs7O0FBTXBCQyxRQUFRLFFBQVIsRUFBa0JDLFlBQWxCLENBQStC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TUFBVCxDQUFnQkwsVUFBVUUsSUFBVixFQUFnQixDQUFoQixDQUFoQixDQUFYO0FBQ0FGLDBCQUFVRSxJQUFWLEVBQWdCSSxPQUFoQixDQUF3QjtBQUFBLHlCQUFPTCxpQkFBZ0JNLEdBQWhCLENBQVA7QUFBQSxpQkFBeEI7QUFDRDtBQUNGLGFBWFk7O0FBYWI7OztBQVpBO0FBQ0E7QUFDSUgsb0JBSFMsR0FHRSxHQUFHSSxLQUFILENBQVNDLElBQVQsQ0FBY2pDOztBQUU3QjtBQUZlLGFBSEY7QUFjYjRCLHFCQUFTRSxPQUFULENBQWlCO0FBQUEscUJBQVFMLGlCQUFnQkMsSUFBaEIsQ0FBUjtBQUFBOztBQUVqQjtBQUZBLGNBR0Esb0JBQVNGLFNBQVQsRUFBb0JJLFFBQXBCO0FBQ0Q7O0FBRUQ7OztBQUdBcEQsZUFBSzBELFdBQUwsQ0FBaUJWLFNBQWpCLEVBQTRCRCxNQUE1QjtBQW5HQTtBQUFBLGlCQW9HTS9DLEtBQUsyRCxNQUFMLENBQVluQyxLQUFaLEVBQW1CUzs7QUFFekI7OztBQUZNLFdBcEdOOztBQUFBO0FBQUE7QUFBQSxpQkF5R01sQyxNQUFNNkQsSUFBTixDQUFXM0IsVUFBWCxDQXpHTjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDQUFELEtBMEdJNEIsS0ExR0osQ0EwR1UsZUFBTztBQUNoQnpELFFBQU0wRCxJQUFJQyxLQUFKLElBQWFELEdBQW5CO0FBQ0F6QyxVQUFRRSxJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0QsQ0E3R0EiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIGluZGV4LmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgTW9kdWxlIGZyb20gJ21vZHVsZSdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlSG9wcCBmcm9tICcuL2hvcHAnXG5pbXBvcnQgZnJvbVRyZWUgZnJvbSAnLi90YXNrcy90cmVlJ1xuaW1wb3J0ICogYXMgR29hbCBmcm9tICcuL3Rhc2tzL2dvYWwnXG5pbXBvcnQgKiBhcyBob3BwZmlsZSBmcm9tICcuL2hvcHBmaWxlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuL3V0aWxzL2xvZydcblxuY29uc3QgeyBsb2csIGRlYnVnLCBlcnJvciB9ID0gY3JlYXRlTG9nZ2VyKCdob3BwJylcblxuLyoqXG4gKiBFeHRlbmQgdGhlIG51bWJlciBvZiBkZWZhdWx0IGxpc3RlbmVycyBiZWNhdXNlIDEwXG4gKiBnZXRzIGhpdCBwcmV0dHkgcXVpY2tseSB3aXRoIHBpcGluZyBzdHJlYW1zLlxuICovXG5yZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDUwXG5cbi8qKlxuICogUGFyc2UgYXJnc1xuICovXG5jb25zdCBhcmd2ID0gKGFyZ3MgPT4ge1xuICBjb25zdCBvID0ge1xuICAgIF86IFtdXG4gIH1cblxuICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBsZXQgYSA9IGFyZ3NbaV1cblxuICAgIGlmIChhID09PSAnLWgnIHx8IGEgPT09ICctLWhlbHAnKSBvLmhlbHAgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1WJyB8fCBhID09PSAnLS12ZXJzaW9uJykgby52ZXJzaW9uID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctdicgfHwgYSA9PT0gJy0tdmVyYm9zZScpIG8udmVyYm9zZSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLUgnIHx8IGEgPT09ICctLWhhcm1vbnknKSBvLmhhcm1vbnkgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLUgsIC0taGFybW9ueVxcdGF1dG8tdHJhbnNwaWxlIGhvcHBmaWxlIGZlYXR1cmVzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIEhhcm1vbnkgZmxhZyBmb3IgdHJhbnNwaWxpbmcgaG9wcGZpbGVzLlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID0gcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHIHx8ICEhIGFyZ3YuaGFybW9ueVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgY29uc3QgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kaXJlY3RvcnkgfHwgYXdhaXQgaG9wcGZpbGUuZmluZChwYXRoLmRpcm5hbWUoX19kaXJuYW1lKSkpXG5cbiAgLyoqXG4gICAqIFNldCBob3BwZmlsZSBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgcHJvamVjdC5cbiAgICogXG4gICAqIFRoaXMgd2lsbCBjYXVzZSBlcnJvcnMgbGF0ZXIgaWYgdGhlIGRpcmVjdG9yeSB3YXMgc3VwcGxpZWRcbiAgICogbWFudWFsbHkgYnV0IGNvbnRhaW5zIG5vIGhvcHBmaWxlLiBXZSBkb24ndCB3YW50IHRvIGRvIGEgbWFnaWNcbiAgICogbG9va3VwIGZvciB0aGUgdXNlciBiZWNhdXNlIHRoZXkgb3ZlcnJvZGUgdGhlIG1hZ2ljIHdpdGggdGhlXG4gICAqIG1hbnVhbCBmbGFnLlxuICAgKi9cbiAgY29uc3QgZmlsZSA9IHByb2plY3REaXIgKyAnL2hvcHBmaWxlLmpzJ1xuICBkZWJ1ZygnVXNpbmcgaG9wcGZpbGUuanMgQCAlcycsIGZpbGUpXG5cbiAgLyoqXG4gICAqIExvYWQgY2FjaGUuXG4gICAqL1xuICBjb25zdCBsb2NrID0gYXdhaXQgY2FjaGUubG9hZChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgaG9wcCBpbnN0YW5jZSBjcmVhdG9yLlxuICAgKi9cbiAgY29uc3QgaG9wcCA9IGF3YWl0IGNyZWF0ZUhvcHAocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ2FjaGUgdGhlIGhvcHAgaGFuZGxlciB0byBtYWtlIGByZXF1aXJlKClgIHdvcmtcbiAgICogaW4gdGhlIGhvcHBmaWxlLlxuICAgKi9cbiAgY29uc3QgX3Jlc29sdmUgPSBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZVxuICBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSA9ICh3aGF0LCBwYXJlbnQpID0+IHtcbiAgICByZXR1cm4gd2hhdCA9PT0gJ2hvcHAnID8gd2hhdCA6IF9yZXNvbHZlKHdoYXQsIHBhcmVudClcbiAgfVxuXG4gIHJlcXVpcmUuY2FjaGUuaG9wcCA9IHtcbiAgICBpZDogJ2hvcHAnLFxuICAgIGZpbGVuYW1lOiAnaG9wcCcsXG4gICAgbG9hZGVkOiB0cnVlLFxuICAgIGV4cG9ydHM6IGhvcHBcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHRhc2tzIGZyb20gZmlsZS5cbiAgICovXG4gIGNvbnN0IFtmcm9tQ2FjaGUsIGJ1c3RlZCwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGxldCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyB3YWxrIHRoZSBmdWxsIHRyZWVcbiAgICBmdW5jdGlvbiBhZGREZXBlbmRlbmNpZXModGFzaykge1xuICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZ1bGxMaXN0ID0gZnVsbExpc3QuY29uY2F0KHRhc2tEZWZuc1t0YXNrXVsxXSlcbiAgICAgICAgdGFza0RlZm5zW3Rhc2tdLmZvckVhY2goc3ViID0+IGFkZERlcGVuZGVuY2llcyhzdWIpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdhbGtpbmcgZnJvbSB0b3BcbiAgICBmdWxsTGlzdC5mb3JFYWNoKHRhc2sgPT4gYWRkRGVwZW5kZW5jaWVzKHRhc2spKVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIEdvYWwuZGVmaW5lVGFza3ModGFza0RlZm5zLCBidXN0ZWQpXG4gIGF3YWl0IEdvYWwuY3JlYXRlKHRhc2tzLCBwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBTdG9yZSBjYWNoZSBmb3IgbGF0ZXIuXG4gICAqL1xuICBhd2FpdCBjYWNoZS5zYXZlKHByb2plY3REaXIpXG59KSgpLmNhdGNoKGVyciA9PiB7XG4gIGVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gIHByb2Nlc3MuZXhpdCgtMSlcbn0pXG4iXX0=