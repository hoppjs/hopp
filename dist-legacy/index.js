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

var argv = require('minimist')(process.argv.slice(2)

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

if (argv.V || argv.version) {
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
if (argv.h || argv.help) {
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
          process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !!(argv.v || argv.verbose);
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

          _context.t1 = argv.d || argv.directory;

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

            goal.start();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwicmVxdWlyZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJhcmd2IiwicHJvY2VzcyIsInNsaWNlIiwiaGVscCIsImNvbnNvbGUiLCJleGl0IiwiViIsInZlcnNpb24iLCJoIiwidGFza3MiLCJfIiwibGVuZ3RoIiwiZW52IiwiSE9QUF9ERUJVRyIsInYiLCJ2ZXJib3NlIiwiZGlyZWN0b3J5IiwicmVzb2x2ZSIsImN3ZCIsImQiLCJmaW5kIiwiZGlybmFtZSIsIl9fZGlybmFtZSIsInByb2plY3REaXIiLCJmaWxlIiwibG9hZCIsImxvY2siLCJob3BwIiwiX3Jlc29sdmUiLCJfcmVzb2x2ZUZpbGVuYW1lIiwid2hhdCIsInBhcmVudCIsImlkIiwiZmlsZW5hbWUiLCJsb2FkZWQiLCJleHBvcnRzIiwiZnJvbUNhY2hlIiwidGFza0RlZm5zIiwiZ29hbCIsIkFycmF5Iiwic3RhcnQiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayIsInNhdmUiLCJjYXRjaCIsImVyciIsInN0YWNrIl0sIm1hcHBpbmdzIjoiOzs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7OzJjQWRBOzs7Ozs7ZUFnQjhCQyxRQUFRLGFBQVIsRUFBdUI7O0FBRXJEOzs7QUFGOEIsQztJQUF0QkMsRyxZQUFBQSxHO0lBQUtDLEssWUFBQUEsSztJQUFPQyxLLFlBQUFBLEs7O0FBS3BCLElBQU1DLE9BQU9KLFFBQVEsVUFBUixFQUFvQkssUUFBUUQsSUFBUixDQUFhRSxLQUFiLENBQW1CLENBQW5COztBQUVqQzs7O0FBRmEsQ0FBYixDQUtBLFNBQVNDLElBQVQsR0FBZ0I7QUFDZEMsVUFBUVAsR0FBUixDQUFZLCtCQUFaO0FBQ0FPLFVBQVFQLEdBQVIsQ0FBWSxFQUFaO0FBQ0FPLFVBQVFQLEdB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ckIsRUFBd0I7QUFDdEIyQixtQkFBT0QsVUFBVTVCLE1BQU0sQ0FBTixDQUFWLENBQVA7O0FBRUEsZ0JBQUk2QixnQkFBZ0JDLEtBQXBCLEVBQTJCO0FBQ3pCRCxxQkFBTyx3QkFBZUEsSUFBZixDQUFQO0FBQ0Q7O0FBRURBLGlCQUFLRSxLQUFMO0FBQ0QsV0FSRCxNQVFPO0FBQ0xGLG1CQUFPRyxRQUFRQyxHQUFSLENBQVlqQyxNQUFNa0MsR0FBTixDQUFVLGdCQUFRO0FBQ25DQyxxQkFBT1AsVUFBVU8sSUFBVixDQUFQOztBQUVBLGtCQUFJQSxnQkFBZ0JMLEtBQXBCLEVBQTJCO0FBQ3pCSyx1QkFBTyx3QkFBZUEsSUFBZixDQUFQO0FBQ0Q7O0FBRUQscUJBQU9BLEtBQUtKLEtBQUwsRUFBUDtBQUNELGFBUmtCLENBQVosQ0FBUDtBQVNEOztBQUVEOzs7QUFwR0E7QUFBQSxpQkF1R01GLElBdkdOOztBQUFBO0FBQUE7QUFBQSxpQkE0R001QyxNQUFNbUQsSUFBTixDQUFXdEIsVUFBWCxDQTVHTjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDQUFELEtBNkdJdUIsS0E3R0osQ0E2R1UsZUFBTztBQUNoQi9DLFFBQU1nRCxJQUFJQyxLQUFKLElBQWFELEdBQW5CO0FBQ0E5QyxVQUFRSSxJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0QsQ0FoSEEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIGluZGV4LmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgTW9kdWxlIGZyb20gJ21vZHVsZSdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlSG9wcCBmcm9tICcuL2hvcHAnXG5pbXBvcnQgZnJvbVRyZWUgZnJvbSAnLi90YXNrcy90cmVlJ1xuaW1wb3J0ICogYXMgaG9wcGZpbGUgZnJvbSAnLi9ob3BwZmlsZSdcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3Rhc2tzL3BhcmFsbGVsJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBQYXJzZSBhcmdzXG4gKi9cbmNvbnN0IGFyZ3YgPSByZXF1aXJlKCdtaW5pbWlzdCcpKHByb2Nlc3MuYXJndi5zbGljZSgyKSlcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgY29uc29sZS5sb2coJyAgLWQsIC0tZGlyZWN0b3J5IFtkaXJdXFx0cGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeScpXG4gIGNvbnNvbGUubG9nKCcgIC12LCAtLXZlcmJvc2VcXHRlbmFibGUgZGVidWcgbWVzc2FnZXMnKVxuICBjb25zb2xlLmxvZygnICAtViwgLS12ZXJzaW9uXFx0Z2V0IHZlcnNpb24gaW5mbycpXG4gIGNvbnNvbGUubG9nKCcgIC1oLCAtLWhlbHBcXHRkaXNwbGF5IHRoaXMgbWVzc2FnZScpXG5cbiAgcHJvY2Vzcy5leGl0KDEpXG59XG5cbmlmIChhcmd2LlYgfHwgYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaCB8fCBhcmd2LmhlbHApIHtcbiAgaGVscCgpXG59XG5cbi8qKlxuICogU2V0IHRhc2tzLlxuICovXG5jb25zdCB0YXNrcyA9IGFyZ3YuXy5sZW5ndGggPT09IDAgPyBbJ2RlZmF1bHQnXSA6IGFyZ3YuX1xuXG47KGFzeW5jICgpID0+IHtcbiAgLyoqXG4gICAqIFBhc3MgdmVyYm9zaXR5IHRocm91Z2ggdG8gdGhlIGVudi5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhPUFBfREVCVUcgPSBwcm9jZXNzLmVudi5IT1BQX0RFQlVHIHx8ICEhIChhcmd2LnYgfHwgYXJndi52ZXJib3NlKVxuICBkZWJ1ZygnU2V0dGluZyBIT1BQX0RFQlVHID0gJWonLCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHKVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgY29uc3QgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kIHx8IGFyZ3YuZGlyZWN0b3J5IHx8IGF3YWl0IGhvcHBmaWxlLmZpbmQocGF0aC5kaXJuYW1lKF9fZGlybmFtZSkpKVxuXG4gIC8qKlxuICAgKiBTZXQgaG9wcGZpbGUgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIHByb2plY3QuXG4gICAqIFxuICAgKiBUaGlzIHdpbGwgY2F1c2UgZXJyb3JzIGxhdGVyIGlmIHRoZSBkaXJlY3Rvcnkgd2FzIHN1cHBsaWVkXG4gICAqIG1hbnVhbGx5IGJ1dCBjb250YWlucyBubyBob3BwZmlsZS4gV2UgZG9uJ3Qgd2FudCB0byBkbyBhIG1hZ2ljXG4gICAqIGxvb2t1cCBmb3IgdGhlIHVzZXIgYmVjYXVzZSB0aGV5IG92ZXJyb2RlIHRoZSBtYWdpYyB3aXRoIHRoZVxuICAgKiBtYW51YWwgZmxhZy5cbiAgICovXG4gIGNvbnN0IGZpbGUgPSBwcm9qZWN0RGlyICsgJy9ob3BwZmlsZS5qcydcbiAgZGVidWcoJ1VzaW5nIGhvcHBmaWxlLmpzIEAgJXMnLCBmaWxlKVxuXG4gIC8qKlxuICAgKiBMb2FkIGNhY2hlLlxuICAgKi9cbiAgY29uc3QgbG9jayA9IGF3YWl0IGNhY2hlLmxvYWQocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ3JlYXRlIGhvcHAgaW5zdGFuY2UgY3JlYXRvci5cbiAgICovXG4gIGNvbnN0IGhvcHAgPSBhd2FpdCBjcmVhdGVIb3BwKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENhY2hlIHRoZSBob3BwIGhhbmRsZXIgdG8gbWFrZSBgcmVxdWlyZSgpYCB3b3JrXG4gICAqIGluIHRoZSBob3BwZmlsZS5cbiAgICovXG4gIGNvbnN0IF9yZXNvbHZlID0gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWVcbiAgTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgPSAod2hhdCwgcGFyZW50KSA9PiB7XG4gICAgcmV0dXJuIHdoYXQgPT09ICdob3BwJyA/IHdoYXQgOiBfcmVzb2x2ZSh3aGF0LCBwYXJlbnQpXG4gIH1cblxuICByZXF1aXJlLmNhY2hlLmhvcHAgPSB7XG4gICAgaWQ6ICdob3BwJyxcbiAgICBmaWxlbmFtZTogJ2hvcHAnLFxuICAgIGxvYWRlZDogdHJ1ZSxcbiAgICBleHBvcnRzOiBob3BwXG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0YXNrcyBmcm9tIGZpbGUuXG4gICAqL1xuICBjb25zdCBbZnJvbUNhY2hlLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgdGFza3MpXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2tzLlxuICAgKi9cbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gY3JlYXRlUGFyYWxsZWwoZ29hbClcbiAgICB9XG4gICAgXG4gICAgZ29hbC5zdGFydCgpXG4gIH0gZWxzZSB7XG4gICAgZ29hbCA9IFByb21pc2UuYWxsKHRhc2tzLm1hcCh0YXNrID0+IHtcbiAgICAgIHRhc2sgPSB0YXNrRGVmbnNbdGFza11cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gY3JlYXRlUGFyYWxsZWwodGFzaylcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhc2suc3RhcnQoKVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIGF3YWl0IGdvYWxcblxuICAvKipcbiAgICogU3RvcmUgY2FjaGUgZm9yIGxhdGVyLlxuICAgKi9cbiAgYXdhaXQgY2FjaGUuc2F2ZShwcm9qZWN0RGlyKVxufSkoKS5jYXRjaChlcnIgPT4ge1xuICBlcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICBwcm9jZXNzLmV4aXQoLTEpXG59KVxuIl19