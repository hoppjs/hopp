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
var args = {
  d: ['directory', 'set path to project directory'],
  r: ['require', 'require a module before doing anything'],
  R: ['recache', 'force cache busting'],
  v: ['verbose', 'enable debug messages'],
  V: ['version', 'get version info'],
  h: ['help', 'display this message']

  // parse via minimist
};var largestArg = '';
var argv = require('minimist')(process.argv.slice(2), {
  alias: function () {
    var o = {};

    for (var a in args) {
      if (args.hasOwnProperty(a)) {
        o[a] = args[a][0];

        if (args[a][0].length > largestArg.length) {
          largestArg = args[a][0];
        }
      }
    }

    return o;
  }()
});

// expose to env
process.env.RECACHE = argv.recache;

/**
 * Print help.
 */
function help() {
  console.log('usage: hopp [OPTIONS] [TASKS]');
  console.log('');

  for (var a in args) {
    if (args.hasOwnProperty(a)) {
      console.log('  -%s, --%s%s%s', a, args[a][0], ' '.repeat(largestArg.length - args[a][0].length + 2), args[a][1]);
    }
  }

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
var tasks = argv._.length === 0 ? ['default'] : argv._;

/**
 * Require whatever needs to be loaded.
 */
if (argv.require) {
  ;(argv.require instanceof Array ? argv.require : [argv.require]).forEach(function (mod) {
    return require(mod);
  });
}

;_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsInByb2plY3REaXIiLCJwcm9jZXNzIiwiY3dkIiwiYXJncyIsImQiLCJyIiwiUiIsInYiLCJWIiwiaCIsImxhcmdlc3RBcmciLCJhcmd2Iiwic2xpY2UiLCJhbGlhcyIsIm8iLCJhIiwiaGFzT3duUHJvcGVydHkiLCJsZW5ndGgiLCJlbnYiLCJSRUNBQ0hFIiwicmVjYWNoZSIsImhlbHAiLCJjb25zb2xlIiwicmVwZWF0IiwiZXhpdCIsInZlcnNpb24iLCJ0YXNrcyIsIl8iLCJBcnJheSIsImZvckVhY2giLCJtb2QiLCJIT1BQX0RFQlVHIiwidmVyYm9zZSIsIkhBUk1PTllfRkxBRyIsImhhcm1vbnkiLCJkaXJlY3RvcnkiLCJyZXNvbHZlIiwiZmluZCIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiZnVsbExpc3QiLCJjb25jYXQiLCJzdWIiLCJjYWxsIiwiZGVmaW5lVGFza3MiLCJjcmVhdGUiLCJzYXZlIiwiY2F0Y2giLCJlbmQiLCJsYXN0RXJyIiwic3RhY2siLCJzYXZlTG9nIiwidGhlbiIsImVyciJdLCJtYXBwaW5ncyI6Ijs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxJOztBQUNaOztJQUFZQyxROztBQUNaOzs7Ozs7OzsyY0FmQTs7Ozs7O29CQWlCOEIsbUJBQWEsTUFBYixDO0lBQXRCQyxHLGlCQUFBQSxHO0lBQUtDLEssaUJBQUFBLEs7SUFBT0MsSyxpQkFBQUEsSzs7QUFFcEI7Ozs7OztBQUlBQyxRQUFRLFFBQVIsRUFBa0JDLFlBQWxCLENBQStCQyxtQkFBL0IsR0FBcUQsRUFBckQ7O0FBRUE7Ozs7O0FBS0EsSUFBSUMsYUFBYUMsUUFBUUMsR0FBUixFQUFqQjs7QUFFQTs7O0FBR0EsSUFBTUMsT0FBTztBQUNYQyxLQUFHLENBQUMsV0FBRCxFQUFjLCtCQUFkLENBRFE7QUFFWEMsS0FBRyxDQUFDLFNBQUQsRUFBWSx3Q0FBWixDQUZRO0FBR1hDLEtBQUcsQ0FBQyxTQUFELEVBQVkscUJBQVosQ0FIUTtBQUlYQyxLQUFHLENBQUMsU0FBRCxFQUFZLHVCQUFaLENBSlE7QUFLWEMsS0FBRyxDQUFDLFNBQUQsRUFBWSxrQkFBWixDQUxRO0FBTVhDLEtBQUcsQ0FBQyxNQUFELEVBQVMsc0JBQVQ7O0FBR0w7QUFUYSxDQUFiLENBVUEsSUFBSUMsYUFBYSxFQUFqQjtBQUNBLElBQU1DLE9BQU9kLFFBQVEsVUFBUixFQUFvQkksUUFBUVUsSUFBUixDQUFhQyxLQUFiLENBQW1CLENBQW5CLENBQXBCLEVBQTJDO0FBQ3REQyxTQUFRLFlBQU07QUFDWixRQUFNQyxJQUFJLEVBQVY7O0FBRUEsU0FBSyxJQUFJQyxDQUFULElBQWNaLElBQWQsRUFBb0I7QUFDbEIsVUFBSUEsS0FBS2EsY0FBTCxDQUFvQkQsQ0FBcEIsQ0FBSixFQUE0QjtBQUMxQkQsVUFBRUMsQ0FBRixJQUFPWixLQUFLWSxDQUFMLEVBQVEsQ0FBUixDQUFQOztBQUVBLFlBQUlaLEtBQUtZLENBQUwsRUFBUSxDQUFSLEVBQVdFLE1BQVgsR0FBb0JQLFdBQVdPLE1BQW5DLEVBQTJDO0FBQ3pDUCx1QkFBYVAsS0FBS1ksQ0FBTCxFQUFRLENBQVIsQ0FBYjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFPRCxDQUFQO0FBQ0QsR0FkTTtBQUQrQyxDQUEzQyxDQUFiOztBQWtCQTtBQUNBYixRQUFRaUIsR0FBUixDQUFZQyxPQUFaLEdBQXNCUixLQUFLUyxPQUEzQjs7QUFFQTs7O0FBR0EsU0FBU0MsSUFBVCxHQUFnQjtBQUNkQyxVQUFRNUIsR0FBUixDQUFZLCtCQUFaO0FBQ0E0QixVQUFRNUIsR0FBUixDQUFZLEVBQVo7O0FBRUEsT0FBSyxJQUFJcUIsQ0FBVCxJQUFjWixJQUFkLEVBQW9CO0FBQ2xCLFFBQUlBLEtBQUthLGNBQUwsQ0FBb0JELENBQXBCLENBQUosRUFBNEI7QUFDMUJPLGNBQVE1QixHQUFSLENBQVksaUJBQVosRUFBK0JxQixDQUEvQixFQUFrQ1osS0FBS1ksQ0FBTCxFQUFRLENBQVIsQ0FBbEMsRUFBOEMsSUFBSVEsTUFBSixDQUFXYixXQUFXTyxNQUFYLEdBQW9CZCxLQUFLWSxDQUFMLEVBQVEsQ0FBUixFQUFXRSxNQUEvQixHQUF3QyxDQUFuRCxDQUE5QyxFQUFxR2QsS0FBS1ksQ0FBTCxFQUFRLENBQVIsQ0FBckc7QUFDRDtBQUNGOztBQUVEZCxVQUFRdUIsSUFBUixDQUFhLENBQWI7QUFDRDs7QUFFRCxJQUFJYixLQUFLYyxPQUFULEVBQWtCO0FBQ2hCSCxVQUFRNUIsR0FBUixDQUFZRyxRQUFRLGlCQUFSLEVBQTJCNEIsT0FBdkM7QUFDQXhCLFVBQVF1QixJQUFSLENBQWEsQ0FBYjtBQUNEOztBQUVEOzs7Ozs7OztBQVFBLElBQUliLEtBQUtVLElBQVQsRUFBZTtBQUNiQTtBQUNEOztBQUVEOzs7QUFHQSxJQUFNSyxRQUFRZixLQUFLZ0IsQ0FBTCxDQUFPVixNQUFQLEtBQWtCLENBQWxCLEdBQXNCLENBQUMsU0FBRCxDQUF0QixHQUFvQ04sS0FBS2dCLENBQXZEOztBQUVBOzs7QUFHQSxJQUFJaEIsS0FBS2QsT0FBVCxFQUFrQjtBQUNoQixHQUFDLENBQUNjLEtBQUtkLE9BQUwsWUFBd0IrQixLQUF4QixHQUFnQ2pCLEtBQUtkLE9BQXJDLEdBQStDLENBQUNjLEtBQUtkLE9BQU4sQ0FBaEQsRUFDRWdDLE9BREYsQ0FDVTtBQUFBLFdBQU9oQyxRQUFRaUMsR0FBUixDQUFQO0FBQUEsR0FEVjtBQUVGOztBQUVELENBQUMsMENBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBOzs7QUFHQTdCLGtCQUFRaUIsR0FBUixDQUFZYSxVQUFaLEdBQXlCOUIsUUFBUWlCLEdBQVIsQ0FBWWEsVUFBWixJQUEwQixDQUFDLENBQUVwQixLQUFLcUIsT0FBM0Q7QUFDQXJDLGdCQUFNLHlCQUFOLEVBQWlDTSxRQUFRaUIsR0FBUixDQUFZYSxVQUE3Qzs7QUFFQTs7O0FBR0E5QixrQkFBUWlCLEdBQVIsQ0FBWWUsWUFBWixHQUEyQmhDLFFBQVFpQixHQUFSLENBQVllLFlBQVosSUFBNEIsQ0FBQyxDQUFFdEIsS0FBS3VCLE9BQS9EOztBQUVBOzs7OztBQVpBLHdCQWdCYyxxQkFBYTtBQUN6QjtBQUNBLGdCQUFJQyxVQUFVLENBQVYsTUFBaUIsR0FBckIsRUFBMEI7QUFDeEIscUJBQU9BLFNBQVA7QUFDRDs7QUFFRDtBQUNBLGdCQUFJQSxVQUFVLENBQVYsTUFBaUIsR0FBckIsRUFBMEI7QUFDeEJBLDBCQUFZLE9BQU9BLFNBQW5CO0FBQ0Q7O0FBRUQ7QUFDQSxtQkFBTyxlQUFLQyxPQUFMLENBQWFuQyxRQUFRQyxHQUFSLEVBQWIsRUFBNEJpQyxTQUE1QixDQUFQO0FBQ0QsV0E3QkQ7O0FBQUEsd0JBNkJHeEIsS0FBS3dCLFNBN0JSOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsaUJBNkIyQjFDLFNBQVM0QyxJQUFULENBQWNwQyxRQUFRQyxHQUFSLEVBQWQsQ0E3QjNCOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQWdCQUYsb0JBaEJBOzs7QUErQkE7Ozs7Ozs7O0FBUU1zQyxjQXZDTixHQXVDYXRDLGFBQWEsY0F2QzFCOztBQXdDQUwsZ0JBQU0sd0JBQU4sRUFBZ0MyQyxJQUFoQzs7QUFFQTs7O0FBMUNBO0FBQUEsaUJBNkNtQi9DLE1BQU1nRCxJQUFOLENBQVd2QyxVQUFYLENBN0NuQjs7QUFBQTtBQTZDTXdDLGNBN0NOO0FBQUE7QUFBQSxpQkFrRG1CLG9CQUFXeEMsVUFBWCxDQWxEbkI7O0FBQUE7QUFrRE15QyxjQWxETjs7O0FBb0RBOzs7O0FBSU1DLGtCQXhETixHQXdEaUIsaUJBQU9DLGdCQXhEeEI7O0FBeURBLDJCQUFPQSxnQkFBUCxHQUEwQixVQUFDQyxJQUFELEVBQU9DLE1BQVAsRUFBa0I7QUFDMUMsbUJBQU9ELFNBQVMsTUFBVCxHQUFrQkEsSUFBbEIsR0FBeUJGLFNBQVNFLElBQVQsRUFBZUMsTUFBZixDQUFoQztBQUNELFdBRkQ7O0FBSUFoRCxrQkFBUU4sS0FBUixDQUFja0QsSUFBZCxHQUFxQjtBQUNuQkssZ0JBQUksTUFEZTtBQUVuQkMsc0JBQVUsTUFGUztBQUduQkMsb0JBQVEsSUFIVztBQUluQkMscUJBQVNSOztBQUdYOzs7QUFQcUIsV0FBckIsQ0E3REE7QUFBQSxpQkF1RTZDaEQsU0FBUzhDLElBQVQsQ0FBY0QsSUFBZCxDQXZFN0M7O0FBQUE7QUFBQTtBQUFBO0FBdUVPWSxtQkF2RVA7QUF1RWtCQyxnQkF2RWxCO0FBdUUwQkMsbUJBdkUxQjs7O0FBeUVBOzs7QUFHQSxjQUFJRixTQUFKLEVBQWU7O0FBS2I7QUFDU0csNEJBTkksR0FNYixTQUFTQSxnQkFBVCxDQUF5QkMsSUFBekIsRUFBK0I7QUFDN0Isa0JBQUlGLFVBQVVFLElBQVYsYUFBMkIxQixLQUEvQixFQUFzQztBQUNwQzJCLDJCQUFXQSxTQUFTQyxNQUFULENBQWdCSixVQUFVRSxJQUFWLEVBQWdCLENBQWhCLENBQWhCLENBQVg7QUFDQUYsMEJBQVVFLElBQVYsRUFBZ0J6QixPQUFoQixDQUF3QjtBQUFBLHlCQUFPd0IsaUJBQWdCSSxHQUFoQixDQUFQO0FBQUEsaUJBQXhCO0FBQ0Q7QUFDRixhQVhZOztBQWFiOzs7QUFaQTtBQUNBO0FBQ0lGLG9CQUhTLEdBR0UsR0FBRzNDLEtBQUgsQ0FBUzhDLElBQVQsQ0FBY2hDLEtBQWQsQ0FIRjtBQWNiNkIscUJBQVMxQixPQUFULENBQWlCO0FBQUEscUJBQVF3QixpQkFBZ0JDLElBQWhCLENBQVI7QUFBQSxhQUFqQjs7QUFFQTtBQUNBLGdDQUFTRixTQUFULEVBQW9CRyxRQUFwQjtBQUNEOztBQUVEOzs7QUFHQS9ELGVBQUttRSxXQUFMLENBQWlCUCxTQUFqQixFQUE0QkQsTUFBNUI7QUFuR0E7QUFBQSxpQkFvR00zRCxLQUFLb0UsTUFBTCxDQUFZbEMsS0FBWixFQUFtQjFCLFVBQW5CLENBcEdOOztBQUFBO0FBQUE7QUFBQSxpQkF5R01ULE1BQU1zRSxJQUFOLENBQVc3RCxVQUFYLENBekdOOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQsS0EwR0k4RCxLQTFHSixDQTBHVSxlQUFPO0FBQ2hCLFdBQVNDLEdBQVQsQ0FBYUMsT0FBYixFQUFzQjtBQUNwQnBFLFVBQU1vRSxXQUFXQSxRQUFRQyxLQUFuQixHQUEyQkQsUUFBUUMsS0FBbkMsR0FBMkNELE9BQWpEO0FBQ0EvRCxZQUFRdUIsSUFBUixDQUFhLENBQUMsQ0FBZDtBQUNEOztBQUVELGdCQUFhMEMsT0FBYixDQUFxQmxFLFVBQXJCLEVBQ0dtRSxJQURILENBQ1E7QUFBQSxXQUFNSixJQUFJSyxHQUFKLENBQU47QUFBQSxHQURSLEVBRUdOLEtBRkgsQ0FFUztBQUFBLFdBQU9DLElBQUlLLEdBQUosQ0FBUDtBQUFBLEdBRlQ7QUFHRCxDQW5IQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgTW9kdWxlIGZyb20gJ21vZHVsZSdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlSG9wcCBmcm9tICcuL2hvcHAnXG5pbXBvcnQgZnJvbVRyZWUgZnJvbSAnLi90YXNrcy90cmVlJ1xuaW1wb3J0ICogYXMgR29hbCBmcm9tICcuL3Rhc2tzL2dvYWwnXG5pbXBvcnQgKiBhcyBob3BwZmlsZSBmcm9tICcuL2hvcHBmaWxlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuL3V0aWxzL2xvZydcblxuY29uc3QgeyBsb2csIGRlYnVnLCBlcnJvciB9ID0gY3JlYXRlTG9nZ2VyKCdob3BwJylcblxuLyoqXG4gKiBFeHRlbmQgdGhlIG51bWJlciBvZiBkZWZhdWx0IGxpc3RlbmVycyBiZWNhdXNlIDEwXG4gKiBnZXRzIGhpdCBwcmV0dHkgcXVpY2tseSB3aXRoIHBpcGluZyBzdHJlYW1zLlxuICovXG5yZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDUwXG5cbi8qKlxuICogVGhpcyBpcyByZXNvbHZlZCB0byB0aGUgZGlyZWN0b3J5IHdpdGggYSBob3BwZmlsZSBsYXRlclxuICogb24gYnV0IGl0IGlzIGdsb2JhbGx5IHNjb3BlZCBpbiB0aGlzIG1vZHVsZSBzbyB0aGF0IHdlIGNhblxuICogc2F2ZSBkZWJ1ZyBsb2dzIHRvIGl0LlxuICovXG5sZXQgcHJvamVjdERpciA9IHByb2Nlc3MuY3dkKClcblxuLyoqXG4gKiBQYXJzZSBhcmdzXG4gKi9cbmNvbnN0IGFyZ3MgPSB7XG4gIGQ6IFsnZGlyZWN0b3J5JywgJ3NldCBwYXRoIHRvIHByb2plY3QgZGlyZWN0b3J5J10sXG4gIHI6IFsncmVxdWlyZScsICdyZXF1aXJlIGEgbW9kdWxlIGJlZm9yZSBkb2luZyBhbnl0aGluZyddLFxuICBSOiBbJ3JlY2FjaGUnLCAnZm9yY2UgY2FjaGUgYnVzdGluZyddLFxuICB2OiBbJ3ZlcmJvc2UnLCAnZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJ10sXG4gIFY6IFsndmVyc2lvbicsICdnZXQgdmVyc2lvbiBpbmZvJ10sXG4gIGg6IFsnaGVscCcsICdkaXNwbGF5IHRoaXMgbWVzc2FnZSddXG59XG5cbi8vIHBhcnNlIHZpYSBtaW5pbWlzdFxubGV0IGxhcmdlc3RBcmcgPSAnJ1xuY29uc3QgYXJndiA9IHJlcXVpcmUoJ21pbmltaXN0JykocHJvY2Vzcy5hcmd2LnNsaWNlKDIpLCB7XG4gIGFsaWFzOiAoKCkgPT4ge1xuICAgIGNvbnN0IG8gPSB7fVxuXG4gICAgZm9yIChsZXQgYSBpbiBhcmdzKSB7XG4gICAgICBpZiAoYXJncy5oYXNPd25Qcm9wZXJ0eShhKSkge1xuICAgICAgICBvW2FdID0gYXJnc1thXVswXVxuXG4gICAgICAgIGlmIChhcmdzW2FdWzBdLmxlbmd0aCA+IGxhcmdlc3RBcmcubGVuZ3RoKSB7XG4gICAgICAgICAgbGFyZ2VzdEFyZyA9IGFyZ3NbYV1bMF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvXG4gIH0pKClcbn0pXG5cbi8vIGV4cG9zZSB0byBlbnZcbnByb2Nlc3MuZW52LlJFQ0FDSEUgPSBhcmd2LnJlY2FjaGVcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgXG4gIGZvciAobGV0IGEgaW4gYXJncykge1xuICAgIGlmIChhcmdzLmhhc093blByb3BlcnR5KGEpKSB7XG4gICAgICBjb25zb2xlLmxvZygnICAtJXMsIC0tJXMlcyVzJywgYSwgYXJnc1thXVswXSwgJyAnLnJlcGVhdChsYXJnZXN0QXJnLmxlbmd0aCAtIGFyZ3NbYV1bMF0ubGVuZ3RoICsgMiksIGFyZ3NbYV1bMV0pXG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzcy5leGl0KDEpXG59XG5cbmlmIChhcmd2LnZlcnNpb24pIHtcbiAgY29uc29sZS5sb2cocmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvbilcbiAgcHJvY2Vzcy5leGl0KDApXG59XG5cbi8qKlxuICogQ3VycmVudGx5IHRoZSBvbmx5IHdheSBmb3IgaGVscCB0byBiZSBjYWxsZWQuXG4gKiBMYXRlciwgaXQgc2hvdWxkIGFsc28gaGFwcGVuIG9uIGludmFsaWQgYXJncyBidXQgd2VcbiAqIGRvbid0IGhhdmUgaW52YWxpZCBhcmd1bWVudHMgeWV0LlxuICogXG4gKiBJbnZhbGlkIGFyZ3VtZW50cyBpcyBhIGZsYWcgbWlzdXNlIC0gbmV2ZXIgYSBtaXNzaW5nXG4gKiB0YXNrLiBUaGF0IGVycm9yIHNob3VsZCBiZSBtb3JlIG1pbmltYWwgYW5kIHNlcGFyYXRlLlxuICovXG5pZiAoYXJndi5oZWxwKSB7XG4gIGhlbHAoKVxufVxuXG4vKipcbiAqIFNldCB0YXNrcy5cbiAqL1xuY29uc3QgdGFza3MgPSBhcmd2Ll8ubGVuZ3RoID09PSAwID8gWydkZWZhdWx0J10gOiBhcmd2Ll9cblxuLyoqXG4gKiBSZXF1aXJlIHdoYXRldmVyIG5lZWRzIHRvIGJlIGxvYWRlZC5cbiAqL1xuaWYgKGFyZ3YucmVxdWlyZSkge1xuICA7KGFyZ3YucmVxdWlyZSBpbnN0YW5jZW9mIEFycmF5ID8gYXJndi5yZXF1aXJlIDogW2FyZ3YucmVxdWlyZV0pXG4gICAgLmZvckVhY2gobW9kID0+IHJlcXVpcmUobW9kKSlcbn1cblxuOyhhc3luYyAoKSA9PiB7XG4gIC8qKlxuICAgKiBQYXNzIHZlcmJvc2l0eSB0aHJvdWdoIHRvIHRoZSBlbnYuXG4gICAqL1xuICBwcm9jZXNzLmVudi5IT1BQX0RFQlVHID0gcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyB8fCAhISBhcmd2LnZlcmJvc2VcbiAgZGVidWcoJ1NldHRpbmcgSE9QUF9ERUJVRyA9ICVqJywgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRylcblxuICAvKipcbiAgICogSGFybW9ueSBmbGFnIGZvciB0cmFuc3BpbGluZyBob3BwZmlsZXMuXG4gICAqL1xuICBwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgPSBwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgfHwgISEgYXJndi5oYXJtb255XG5cbiAgLyoqXG4gICAqIElmIHByb2plY3QgZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQsIGRvIGxvb2t1cCBmb3IgdGhlXG4gICAqIGhvcHBmaWxlLmpzXG4gICAqL1xuICBwcm9qZWN0RGlyID0gKGRpcmVjdG9yeSA9PiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgZG9uJ3QgbmVlZCBjb3JyZWN0aW5nXG4gICAgaWYgKGRpcmVjdG9yeVswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gc29ydC1vZiByZWxhdGl2ZXMgc2hvdWxkIGJlIG1hZGUgaW50byByZWxhdGl2ZVxuICAgIGlmIChkaXJlY3RvcnlbMF0gIT09ICcuJykge1xuICAgICAgZGlyZWN0b3J5ID0gJy4vJyArIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIG1hcCB0byBjdXJyZW50IGRpcmVjdG9yeVxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgZGlyZWN0b3J5KVxuICB9KShhcmd2LmRpcmVjdG9yeSB8fCBhd2FpdCBob3BwZmlsZS5maW5kKHByb2Nlc3MuY3dkKCkpKVxuXG4gIC8qKlxuICAgKiBTZXQgaG9wcGZpbGUgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIHByb2plY3QuXG4gICAqIFxuICAgKiBUaGlzIHdpbGwgY2F1c2UgZXJyb3JzIGxhdGVyIGlmIHRoZSBkaXJlY3Rvcnkgd2FzIHN1cHBsaWVkXG4gICAqIG1hbnVhbGx5IGJ1dCBjb250YWlucyBubyBob3BwZmlsZS4gV2UgZG9uJ3Qgd2FudCB0byBkbyBhIG1hZ2ljXG4gICAqIGxvb2t1cCBmb3IgdGhlIHVzZXIgYmVjYXVzZSB0aGV5IG92ZXJyb2RlIHRoZSBtYWdpYyB3aXRoIHRoZVxuICAgKiBtYW51YWwgZmxhZy5cbiAgICovXG4gIGNvbnN0IGZpbGUgPSBwcm9qZWN0RGlyICsgJy9ob3BwZmlsZS5qcydcbiAgZGVidWcoJ1VzaW5nIGhvcHBmaWxlLmpzIEAgJXMnLCBmaWxlKVxuXG4gIC8qKlxuICAgKiBMb2FkIGNhY2hlLlxuICAgKi9cbiAgY29uc3QgbG9jayA9IGF3YWl0IGNhY2hlLmxvYWQocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ3JlYXRlIGhvcHAgaW5zdGFuY2UgY3JlYXRvci5cbiAgICovXG4gIGNvbnN0IGhvcHAgPSBhd2FpdCBjcmVhdGVIb3BwKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENhY2hlIHRoZSBob3BwIGhhbmRsZXIgdG8gbWFrZSBgcmVxdWlyZSgpYCB3b3JrXG4gICAqIGluIHRoZSBob3BwZmlsZS5cbiAgICovXG4gIGNvbnN0IF9yZXNvbHZlID0gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWVcbiAgTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgPSAod2hhdCwgcGFyZW50KSA9PiB7XG4gICAgcmV0dXJuIHdoYXQgPT09ICdob3BwJyA/IHdoYXQgOiBfcmVzb2x2ZSh3aGF0LCBwYXJlbnQpXG4gIH1cblxuICByZXF1aXJlLmNhY2hlLmhvcHAgPSB7XG4gICAgaWQ6ICdob3BwJyxcbiAgICBmaWxlbmFtZTogJ2hvcHAnLFxuICAgIGxvYWRlZDogdHJ1ZSxcbiAgICBleHBvcnRzOiBob3BwXG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0YXNrcyBmcm9tIGZpbGUuXG4gICAqL1xuICBjb25zdCBbZnJvbUNhY2hlLCBidXN0ZWQsIHRhc2tEZWZuc10gPSBhd2FpdCBob3BwZmlsZS5sb2FkKGZpbGUpXG5cbiAgLyoqXG4gICAqIFBhcnNlIGZyb20gY2FjaGUuXG4gICAqL1xuICBpZiAoZnJvbUNhY2hlKSB7XG4gICAgLy8gY3JlYXRlIGNvcHkgb2YgdGFza3MsIHdlIGRvbid0IHdhbnQgdG8gbW9kaWZ5XG4gICAgLy8gdGhlIGFjdHVhbCBnb2FsIGxpc3RcbiAgICBsZXQgZnVsbExpc3QgPSBbXS5zbGljZS5jYWxsKHRhc2tzKVxuXG4gICAgLy8gd2FsayB0aGUgZnVsbCB0cmVlXG4gICAgZnVuY3Rpb24gYWRkRGVwZW5kZW5jaWVzKHRhc2spIHtcbiAgICAgIGlmICh0YXNrRGVmbnNbdGFza10gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBmdWxsTGlzdCA9IGZ1bGxMaXN0LmNvbmNhdCh0YXNrRGVmbnNbdGFza11bMV0pXG4gICAgICAgIHRhc2tEZWZuc1t0YXNrXS5mb3JFYWNoKHN1YiA9PiBhZGREZXBlbmRlbmNpZXMoc3ViKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzdGFydCB3YWxraW5nIGZyb20gdG9wXG4gICAgZnVsbExpc3QuZm9yRWFjaCh0YXNrID0+IGFkZERlcGVuZGVuY2llcyh0YXNrKSlcblxuICAgIC8vIHBhcnNlIGFsbCB0YXNrcyBhbmQgdGhlaXIgZGVwZW5kZW5jaWVzXG4gICAgZnJvbVRyZWUodGFza0RlZm5zLCBmdWxsTGlzdClcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciB0YXNrIGNvbXBsZXRpb24uXG4gICAqL1xuICBHb2FsLmRlZmluZVRhc2tzKHRhc2tEZWZucywgYnVzdGVkKVxuICBhd2FpdCBHb2FsLmNyZWF0ZSh0YXNrcywgcHJvamVjdERpcilcblxuICAvKipcbiAgICogU3RvcmUgY2FjaGUgZm9yIGxhdGVyLlxuICAgKi9cbiAgYXdhaXQgY2FjaGUuc2F2ZShwcm9qZWN0RGlyKVxufSkoKS5jYXRjaChlcnIgPT4ge1xuICBmdW5jdGlvbiBlbmQobGFzdEVycikge1xuICAgIGVycm9yKGxhc3RFcnIgJiYgbGFzdEVyci5zdGFjayA/IGxhc3RFcnIuc3RhY2sgOiBsYXN0RXJyKVxuICAgIHByb2Nlc3MuZXhpdCgtMSlcbiAgfVxuXG4gIGNyZWF0ZUxvZ2dlci5zYXZlTG9nKHByb2plY3REaXIpXG4gICAgLnRoZW4oKCkgPT4gZW5kKGVycikpXG4gICAgLmNhdGNoKGVyciA9PiBlbmQoZXJyKSlcbn0pXG4iXX0=