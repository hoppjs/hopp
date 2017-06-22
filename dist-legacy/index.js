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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
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
 * This is resolved to the directory with a hoppfile later
 * on but it is globally scoped in this module so that we can
 * save debug logs to it.
 */
var projectDir = process.cwd();

/**
 * Parse args
 */
var argv = function (args) {
  var o = {
    _: []
  };

  for (var i = 2; i < args.length; i += 1) {
    var a = args[i];

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-H' || a === '--harmony') o.harmony = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a === '-r' || a === '--recache') process.env.RECACHE = true;else if (a[0] !== '-') o._.push(a);
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
  console.log('  -H, --harmony\tauto-transpile hoppfile with babel');
  console.log('  -r, --recache\tforce cache busting');
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
  var file, lock, hopp, _resolve, _ref2, _ref3, fromCache, busted, taskDefns, _addDependencies, fullList;

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
          return hoppfile.find(process.cwd());

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
  function end(lastErr) {
    error(lastErr && lastErr.stack ? lastErr.stack : lastErr);
    process.exit(-1);
  }

  _log2.default.saveLog(projectDir).then(function () {
    return end(err);
  }).catch(function (err) {
    return end(err);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsInByb2plY3REaXIiLCJwcm9jZXNzIiwiY3dkIiwiYXJndiIsIm8iLCJfIiwiaSIsImFyZ3MiLCJsZW5ndGgiLCJhIiwiaGVscCIsInZlcnNpb24iLCJ2ZXJib3NlIiwiaGFybW9ueSIsImRpcmVjdG9yeSIsImVudiIsIlJFQ0FDSEUiLCJwdXNoIiwiY29uc29sZSIsImV4aXQiLCJ0YXNrcyIsIkhPUFBfREVCVUciLCJIQVJNT05ZX0ZMQUciLCJyZXNvbHZlIiwiZmluZCIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiQXJyYXkiLCJmdWxsTGlzdCIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJzbGljZSIsImNhbGwiLCJkZWZpbmVUYXNrcyIsImNyZWF0ZSIsInNhdmUiLCJjYXRjaCIsImVuZCIsImxhc3RFcnIiLCJzdGFjayIsInNhdmVMb2ciLCJ0aGVuIiwiZXJyIl0sIm1hcHBpbmdzIjoiOzs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLEk7O0FBQ1o7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7OzJjQWZBOzs7Ozs7b0JBaUI4QixtQkFBYSxNQUFiLEM7SUFBdEJDLEcsaUJBQUFBLEc7SUFBS0MsSyxpQkFBQUEsSztJQUFPQyxLLGlCQUFBQSxLOztBQUVwQjs7Ozs7O0FBSUFDLFFBQVEsUUFB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QyxPQUFiLENBQXFCeEQsVUFBckIsRUFDR3lELElBREgsQ0FDUTtBQUFBLFdBQU1KLElBQUlLLEdBQUosQ0FBTjtBQUFBLEdBRFIsRUFFR04sS0FGSCxDQUVTO0FBQUEsV0FBT0MsSUFBSUssR0FBSixDQUFQO0FBQUEsR0FGVDtBQUdELENBbkhBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBpbmRleC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBHb2FsIGZyb20gJy4vdGFza3MvZ29hbCdcbmltcG9ydCAqIGFzIGhvcHBmaWxlIGZyb20gJy4vaG9wcGZpbGUnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4vdXRpbHMvbG9nJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSBjcmVhdGVMb2dnZXIoJ2hvcHAnKVxuXG4vKipcbiAqIEV4dGVuZCB0aGUgbnVtYmVyIG9mIGRlZmF1bHQgbGlzdGVuZXJzIGJlY2F1c2UgMTBcbiAqIGdldHMgaGl0IHByZXR0eSBxdWlja2x5IHdpdGggcGlwaW5nIHN0cmVhbXMuXG4gKi9cbnJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gNTBcblxuLyoqXG4gKiBUaGlzIGlzIHJlc29sdmVkIHRvIHRoZSBkaXJlY3Rvcnkgd2l0aCBhIGhvcHBmaWxlIGxhdGVyXG4gKiBvbiBidXQgaXQgaXMgZ2xvYmFsbHkgc2NvcGVkIGluIHRoaXMgbW9kdWxlIHNvIHRoYXQgd2UgY2FuXG4gKiBzYXZlIGRlYnVnIGxvZ3MgdG8gaXQuXG4gKi9cbmxldCBwcm9qZWN0RGlyID0gcHJvY2Vzcy5jd2QoKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1IJyB8fCBhID09PSAnLS1oYXJtb255Jykgby5oYXJtb255ID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctZCcgfHwgYSA9PT0gJy0tZGlyZWN0b3J5Jykgby5kaXJlY3RvcnkgPSBhcmdzWysraV1cbiAgICBlbHNlIGlmIChhID09PSAnLXInIHx8IGEgPT09ICctLXJlY2FjaGUnKSBwcm9jZXNzLmVudi5SRUNBQ0hFID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtSCwgLS1oYXJtb255XFx0YXV0by10cmFuc3BpbGUgaG9wcGZpbGUgd2l0aCBiYWJlbCcpXG4gIGNvbnNvbGUubG9nKCcgIC1yLCAtLXJlY2FjaGVcXHRmb3JjZSBjYWNoZSBidXN0aW5nJylcbiAgY29uc29sZS5sb2coJyAgLXYsIC0tdmVyYm9zZVxcdGVuYWJsZSBkZWJ1ZyBtZXNzYWdlcycpXG4gIGNvbnNvbGUubG9nKCcgIC1WLCAtLXZlcnNpb25cXHRnZXQgdmVyc2lvbiBpbmZvJylcbiAgY29uc29sZS5sb2coJyAgLWgsIC0taGVscFxcdGRpc3BsYXkgdGhpcyBtZXNzYWdlJylcblxuICBwcm9jZXNzLmV4aXQoMSlcbn1cblxuaWYgKGFyZ3YudmVyc2lvbikge1xuICBjb25zb2xlLmxvZyhyZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uKVxuICBwcm9jZXNzLmV4aXQoMClcbn1cblxuLyoqXG4gKiBDdXJyZW50bHkgdGhlIG9ubHkgd2F5IGZvciBoZWxwIHRvIGJlIGNhbGxlZC5cbiAqIExhdGVyLCBpdCBzaG91bGQgYWxzbyBoYXBwZW4gb24gaW52YWxpZCBhcmdzIGJ1dCB3ZVxuICogZG9uJ3QgaGF2ZSBpbnZhbGlkIGFyZ3VtZW50cyB5ZXQuXG4gKiBcbiAqIEludmFsaWQgYXJndW1lbnRzIGlzIGEgZmxhZyBtaXN1c2UgLSBuZXZlciBhIG1pc3NpbmdcbiAqIHRhc2suIFRoYXQgZXJyb3Igc2hvdWxkIGJlIG1vcmUgbWluaW1hbCBhbmQgc2VwYXJhdGUuXG4gKi9cbmlmIChhcmd2LmhlbHApIHtcbiAgaGVscCgpXG59XG5cbi8qKlxuICogU2V0IHRhc2tzLlxuICovXG5jb25zdCB0YXNrcyA9IGFyZ3YuXy5sZW5ndGggPT09IDAgPyBbJ2RlZmF1bHQnXSA6IGFyZ3YuX1xuXG47KGFzeW5jICgpID0+IHtcbiAgLyoqXG4gICAqIFBhc3MgdmVyYm9zaXR5IHRocm91Z2ggdG8gdGhlIGVudi5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhPUFBfREVCVUcgPSBwcm9jZXNzLmVudi5IT1BQX0RFQlVHIHx8ICEhIGFyZ3YudmVyYm9zZVxuICBkZWJ1ZygnU2V0dGluZyBIT1BQX0RFQlVHID0gJWonLCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHKVxuXG4gIC8qKlxuICAgKiBIYXJtb255IGZsYWcgZm9yIHRyYW5zcGlsaW5nIGhvcHBmaWxlcy5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyA9IHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyB8fCAhISBhcmd2Lmhhcm1vbnlcblxuICAvKipcbiAgICogSWYgcHJvamVjdCBkaXJlY3Rvcnkgbm90IHNwZWNpZmllZCwgZG8gbG9va3VwIGZvciB0aGVcbiAgICogaG9wcGZpbGUuanNcbiAgICovXG4gIHByb2plY3REaXIgPSAoZGlyZWN0b3J5ID0+IHtcbiAgICAvLyBhYnNvbHV0ZSBwYXRocyBkb24ndCBuZWVkIGNvcnJlY3RpbmdcbiAgICBpZiAoZGlyZWN0b3J5WzBdID09PSAnLycpIHtcbiAgICAgIHJldHVybiBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBzb3J0LW9mIHJlbGF0aXZlcyBzaG91bGQgYmUgbWFkZSBpbnRvIHJlbGF0aXZlXG4gICAgaWYgKGRpcmVjdG9yeVswXSAhPT0gJy4nKSB7XG4gICAgICBkaXJlY3RvcnkgPSAnLi8nICsgZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gbWFwIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBkaXJlY3RvcnkpXG4gIH0pKGFyZ3YuZGlyZWN0b3J5IHx8IGF3YWl0IGhvcHBmaWxlLmZpbmQocHJvY2Vzcy5jd2QoKSkpXG5cbiAgLyoqXG4gICAqIFNldCBob3BwZmlsZSBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgcHJvamVjdC5cbiAgICogXG4gICAqIFRoaXMgd2lsbCBjYXVzZSBlcnJvcnMgbGF0ZXIgaWYgdGhlIGRpcmVjdG9yeSB3YXMgc3VwcGxpZWRcbiAgICogbWFudWFsbHkgYnV0IGNvbnRhaW5zIG5vIGhvcHBmaWxlLiBXZSBkb24ndCB3YW50IHRvIGRvIGEgbWFnaWNcbiAgICogbG9va3VwIGZvciB0aGUgdXNlciBiZWNhdXNlIHRoZXkgb3ZlcnJvZGUgdGhlIG1hZ2ljIHdpdGggdGhlXG4gICAqIG1hbnVhbCBmbGFnLlxuICAgKi9cbiAgY29uc3QgZmlsZSA9IHByb2plY3REaXIgKyAnL2hvcHBmaWxlLmpzJ1xuICBkZWJ1ZygnVXNpbmcgaG9wcGZpbGUuanMgQCAlcycsIGZpbGUpXG5cbiAgLyoqXG4gICAqIExvYWQgY2FjaGUuXG4gICAqL1xuICBjb25zdCBsb2NrID0gYXdhaXQgY2FjaGUubG9hZChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgaG9wcCBpbnN0YW5jZSBjcmVhdG9yLlxuICAgKi9cbiAgY29uc3QgaG9wcCA9IGF3YWl0IGNyZWF0ZUhvcHAocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ2FjaGUgdGhlIGhvcHAgaGFuZGxlciB0byBtYWtlIGByZXF1aXJlKClgIHdvcmtcbiAgICogaW4gdGhlIGhvcHBmaWxlLlxuICAgKi9cbiAgY29uc3QgX3Jlc29sdmUgPSBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZVxuICBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSA9ICh3aGF0LCBwYXJlbnQpID0+IHtcbiAgICByZXR1cm4gd2hhdCA9PT0gJ2hvcHAnID8gd2hhdCA6IF9yZXNvbHZlKHdoYXQsIHBhcmVudClcbiAgfVxuXG4gIHJlcXVpcmUuY2FjaGUuaG9wcCA9IHtcbiAgICBpZDogJ2hvcHAnLFxuICAgIGZpbGVuYW1lOiAnaG9wcCcsXG4gICAgbG9hZGVkOiB0cnVlLFxuICAgIGV4cG9ydHM6IGhvcHBcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHRhc2tzIGZyb20gZmlsZS5cbiAgICovXG4gIGNvbnN0IFtmcm9tQ2FjaGUsIGJ1c3RlZCwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGxldCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyB3YWxrIHRoZSBmdWxsIHRyZWVcbiAgICBmdW5jdGlvbiBhZGREZXBlbmRlbmNpZXModGFzaykge1xuICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZ1bGxMaXN0ID0gZnVsbExpc3QuY29uY2F0KHRhc2tEZWZuc1t0YXNrXVsxXSlcbiAgICAgICAgdGFza0RlZm5zW3Rhc2tdLmZvckVhY2goc3ViID0+IGFkZERlcGVuZGVuY2llcyhzdWIpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdhbGtpbmcgZnJvbSB0b3BcbiAgICBmdWxsTGlzdC5mb3JFYWNoKHRhc2sgPT4gYWRkRGVwZW5kZW5jaWVzKHRhc2spKVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIEdvYWwuZGVmaW5lVGFza3ModGFza0RlZm5zLCBidXN0ZWQpXG4gIGF3YWl0IEdvYWwuY3JlYXRlKHRhc2tzLCBwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBTdG9yZSBjYWNoZSBmb3IgbGF0ZXIuXG4gICAqL1xuICBhd2FpdCBjYWNoZS5zYXZlKHByb2plY3REaXIpXG59KSgpLmNhdGNoKGVyciA9PiB7XG4gIGZ1bmN0aW9uIGVuZChsYXN0RXJyKSB7XG4gICAgZXJyb3IobGFzdEVyciAmJiBsYXN0RXJyLnN0YWNrID8gbGFzdEVyci5zdGFjayA6IGxhc3RFcnIpXG4gICAgcHJvY2Vzcy5leGl0KC0xKVxuICB9XG5cbiAgY3JlYXRlTG9nZ2VyLnNhdmVMb2cocHJvamVjdERpcilcbiAgICAudGhlbigoKSA9PiBlbmQoZXJyKSlcbiAgICAuY2F0Y2goZXJyID0+IGVuZChlcnIpKVxufSlcbiJdfQ==