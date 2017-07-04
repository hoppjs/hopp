'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @file index.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

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
  s: ['skip', 'skip any building (just updates the lockfile)'],
  v: ['verbose', 'enable debug messages'],
  V: ['version', 'get version info'],
  h: ['help', 'display this message']

  // parse via minimist
};var largestArg = '';
var argv = require('minimist')(process.argv.slice(2), {
  string: ['directory', 'd', 'require', 'r', 'jobs', 'j'],

  boolean: ['recache', 'R', 'verbose', 'v', 'version', 'V', 'help', 'h', 'skip', 's']
});

// expose argv to env
process.env.RECACHE = argv.recache || argv.R;
process.env.WEB_CONCURRENCY = argv.jobs || argv.j;
process.env.SKIP_BUILD = argv.skip || argv.s;

/**
 * Print help.
 */
function help() {
  console.log('usage: hopp [OPTIONS] [TASKS]');
  console.log('');

  for (var a in args) {
    console.log('  -%s, --%s%s%s', a, args[a][0], ' '.repeat(largestArg.length - args[a][0].length + 2), args[a][1]);
  }

  process.exit(1);
}

if (argv.version || argv.V) {
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
if (argv.help || argv.h) {
  help();
}

/**
 * Set tasks.
 */
var tasks = argv._.length === 0 ? ['default'] : argv._;

/**
 * Require whatever needs to be loaded.
 */
argv.require = argv.require || argv.r;
if (argv.require) {
  ;(argv.require instanceof Array ? argv.require : [argv.require]).forEach(function (mod) {
    return require(mod);
  });
}

/**
 * Pass verbosity through to the env.
 */
process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !!argv.verbose || !!argv.v;
debug('Setting HOPP_DEBUG = %j', process.env.HOPP_DEBUG);

/**
 * If project directory not specified, do lookup for the
 * hoppfile.js
 */
projectDir = function (directory) {
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
}(argv.directory || hoppfile.find(process.cwd()));

/**
 * Set hoppfile location relative to the project.
 *
 * This will cause errors later if the directory was supplied
 * manually but contains no hoppfile. We don't want to do a magic
 * lookup for the user because they overrode the magic with the
 * manual flag.
 */
var file = projectDir + '/hoppfile.js';
debug('Using hoppfile.js @ %s', file);

/**
 * Load cache.
 */
cache.load(projectDir);

/**
 * Create hopp instance creator.
 */
var hopp = (0, _hopp2.default)(projectDir);

/**
 * Cache the hopp handler to make `require()` work
 * in the hoppfile.
 */
var _resolve = _module2.default._resolveFilename;
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
};
var _hoppfile$load = hoppfile.load(file),
    _hoppfile$load2 = _slicedToArray(_hoppfile$load, 3),
    fromCache = _hoppfile$load2[0],
    busted = _hoppfile$load2[1],
    taskDefns = _hoppfile$load2[2];

/**
 * Parse from cache.
 */


if (fromCache) {
  // create copy of tasks, we don't want to modify
  // the actual goal list
  var fullList = [].slice.call(tasks);

  // walk the full tree
  var addDependencies = function addDependencies(task) {
    if (taskDefns[task] instanceof Array) {
      fullList = fullList.concat(taskDefns[task][1]);
      taskDefns[task][1].forEach(function (sub) {
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
Goal.create(tasks, projectDir).then(function () {
  /**
   * Store cache for later, then exit.
   */
  cache.save(projectDir);
  process.exit(0);
}, function (err) {
  function end(lastErr) {
    if (lastErr) {
      error(lastErr && lastErr.stack ? lastErr.stack : lastErr);
    }

    process.exit(-1);
  }

  error(err && err.stack ? err.stack : err);

  _log2.default.saveLog(projectDir).then(function () {
    return end();
  }).catch(function (err) {
    return end(err);
  });
});

//# sourceMappingURL=index.js.map