'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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
  j: ['jobs', 'set number of jobs to use for parallel tasks'],
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

// expose argv to env
process.env.RECACHE = argv.recache;
process.env.WEB_CONCURRENCY = argv.jobs;

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
  var file, hopp, _resolve, _ref2, _ref3, fromCache, busted, taskDefns, fullList, addDependencies;

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
          _context.next = 17;
          return (0, _hopp2.default)(projectDir);

        case 17:
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
          };_context.next = 23;
          return hoppfile.load(file);

        case 23:
          _ref2 = _context.sent;
          _ref3 = _slicedToArray(_ref2, 3);
          fromCache = _ref3[0];
          busted = _ref3[1];
          taskDefns = _ref3[2];


          /**
           * Parse from cache.
           */
          if (fromCache) {
            // create copy of tasks, we don't want to modify
            // the actual goal list
            fullList = [].slice.call(tasks);

            // walk the full tree

            addDependencies = function addDependencies(task) {
              if (taskDefns[task] instanceof Array) {
                fullList = fullList.concat(taskDefns[task][1]);
                taskDefns[task].forEach(function (sub) {
                  return addDependencies(sub);
                });
              }
            };

            // start walking from top


            fullList.forEach(function (task) {
              return addDependencies(task);
            });

            // parse all tasks and their dependencies
            (0, _tree2.default)(taskDefns, fullList);
          }

          /**
           * Wait for task completion.
           */
          Goal.defineTasks(taskDefns, busted);
          _context.next = 32;
          return Goal.create(tasks, projectDir);

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
//# sourceMappingURL=index.js.map