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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsInByb2plY3REaXIiLCJwcm9jZXNzIiwiY3dkIiwiYXJndiIsIm8iLCJfIiwiaSIsImFyZ3MiLCJsZW5ndGgiLCJhIiwiaGVscCIsInZlcnNpb24iLCJ2ZXJib3NlIiwiaGFybW9ueSIsImRpcmVjdG9yeSIsImVudiIsIlJFQ0FDSEUiLCJwdXNoIiwiY29uc29sZSIsImV4aXQiLCJ0YXNrcyIsIkhPUFBfREVCVUciLCJIQVJNT05ZX0ZMQUciLCJyZXNvbHZlIiwiZmluZCIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiQXJyYXkiLCJmdWxsTGlzdCIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJzbGljZSIsImNhbGwiLCJkZWZpbmVUYXNrcyIsImNyZWF0ZSIsInNhdmUiLCJjYXRjaCIsImVuZCIsImxhc3RFcnIiLCJzdGFjayIsInNhdmVMb2ciLCJ0aGVuIiwiZXJyIl0sIm1hcHBpbmdzIjoiOzs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLEk7O0FBQ1o7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7OzJjQWZBOzs7Ozs7b0JBaUI4QixtQkFBYSxNQUFiLEM7SUFBdEJDLEcsaUJBQUFBLEc7SUFBS0MsSyxpQkFBQUEsSztJQUFPQyxLLGlCQUFBQSxLOztBQUVwQjs7Ozs7O0FBSUFDLFFBQVEsUUFB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QyxPQUFiLENBQXFCeEQsVUFBckIsRUFDR3lELElBREgsQ0FDUTtBQUFBLFdBQU1KLElBQUlLLEdBQUosQ0FBTjtBQUFBLEdBRFIsRUFFR04sS0FGSCxDQUVTO0FBQUEsV0FBT0MsSUFBSUssR0FBSixDQUFQO0FBQUEsR0FGVDtBQUdELENBbkhBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBpbmRleC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaVxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IE1vZHVsZSBmcm9tICdtb2R1bGUnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUhvcHAgZnJvbSAnLi9ob3BwJ1xuaW1wb3J0IGZyb21UcmVlIGZyb20gJy4vdGFza3MvdHJlZSdcbmltcG9ydCAqIGFzIEdvYWwgZnJvbSAnLi90YXNrcy9nb2FsJ1xuaW1wb3J0ICogYXMgaG9wcGZpbGUgZnJvbSAnLi9ob3BwZmlsZSdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi91dGlscy9sb2cnXG5cbmNvbnN0IHsgbG9nLCBkZWJ1ZywgZXJyb3IgfSA9IGNyZWF0ZUxvZ2dlcignaG9wcCcpXG5cbi8qKlxuICogRXh0ZW5kIHRoZSBudW1iZXIgb2YgZGVmYXVsdCBsaXN0ZW5lcnMgYmVjYXVzZSAxMFxuICogZ2V0cyBoaXQgcHJldHR5IHF1aWNrbHkgd2l0aCBwaXBpbmcgc3RyZWFtcy5cbiAqL1xucmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSA1MFxuXG4vKipcbiAqIFRoaXMgaXMgcmVzb2x2ZWQgdG8gdGhlIGRpcmVjdG9yeSB3aXRoIGEgaG9wcGZpbGUgbGF0ZXJcbiAqIG9uIGJ1dCBpdCBpcyBnbG9iYWxseSBzY29wZWQgaW4gdGhpcyBtb2R1bGUgc28gdGhhdCB3ZSBjYW5cbiAqIHNhdmUgZGVidWcgbG9ncyB0byBpdC5cbiAqL1xubGV0IHByb2plY3REaXIgPSBwcm9jZXNzLmN3ZCgpXG5cbi8qKlxuICogUGFyc2UgYXJnc1xuICovXG5jb25zdCBhcmd2ID0gKGFyZ3MgPT4ge1xuICBjb25zdCBvID0ge1xuICAgIF86IFtdXG4gIH1cblxuICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBsZXQgYSA9IGFyZ3NbaV1cblxuICAgIGlmIChhID09PSAnLWgnIHx8IGEgPT09ICctLWhlbHAnKSBvLmhlbHAgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1WJyB8fCBhID09PSAnLS12ZXJzaW9uJykgby52ZXJzaW9uID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctdicgfHwgYSA9PT0gJy0tdmVyYm9zZScpIG8udmVyYm9zZSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLUgnIHx8IGEgPT09ICctLWhhcm1vbnknKSBvLmhhcm1vbnkgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGEgPT09ICctcicgfHwgYSA9PT0gJy0tcmVjYWNoZScpIHByb2Nlc3MuZW52LlJFQ0FDSEUgPSB0cnVlXG4gICAgZWxzZSBpZiAoYVswXSAhPT0gJy0nKSBvLl8ucHVzaChhKVxuICB9XG5cbiAgcmV0dXJuIG9cbn0pKHByb2Nlc3MuYXJndilcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgY29uc29sZS5sb2coJyAgLWQsIC0tZGlyZWN0b3J5IFtkaXJdXFx0cGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeScpXG4gIGNvbnNvbGUubG9nKCcgIC1ILCAtLWhhcm1vbnlcXHRhdXRvLXRyYW5zcGlsZSBob3BwZmlsZSB3aXRoIGJhYmVsJylcbiAgY29uc29sZS5sb2coJyAgLXIsIC0tcmVjYWNoZVxcdGZvcmNlIGNhY2hlIGJ1c3RpbmcnKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIEhhcm1vbnkgZmxhZyBmb3IgdHJhbnNwaWxpbmcgaG9wcGZpbGVzLlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID0gcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHIHx8ICEhIGFyZ3YuaGFybW9ueVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kaXJlY3RvcnkgfHwgYXdhaXQgaG9wcGZpbGUuZmluZChwcm9jZXNzLmN3ZCgpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgYnVzdGVkLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIC8vIGNyZWF0ZSBjb3B5IG9mIHRhc2tzLCB3ZSBkb24ndCB3YW50IHRvIG1vZGlmeVxuICAgIC8vIHRoZSBhY3R1YWwgZ29hbCBsaXN0XG4gICAgbGV0IGZ1bGxMaXN0ID0gW10uc2xpY2UuY2FsbCh0YXNrcylcblxuICAgIC8vIHdhbGsgdGhlIGZ1bGwgdHJlZVxuICAgIGZ1bmN0aW9uIGFkZERlcGVuZGVuY2llcyh0YXNrKSB7XG4gICAgICBpZiAodGFza0RlZm5zW3Rhc2tdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZnVsbExpc3QgPSBmdWxsTGlzdC5jb25jYXQodGFza0RlZm5zW3Rhc2tdWzFdKVxuICAgICAgICB0YXNrRGVmbnNbdGFza10uZm9yRWFjaChzdWIgPT4gYWRkRGVwZW5kZW5jaWVzKHN1YikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3RhcnQgd2Fsa2luZyBmcm9tIHRvcFxuICAgIGZ1bGxMaXN0LmZvckVhY2godGFzayA9PiBhZGREZXBlbmRlbmNpZXModGFzaykpXG5cbiAgICAvLyBwYXJzZSBhbGwgdGFza3MgYW5kIHRoZWlyIGRlcGVuZGVuY2llc1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgZnVsbExpc3QpXG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGFzayBjb21wbGV0aW9uLlxuICAgKi9cbiAgR29hbC5kZWZpbmVUYXNrcyh0YXNrRGVmbnMsIGJ1c3RlZClcbiAgYXdhaXQgR29hbC5jcmVhdGUodGFza3MsIHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZnVuY3Rpb24gZW5kKGxhc3RFcnIpIHtcbiAgICBlcnJvcihsYXN0RXJyICYmIGxhc3RFcnIuc3RhY2sgPyBsYXN0RXJyLnN0YWNrIDogbGFzdEVycilcbiAgICBwcm9jZXNzLmV4aXQoLTEpXG4gIH1cblxuICBjcmVhdGVMb2dnZXIuc2F2ZUxvZyhwcm9qZWN0RGlyKVxuICAgIC50aGVuKCgpID0+IGVuZChlcnIpKVxuICAgIC5jYXRjaChlcnIgPT4gZW5kKGVycikpXG59KVxuIl19