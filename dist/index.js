'use strict';

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

/**
 * @file index.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const { log, debug, error } = (0, _log2.default)('hopp');

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
  v: ['verbose', 'enable debug messages'],
  V: ['version', 'get version info'],
  h: ['help', 'display this message']

  // parse via minimist
};let largestArg = '';
const argv = require('minimist')(process.argv.slice(2), {
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

// expose to env
process.env.RECACHE = argv.recache;

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
  const lock = await cache.load(projectDir);

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
    function addDependencies(task) {
      if (taskDefns[task] instanceof Array) {
        fullList = fullList.concat(taskDefns[task][1]);
        taskDefns[task].forEach(sub => addDependencies(sub));
      }
    }

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
})().catch(err => {
  function end(lastErr) {
    error(lastErr && lastErr.stack ? lastErr.stack : lastErr);
    process.exit(-1);
  }

  _log2.default.saveLog(projectDir).then(() => end(err)).catch(err => end(err));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsInByb2plY3REaXIiLCJwcm9jZXNzIiwiY3dkIiwiYXJncyIsImQiLCJyIiwiUiIsInYiLCJWIiwiaCIsImxhcmdlc3RBcmciLCJhcmd2Iiwic2xpY2UiLCJhbGlhcyIsIm8iLCJhIiwiaGFzT3duUHJvcGVydHkiLCJsZW5ndGgiLCJlbnYiLCJSRUNBQ0hFIiwicmVjYWNoZSIsImhlbHAiLCJjb25zb2xlIiwicmVwZWF0IiwiZXhpdCIsInZlcnNpb24iLCJ0YXNrcyIsIl8iLCJBcnJheSIsImZvckVhY2giLCJtb2QiLCJIT1BQX0RFQlVHIiwidmVyYm9zZSIsIkhBUk1PTllfRkxBRyIsImhhcm1vbnkiLCJkaXJlY3RvcnkiLCJyZXNvbHZlIiwiZmluZCIsImZpbGUiLCJsb2NrIiwibG9hZCIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJmdWxsTGlzdCIsImNhbGwiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiY29uY2F0Iiwic3ViIiwiZGVmaW5lVGFza3MiLCJjcmVhdGUiLCJzYXZlIiwiY2F0Y2giLCJlcnIiLCJlbmQiLCJsYXN0RXJyIiwic3RhY2siLCJzYXZlTG9nIiwidGhlbiJdLCJtYXBwaW5ncyI6Ijs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUMsSTs7QUFDWjs7SUFBWUMsUTs7QUFDWjs7Ozs7Ozs7QUFmQTs7Ozs7O0FBaUJBLE1BQU0sRUFBRUMsR0FBRixFQUFP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ckUsVUFBTXFFLFdBQVdBLFFBQVFDLEtBQW5CLEdBQTJCRCxRQUFRQyxLQUFuQyxHQUEyQ0QsT0FBakQ7QUFDQWhFLFlBQVF1QixJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0Q7O0FBRUQsZ0JBQWEyQyxPQUFiLENBQXFCbkUsVUFBckIsRUFDR29FLElBREgsQ0FDUSxNQUFNSixJQUFJRCxHQUFKLENBRGQsRUFFR0QsS0FGSCxDQUVTQyxPQUFPQyxJQUFJRCxHQUFKLENBRmhCO0FBR0QsQ0FuSEEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIGluZGV4LmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IE1vZHVsZSBmcm9tICdtb2R1bGUnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUhvcHAgZnJvbSAnLi9ob3BwJ1xuaW1wb3J0IGZyb21UcmVlIGZyb20gJy4vdGFza3MvdHJlZSdcbmltcG9ydCAqIGFzIEdvYWwgZnJvbSAnLi90YXNrcy9nb2FsJ1xuaW1wb3J0ICogYXMgaG9wcGZpbGUgZnJvbSAnLi9ob3BwZmlsZSdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi91dGlscy9sb2cnXG5cbmNvbnN0IHsgbG9nLCBkZWJ1ZywgZXJyb3IgfSA9IGNyZWF0ZUxvZ2dlcignaG9wcCcpXG5cbi8qKlxuICogRXh0ZW5kIHRoZSBudW1iZXIgb2YgZGVmYXVsdCBsaXN0ZW5lcnMgYmVjYXVzZSAxMFxuICogZ2V0cyBoaXQgcHJldHR5IHF1aWNrbHkgd2l0aCBwaXBpbmcgc3RyZWFtcy5cbiAqL1xucmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSA1MFxuXG4vKipcbiAqIFRoaXMgaXMgcmVzb2x2ZWQgdG8gdGhlIGRpcmVjdG9yeSB3aXRoIGEgaG9wcGZpbGUgbGF0ZXJcbiAqIG9uIGJ1dCBpdCBpcyBnbG9iYWxseSBzY29wZWQgaW4gdGhpcyBtb2R1bGUgc28gdGhhdCB3ZSBjYW5cbiAqIHNhdmUgZGVidWcgbG9ncyB0byBpdC5cbiAqL1xubGV0IHByb2plY3REaXIgPSBwcm9jZXNzLmN3ZCgpXG5cbi8qKlxuICogUGFyc2UgYXJnc1xuICovXG5jb25zdCBhcmdzID0ge1xuICBkOiBbJ2RpcmVjdG9yeScsICdzZXQgcGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeSddLFxuICByOiBbJ3JlcXVpcmUnLCAncmVxdWlyZSBhIG1vZHVsZSBiZWZvcmUgZG9pbmcgYW55dGhpbmcnXSxcbiAgUjogWydyZWNhY2hlJywgJ2ZvcmNlIGNhY2hlIGJ1c3RpbmcnXSxcbiAgdjogWyd2ZXJib3NlJywgJ2VuYWJsZSBkZWJ1ZyBtZXNzYWdlcyddLFxuICBWOiBbJ3ZlcnNpb24nLCAnZ2V0IHZlcnNpb24gaW5mbyddLFxuICBoOiBbJ2hlbHAnLCAnZGlzcGxheSB0aGlzIG1lc3NhZ2UnXVxufVxuXG4vLyBwYXJzZSB2aWEgbWluaW1pc3RcbmxldCBsYXJnZXN0QXJnID0gJydcbmNvbnN0IGFyZ3YgPSByZXF1aXJlKCdtaW5pbWlzdCcpKHByb2Nlc3MuYXJndi5zbGljZSgyKSwge1xuICBhbGlhczogKCgpID0+IHtcbiAgICBjb25zdCBvID0ge31cblxuICAgIGZvciAobGV0IGEgaW4gYXJncykge1xuICAgICAgaWYgKGFyZ3MuaGFzT3duUHJvcGVydHkoYSkpIHtcbiAgICAgICAgb1thXSA9IGFyZ3NbYV1bMF1cblxuICAgICAgICBpZiAoYXJnc1thXVswXS5sZW5ndGggPiBsYXJnZXN0QXJnLmxlbmd0aCkge1xuICAgICAgICAgIGxhcmdlc3RBcmcgPSBhcmdzW2FdWzBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb1xuICB9KSgpXG59KVxuXG4vLyBleHBvc2UgdG8gZW52XG5wcm9jZXNzLmVudi5SRUNBQ0hFID0gYXJndi5yZWNhY2hlXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIFxuICBmb3IgKGxldCBhIGluIGFyZ3MpIHtcbiAgICBpZiAoYXJncy5oYXNPd25Qcm9wZXJ0eShhKSkge1xuICAgICAgY29uc29sZS5sb2coJyAgLSVzLCAtLSVzJXMlcycsIGEsIGFyZ3NbYV1bMF0sICcgJy5yZXBlYXQobGFyZ2VzdEFyZy5sZW5ndGggLSBhcmdzW2FdWzBdLmxlbmd0aCArIDIpLCBhcmdzW2FdWzFdKVxuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbi8qKlxuICogUmVxdWlyZSB3aGF0ZXZlciBuZWVkcyB0byBiZSBsb2FkZWQuXG4gKi9cbmlmIChhcmd2LnJlcXVpcmUpIHtcbiAgOyhhcmd2LnJlcXVpcmUgaW5zdGFuY2VvZiBBcnJheSA/IGFyZ3YucmVxdWlyZSA6IFthcmd2LnJlcXVpcmVdKVxuICAgIC5mb3JFYWNoKG1vZCA9PiByZXF1aXJlKG1vZCkpXG59XG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIEhhcm1vbnkgZmxhZyBmb3IgdHJhbnNwaWxpbmcgaG9wcGZpbGVzLlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID0gcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHIHx8ICEhIGFyZ3YuaGFybW9ueVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kaXJlY3RvcnkgfHwgYXdhaXQgaG9wcGZpbGUuZmluZChwcm9jZXNzLmN3ZCgpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgYnVzdGVkLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIC8vIGNyZWF0ZSBjb3B5IG9mIHRhc2tzLCB3ZSBkb24ndCB3YW50IHRvIG1vZGlmeVxuICAgIC8vIHRoZSBhY3R1YWwgZ29hbCBsaXN0XG4gICAgbGV0IGZ1bGxMaXN0ID0gW10uc2xpY2UuY2FsbCh0YXNrcylcblxuICAgIC8vIHdhbGsgdGhlIGZ1bGwgdHJlZVxuICAgIGZ1bmN0aW9uIGFkZERlcGVuZGVuY2llcyh0YXNrKSB7XG4gICAgICBpZiAodGFza0RlZm5zW3Rhc2tdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZnVsbExpc3QgPSBmdWxsTGlzdC5jb25jYXQodGFza0RlZm5zW3Rhc2tdWzFdKVxuICAgICAgICB0YXNrRGVmbnNbdGFza10uZm9yRWFjaChzdWIgPT4gYWRkRGVwZW5kZW5jaWVzKHN1YikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3RhcnQgd2Fsa2luZyBmcm9tIHRvcFxuICAgIGZ1bGxMaXN0LmZvckVhY2godGFzayA9PiBhZGREZXBlbmRlbmNpZXModGFzaykpXG5cbiAgICAvLyBwYXJzZSBhbGwgdGFza3MgYW5kIHRoZWlyIGRlcGVuZGVuY2llc1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgZnVsbExpc3QpXG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGFzayBjb21wbGV0aW9uLlxuICAgKi9cbiAgR29hbC5kZWZpbmVUYXNrcyh0YXNrRGVmbnMsIGJ1c3RlZClcbiAgYXdhaXQgR29hbC5jcmVhdGUodGFza3MsIHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZnVuY3Rpb24gZW5kKGxhc3RFcnIpIHtcbiAgICBlcnJvcihsYXN0RXJyICYmIGxhc3RFcnIuc3RhY2sgPyBsYXN0RXJyLnN0YWNrIDogbGFzdEVycilcbiAgICBwcm9jZXNzLmV4aXQoLTEpXG4gIH1cblxuICBjcmVhdGVMb2dnZXIuc2F2ZUxvZyhwcm9qZWN0RGlyKVxuICAgIC50aGVuKCgpID0+IGVuZChlcnIpKVxuICAgIC5jYXRjaChlcnIgPT4gZW5kKGVycikpXG59KVxuIl19