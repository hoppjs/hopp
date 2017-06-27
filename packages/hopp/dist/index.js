'use strict';

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

/**
 * @file index.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const { debug, error } = (0, _log2.default)('hopp');

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
let projectDir = process.cwd();

/**
 * Parse args
 */
const args = {
  d: ['directory', 'set path to project directory'],
  r: ['require', 'require a module before doing anything'],
  R: ['recache', 'force cache busting'],
  j: ['jobs', 'set number of jobs to use for parallel tasks'],
  v: ['verbose', 'enable debug messages'],
  V: ['version', 'get version info'],
  h: ['help', 'display this message']

  // parse via minimist
};let largestArg = '';
const argv = require('minimist')(process.argv.slice(2), {
  string: ['directory', 'require', 'jobs'],

  boolean: ['recache', 'verbose', 'version', 'help'],

  alias: (() => {
    const o = {};

    for (let a in args) {
      if (args.hasOwnProperty(a)) {
        o[a] = args[a][0];

        if (args[a][0].length > largestArg.length) {
          largestArg = args[a][0];
        }
      }
    }

    return o;
  })()
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

  for (let a in args) {
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
const tasks = argv._.length === 0 ? ['default'] : argv._;

/**
 * Require whatever needs to be loaded.
 */
if (argv.require) {
  ;(argv.require instanceof Array ? argv.require : [argv.require]).forEach(mod => require(mod));
}

;(async () => {
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
  projectDir = (directory => {
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
  })(argv.directory || (await hoppfile.find(process.cwd())));

  /**
   * Set hoppfile location relative to the project.
   *
   * This will cause errors later if the directory was supplied
   * manually but contains no hoppfile. We don't want to do a magic
   * lookup for the user because they overrode the magic with the
   * manual flag.
   */
  const file = projectDir + '/hoppfile.js';
  debug('Using hoppfile.js @ %s', file);

  /**
   * Load cache.
   */
  await cache.load(projectDir);

  /**
   * Create hopp instance creator.
   */
  const hopp = await (0, _hopp2.default)(projectDir);

  /**
   * Cache the hopp handler to make `require()` work
   * in the hoppfile.
   */
  const _resolve = _module2.default._resolveFilename;
  _module2.default._resolveFilename = (what, parent) => {
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
  };const [fromCache, busted, taskDefns] = await hoppfile.load(file);

  /**
   * Parse from cache.
   */
  if (fromCache) {
    // create copy of tasks, we don't want to modify
    // the actual goal list
    let fullList = [].slice.call(tasks);

    // walk the full tree
    const addDependencies = task => {
      if (taskDefns[task] instanceof Array) {
        fullList = fullList.concat(taskDefns[task][1]);
        taskDefns[task].forEach(sub => addDependencies(sub));
      }
    };

    // start walking from top
    fullList.forEach(task => addDependencies(task));

    // parse all tasks and their dependencies
    (0, _tree2.default)(taskDefns, fullList);
  }

  /**
   * Wait for task completion.
   */
  Goal.defineTasks(taskDefns, busted);
  await Goal.create(tasks, projectDir);

  /**
   * Store cache for later.
   */
  await cache.save(projectDir);
})().then(() => {
  process.exit(0);
}, err => {
  function end(lastErr) {
    error(lastErr && lastErr.stack ? lastErr.stack : lastErr);
    process.exit(-1);
  }

  _log2.default.saveLog(projectDir).then(() => end(err)).catch(err => end(err));
});
//# sourceMappingURL=index.js.map