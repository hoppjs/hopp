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
 * @copyright 2017 Karim Alibhai
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
const argv = (args => {
  const o = {
    _: []
  };

  for (let i = 2; i < args.length; i += 1) {
    let a = args[i];

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-H' || a === '--harmony') o.harmony = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a === '-r' || a === '--recache') process.env.RECACHE = true;else if (a[0] !== '-') o._.push(a);
  }

  return o;
})(process.argv);

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
const tasks = argv._.length === 0 ? ['default'] : argv._;(async () => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsInByb2plY3REaXIiLCJwcm9jZXNzIiwiY3dkIiwiYXJndiIsImFyZ3MiLCJvIiwiXyIsImkiLCJsZW5ndGgiLCJhIiwiaGVscCIsInZlcnNpb24iLCJ2ZXJib3NlIiwiaGFybW9ueSIsImRpcmVjdG9yeSIsImVudiIsIlJFQ0FDSEUiLCJwdXNoIiwiY29uc29sZSIsImV4aXQiLCJ0YXNrcyIsIkhPUFBfREVCVUciLCJIQVJNT05ZX0ZMQUciLCJyZXNvbHZlIiwiZmluZCIsImZpbGUiLCJsb2NrIiwibG9hZCIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJmdWxsTGlzdCIsInNsaWNlIiwiY2FsbCIsImFkZERlcGVuZGVuY2llcyIsInRhc2siLCJBcnJheSIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJkZWZpbmVUYXNrcyIsImNyZWF0ZSIsInNhdmUiLCJjYXRjaCIsImVyciIsImVuZCIsImxhc3RFcnIiLCJzdGFjayIsInNhdmVMb2ciLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxJOztBQUNaOztJQUFZQyxROztBQUNaOzs7Ozs7OztBQWZBOzs7Ozs7QUFpQkEsTUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsRUFBY0MsS0FBZCxLQUF3QixtQkFBYSxNQUFiLENBQTlCOztBQUVBOzs7O0FBSUFDLFFBQVEsUUFBUixFQUFrQkMsWUFB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K0I7QUFDN0IsVUFBSUwsVUFBVUssSUFBVixhQUEyQkMsS0FBL0IsRUFBc0M7QUFDcENMLG1CQUFXQSxTQUFTTSxNQUFULENBQWdCUCxVQUFVSyxJQUFWLEVBQWdCLENBQWhCLENBQWhCLENBQVg7QUFDQUwsa0JBQVVLLElBQVYsRUFBZ0JHLE9BQWhCLENBQXdCQyxPQUFPTCxnQkFBZ0JLLEdBQWhCLENBQS9CO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBUixhQUFTTyxPQUFULENBQWlCSCxRQUFRRCxnQkFBZ0JDLElBQWhCLENBQXpCOztBQUVBO0FBQ0Esd0JBQVNMLFNBQVQsRUFBb0JDLFFBQXBCO0FBQ0Q7O0FBRUQ7OztBQUdBaEQsT0FBS3lELFdBQUwsQ0FBaUJWLFNBQWpCLEVBQTRCRCxNQUE1QjtBQUNBLFFBQU05QyxLQUFLMEQsTUFBTCxDQUFZOUIsS0FBWixFQUFtQnBCLFVBQW5CLENBQU47O0FBRUE7OztBQUdBLFFBQU1ULE1BQU00RCxJQUFOLENBQVduRCxVQUFYLENBQU47QUFDRCxDQTFHQSxJQTBHSW9ELEtBMUdKLENBMEdVQyxPQUFPO0FBQ2hCLFdBQVNDLEdBQVQsQ0FBYUMsT0FBYixFQUFzQjtBQUNwQjNELFVBQU0yRCxXQUFXQSxRQUFRQyxLQUFuQixHQUEyQkQsUUFBUUMsS0FBbkMsR0FBMkNELE9BQWpEO0FBQ0F0RCxZQUFRa0IsSUFBUixDQUFhLENBQUMsQ0FBZDtBQUNEOztBQUVELGdCQUFhc0MsT0FBYixDQUFxQnpELFVBQXJCLEVBQ0cwRCxJQURILENBQ1EsTUFBTUosSUFBSUQsR0FBSixDQURkLEVBRUdELEtBRkgsQ0FFU0MsT0FBT0MsSUFBSUQsR0FBSixDQUZoQjtBQUdELENBbkhBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBpbmRleC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaVxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IE1vZHVsZSBmcm9tICdtb2R1bGUnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUhvcHAgZnJvbSAnLi9ob3BwJ1xuaW1wb3J0IGZyb21UcmVlIGZyb20gJy4vdGFza3MvdHJlZSdcbmltcG9ydCAqIGFzIEdvYWwgZnJvbSAnLi90YXNrcy9nb2FsJ1xuaW1wb3J0ICogYXMgaG9wcGZpbGUgZnJvbSAnLi9ob3BwZmlsZSdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi91dGlscy9sb2cnXG5cbmNvbnN0IHsgbG9nLCBkZWJ1ZywgZXJyb3IgfSA9IGNyZWF0ZUxvZ2dlcignaG9wcCcpXG5cbi8qKlxuICogRXh0ZW5kIHRoZSBudW1iZXIgb2YgZGVmYXVsdCBsaXN0ZW5lcnMgYmVjYXVzZSAxMFxuICogZ2V0cyBoaXQgcHJldHR5IHF1aWNrbHkgd2l0aCBwaXBpbmcgc3RyZWFtcy5cbiAqL1xucmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSA1MFxuXG4vKipcbiAqIFRoaXMgaXMgcmVzb2x2ZWQgdG8gdGhlIGRpcmVjdG9yeSB3aXRoIGEgaG9wcGZpbGUgbGF0ZXJcbiAqIG9uIGJ1dCBpdCBpcyBnbG9iYWxseSBzY29wZWQgaW4gdGhpcyBtb2R1bGUgc28gdGhhdCB3ZSBjYW5cbiAqIHNhdmUgZGVidWcgbG9ncyB0byBpdC5cbiAqL1xubGV0IHByb2plY3REaXIgPSBwcm9jZXNzLmN3ZCgpXG5cbi8qKlxuICogUGFyc2UgYXJnc1xuICovXG5jb25zdCBhcmd2ID0gKGFyZ3MgPT4ge1xuICBjb25zdCBvID0ge1xuICAgIF86IFtdXG4gIH1cblxuICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBsZXQgYSA9IGFyZ3NbaV1cblxuICAgIGlmIChhID09PSAnLWgnIHx8IGEgPT09ICctLWhlbHAnKSBvLmhlbHAgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1WJyB8fCBhID09PSAnLS12ZXJzaW9uJykgby52ZXJzaW9uID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctdicgfHwgYSA9PT0gJy0tdmVyYm9zZScpIG8udmVyYm9zZSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLUgnIHx8IGEgPT09ICctLWhhcm1vbnknKSBvLmhhcm1vbnkgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGEgPT09ICctcicgfHwgYSA9PT0gJy0tcmVjYWNoZScpIHByb2Nlc3MuZW52LlJFQ0FDSEUgPSB0cnVlXG4gICAgZWxzZSBpZiAoYVswXSAhPT0gJy0nKSBvLl8ucHVzaChhKVxuICB9XG5cbiAgcmV0dXJuIG9cbn0pKHByb2Nlc3MuYXJndilcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgY29uc29sZS5sb2coJyAgLWQsIC0tZGlyZWN0b3J5IFtkaXJdXFx0cGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeScpXG4gIGNvbnNvbGUubG9nKCcgIC1ILCAtLWhhcm1vbnlcXHRhdXRvLXRyYW5zcGlsZSBob3BwZmlsZSB3aXRoIGJhYmVsJylcbiAgY29uc29sZS5sb2coJyAgLXIsIC0tcmVjYWNoZVxcdGZvcmNlIGNhY2hlIGJ1c3RpbmcnKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIEhhcm1vbnkgZmxhZyBmb3IgdHJhbnNwaWxpbmcgaG9wcGZpbGVzLlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID0gcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHIHx8ICEhIGFyZ3YuaGFybW9ueVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kaXJlY3RvcnkgfHwgYXdhaXQgaG9wcGZpbGUuZmluZChwcm9jZXNzLmN3ZCgpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgYnVzdGVkLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIC8vIGNyZWF0ZSBjb3B5IG9mIHRhc2tzLCB3ZSBkb24ndCB3YW50IHRvIG1vZGlmeVxuICAgIC8vIHRoZSBhY3R1YWwgZ29hbCBsaXN0XG4gICAgbGV0IGZ1bGxMaXN0ID0gW10uc2xpY2UuY2FsbCh0YXNrcylcblxuICAgIC8vIHdhbGsgdGhlIGZ1bGwgdHJlZVxuICAgIGZ1bmN0aW9uIGFkZERlcGVuZGVuY2llcyh0YXNrKSB7XG4gICAgICBpZiAodGFza0RlZm5zW3Rhc2tdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZnVsbExpc3QgPSBmdWxsTGlzdC5jb25jYXQodGFza0RlZm5zW3Rhc2tdWzFdKVxuICAgICAgICB0YXNrRGVmbnNbdGFza10uZm9yRWFjaChzdWIgPT4gYWRkRGVwZW5kZW5jaWVzKHN1YikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3RhcnQgd2Fsa2luZyBmcm9tIHRvcFxuICAgIGZ1bGxMaXN0LmZvckVhY2godGFzayA9PiBhZGREZXBlbmRlbmNpZXModGFzaykpXG5cbiAgICAvLyBwYXJzZSBhbGwgdGFza3MgYW5kIHRoZWlyIGRlcGVuZGVuY2llc1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgZnVsbExpc3QpXG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGFzayBjb21wbGV0aW9uLlxuICAgKi9cbiAgR29hbC5kZWZpbmVUYXNrcyh0YXNrRGVmbnMsIGJ1c3RlZClcbiAgYXdhaXQgR29hbC5jcmVhdGUodGFza3MsIHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZnVuY3Rpb24gZW5kKGxhc3RFcnIpIHtcbiAgICBlcnJvcihsYXN0RXJyICYmIGxhc3RFcnIuc3RhY2sgPyBsYXN0RXJyLnN0YWNrIDogbGFzdEVycilcbiAgICBwcm9jZXNzLmV4aXQoLTEpXG4gIH1cblxuICBjcmVhdGVMb2dnZXIuc2F2ZUxvZyhwcm9qZWN0RGlyKVxuICAgIC50aGVuKCgpID0+IGVuZChlcnIpKVxuICAgIC5jYXRjaChlcnIgPT4gZW5kKGVycikpXG59KVxuIl19