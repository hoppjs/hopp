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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsInByb2plY3REaXIiLCJwcm9jZXNzIiwiY3dkIiwiYXJndiIsImFyZ3MiLCJvIiwiXyIsImkiLCJsZW5ndGgiLCJhIiwiaGVscCIsInZlcnNpb24iLCJ2ZXJib3NlIiwiaGFybW9ueSIsImRpcmVjdG9yeSIsImVudiIsIlJFQ0FDSEUiLCJwdXNoIiwiY29uc29sZSIsImV4aXQiLCJ0YXNrcyIsIkhPUFBfREVCVUciLCJIQVJNT05ZX0ZMQUciLCJyZXNvbHZlIiwiZmluZCIsImZpbGUiLCJsb2NrIiwibG9hZCIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJmdWxsTGlzdCIsInNsaWNlIiwiY2FsbCIsImFkZERlcGVuZGVuY2llcyIsInRhc2siLCJBcnJheSIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJkZWZpbmVUYXNrcyIsImNyZWF0ZSIsInNhdmUiLCJjYXRjaCIsImVyciIsImVuZCIsImxhc3RFcnIiLCJzdGFjayIsInNhdmVMb2ciLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxJOztBQUNaOztJQUFZQyxROztBQUNaOzs7Ozs7OztBQWZBOzs7Ozs7QUFpQkEsTUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsRUFBY0MsS0FBZCxLQUF3QixtQkFBYSxNQUFiLENBQTlCOztBQUVBOzs7O0FBSUFDLFFBQVEsUUFBUixFQUFrQkMsWUFB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K0I7QUFDN0IsVUFBSUwsVUFBVUssSUFBVixhQUEyQkMsS0FBL0IsRUFBc0M7QUFDcENMLG1CQUFXQSxTQUFTTSxNQUFULENBQWdCUCxVQUFVSyxJQUFWLEVBQWdCLENBQWhCLENBQWhCLENBQVg7QUFDQUwsa0JBQVVLLElBQVYsRUFBZ0JHLE9BQWhCLENBQXdCQyxPQUFPTCxnQkFBZ0JLLEdBQWhCLENBQS9CO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBUixhQUFTTyxPQUFULENBQWlCSCxRQUFRRCxnQkFBZ0JDLElBQWhCLENBQXpCOztBQUVBO0FBQ0Esd0JBQVNMLFNBQVQsRUFBb0JDLFFBQXBCO0FBQ0Q7O0FBRUQ7OztBQUdBaEQsT0FBS3lELFdBQUwsQ0FBaUJWLFNBQWpCLEVBQTRCRCxNQUE1QjtBQUNBLFFBQU05QyxLQUFLMEQsTUFBTCxDQUFZOUIsS0FBWixFQUFtQnBCLFVBQW5CLENBQU47O0FBRUE7OztBQUdBLFFBQU1ULE1BQU00RCxJQUFOLENBQVduRCxVQUFYLENBQU47QUFDRCxDQTFHQSxJQTBHSW9ELEtBMUdKLENBMEdVQyxPQUFPO0FBQ2hCLFdBQVNDLEdBQVQsQ0FBYUMsT0FBYixFQUFzQjtBQUNwQjNELFVBQU0yRCxXQUFXQSxRQUFRQyxLQUFuQixHQUEyQkQsUUFBUUMsS0FBbkMsR0FBMkNELE9BQWpEO0FBQ0F0RCxZQUFRa0IsSUFBUixDQUFhLENBQUMsQ0FBZDtBQUNEOztBQUVELGdCQUFhc0MsT0FBYixDQUFxQnpELFVBQXJCLEVBQ0cwRCxJQURILENBQ1EsTUFBTUosSUFBSUQsR0FBSixDQURkLEVBRUdELEtBRkgsQ0FFU0MsT0FBT0MsSUFBSUQsR0FBSixDQUZoQjtBQUdELENBbkhBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBpbmRleC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBHb2FsIGZyb20gJy4vdGFza3MvZ29hbCdcbmltcG9ydCAqIGFzIGhvcHBmaWxlIGZyb20gJy4vaG9wcGZpbGUnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4vdXRpbHMvbG9nJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSBjcmVhdGVMb2dnZXIoJ2hvcHAnKVxuXG4vKipcbiAqIEV4dGVuZCB0aGUgbnVtYmVyIG9mIGRlZmF1bHQgbGlzdGVuZXJzIGJlY2F1c2UgMTBcbiAqIGdldHMgaGl0IHByZXR0eSBxdWlja2x5IHdpdGggcGlwaW5nIHN0cmVhbXMuXG4gKi9cbnJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gNTBcblxuLyoqXG4gKiBUaGlzIGlzIHJlc29sdmVkIHRvIHRoZSBkaXJlY3Rvcnkgd2l0aCBhIGhvcHBmaWxlIGxhdGVyXG4gKiBvbiBidXQgaXQgaXMgZ2xvYmFsbHkgc2NvcGVkIGluIHRoaXMgbW9kdWxlIHNvIHRoYXQgd2UgY2FuXG4gKiBzYXZlIGRlYnVnIGxvZ3MgdG8gaXQuXG4gKi9cbmxldCBwcm9qZWN0RGlyID0gcHJvY2Vzcy5jd2QoKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1IJyB8fCBhID09PSAnLS1oYXJtb255Jykgby5oYXJtb255ID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctZCcgfHwgYSA9PT0gJy0tZGlyZWN0b3J5Jykgby5kaXJlY3RvcnkgPSBhcmdzWysraV1cbiAgICBlbHNlIGlmIChhID09PSAnLXInIHx8IGEgPT09ICctLXJlY2FjaGUnKSBwcm9jZXNzLmVudi5SRUNBQ0hFID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtSCwgLS1oYXJtb255XFx0YXV0by10cmFuc3BpbGUgaG9wcGZpbGUgd2l0aCBiYWJlbCcpXG4gIGNvbnNvbGUubG9nKCcgIC1yLCAtLXJlY2FjaGVcXHRmb3JjZSBjYWNoZSBidXN0aW5nJylcbiAgY29uc29sZS5sb2coJyAgLXYsIC0tdmVyYm9zZVxcdGVuYWJsZSBkZWJ1ZyBtZXNzYWdlcycpXG4gIGNvbnNvbGUubG9nKCcgIC1WLCAtLXZlcnNpb25cXHRnZXQgdmVyc2lvbiBpbmZvJylcbiAgY29uc29sZS5sb2coJyAgLWgsIC0taGVscFxcdGRpc3BsYXkgdGhpcyBtZXNzYWdlJylcblxuICBwcm9jZXNzLmV4aXQoMSlcbn1cblxuaWYgKGFyZ3YudmVyc2lvbikge1xuICBjb25zb2xlLmxvZyhyZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uKVxuICBwcm9jZXNzLmV4aXQoMClcbn1cblxuLyoqXG4gKiBDdXJyZW50bHkgdGhlIG9ubHkgd2F5IGZvciBoZWxwIHRvIGJlIGNhbGxlZC5cbiAqIExhdGVyLCBpdCBzaG91bGQgYWxzbyBoYXBwZW4gb24gaW52YWxpZCBhcmdzIGJ1dCB3ZVxuICogZG9uJ3QgaGF2ZSBpbnZhbGlkIGFyZ3VtZW50cyB5ZXQuXG4gKiBcbiAqIEludmFsaWQgYXJndW1lbnRzIGlzIGEgZmxhZyBtaXN1c2UgLSBuZXZlciBhIG1pc3NpbmdcbiAqIHRhc2suIFRoYXQgZXJyb3Igc2hvdWxkIGJlIG1vcmUgbWluaW1hbCBhbmQgc2VwYXJhdGUuXG4gKi9cbmlmIChhcmd2LmhlbHApIHtcbiAgaGVscCgpXG59XG5cbi8qKlxuICogU2V0IHRhc2tzLlxuICovXG5jb25zdCB0YXNrcyA9IGFyZ3YuXy5sZW5ndGggPT09IDAgPyBbJ2RlZmF1bHQnXSA6IGFyZ3YuX1xuXG47KGFzeW5jICgpID0+IHtcbiAgLyoqXG4gICAqIFBhc3MgdmVyYm9zaXR5IHRocm91Z2ggdG8gdGhlIGVudi5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhPUFBfREVCVUcgPSBwcm9jZXNzLmVudi5IT1BQX0RFQlVHIHx8ICEhIGFyZ3YudmVyYm9zZVxuICBkZWJ1ZygnU2V0dGluZyBIT1BQX0RFQlVHID0gJWonLCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHKVxuXG4gIC8qKlxuICAgKiBIYXJtb255IGZsYWcgZm9yIHRyYW5zcGlsaW5nIGhvcHBmaWxlcy5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyA9IHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyB8fCAhISBhcmd2Lmhhcm1vbnlcblxuICAvKipcbiAgICogSWYgcHJvamVjdCBkaXJlY3Rvcnkgbm90IHNwZWNpZmllZCwgZG8gbG9va3VwIGZvciB0aGVcbiAgICogaG9wcGZpbGUuanNcbiAgICovXG4gIHByb2plY3REaXIgPSAoZGlyZWN0b3J5ID0+IHtcbiAgICAvLyBhYnNvbHV0ZSBwYXRocyBkb24ndCBuZWVkIGNvcnJlY3RpbmdcbiAgICBpZiAoZGlyZWN0b3J5WzBdID09PSAnLycpIHtcbiAgICAgIHJldHVybiBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBzb3J0LW9mIHJlbGF0aXZlcyBzaG91bGQgYmUgbWFkZSBpbnRvIHJlbGF0aXZlXG4gICAgaWYgKGRpcmVjdG9yeVswXSAhPT0gJy4nKSB7XG4gICAgICBkaXJlY3RvcnkgPSAnLi8nICsgZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gbWFwIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBkaXJlY3RvcnkpXG4gIH0pKGFyZ3YuZGlyZWN0b3J5IHx8IGF3YWl0IGhvcHBmaWxlLmZpbmQocHJvY2Vzcy5jd2QoKSkpXG5cbiAgLyoqXG4gICAqIFNldCBob3BwZmlsZSBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgcHJvamVjdC5cbiAgICogXG4gICAqIFRoaXMgd2lsbCBjYXVzZSBlcnJvcnMgbGF0ZXIgaWYgdGhlIGRpcmVjdG9yeSB3YXMgc3VwcGxpZWRcbiAgICogbWFudWFsbHkgYnV0IGNvbnRhaW5zIG5vIGhvcHBmaWxlLiBXZSBkb24ndCB3YW50IHRvIGRvIGEgbWFnaWNcbiAgICogbG9va3VwIGZvciB0aGUgdXNlciBiZWNhdXNlIHRoZXkgb3ZlcnJvZGUgdGhlIG1hZ2ljIHdpdGggdGhlXG4gICAqIG1hbnVhbCBmbGFnLlxuICAgKi9cbiAgY29uc3QgZmlsZSA9IHByb2plY3REaXIgKyAnL2hvcHBmaWxlLmpzJ1xuICBkZWJ1ZygnVXNpbmcgaG9wcGZpbGUuanMgQCAlcycsIGZpbGUpXG5cbiAgLyoqXG4gICAqIExvYWQgY2FjaGUuXG4gICAqL1xuICBjb25zdCBsb2NrID0gYXdhaXQgY2FjaGUubG9hZChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgaG9wcCBpbnN0YW5jZSBjcmVhdG9yLlxuICAgKi9cbiAgY29uc3QgaG9wcCA9IGF3YWl0IGNyZWF0ZUhvcHAocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ2FjaGUgdGhlIGhvcHAgaGFuZGxlciB0byBtYWtlIGByZXF1aXJlKClgIHdvcmtcbiAgICogaW4gdGhlIGhvcHBmaWxlLlxuICAgKi9cbiAgY29uc3QgX3Jlc29sdmUgPSBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZVxuICBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSA9ICh3aGF0LCBwYXJlbnQpID0+IHtcbiAgICByZXR1cm4gd2hhdCA9PT0gJ2hvcHAnID8gd2hhdCA6IF9yZXNvbHZlKHdoYXQsIHBhcmVudClcbiAgfVxuXG4gIHJlcXVpcmUuY2FjaGUuaG9wcCA9IHtcbiAgICBpZDogJ2hvcHAnLFxuICAgIGZpbGVuYW1lOiAnaG9wcCcsXG4gICAgbG9hZGVkOiB0cnVlLFxuICAgIGV4cG9ydHM6IGhvcHBcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHRhc2tzIGZyb20gZmlsZS5cbiAgICovXG4gIGNvbnN0IFtmcm9tQ2FjaGUsIGJ1c3RlZCwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGxldCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyB3YWxrIHRoZSBmdWxsIHRyZWVcbiAgICBmdW5jdGlvbiBhZGREZXBlbmRlbmNpZXModGFzaykge1xuICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZ1bGxMaXN0ID0gZnVsbExpc3QuY29uY2F0KHRhc2tEZWZuc1t0YXNrXVsxXSlcbiAgICAgICAgdGFza0RlZm5zW3Rhc2tdLmZvckVhY2goc3ViID0+IGFkZERlcGVuZGVuY2llcyhzdWIpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdhbGtpbmcgZnJvbSB0b3BcbiAgICBmdWxsTGlzdC5mb3JFYWNoKHRhc2sgPT4gYWRkRGVwZW5kZW5jaWVzKHRhc2spKVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIEdvYWwuZGVmaW5lVGFza3ModGFza0RlZm5zLCBidXN0ZWQpXG4gIGF3YWl0IEdvYWwuY3JlYXRlKHRhc2tzLCBwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBTdG9yZSBjYWNoZSBmb3IgbGF0ZXIuXG4gICAqL1xuICBhd2FpdCBjYWNoZS5zYXZlKHByb2plY3REaXIpXG59KSgpLmNhdGNoKGVyciA9PiB7XG4gIGZ1bmN0aW9uIGVuZChsYXN0RXJyKSB7XG4gICAgZXJyb3IobGFzdEVyciAmJiBsYXN0RXJyLnN0YWNrID8gbGFzdEVyci5zdGFjayA6IGxhc3RFcnIpXG4gICAgcHJvY2Vzcy5leGl0KC0xKVxuICB9XG5cbiAgY3JlYXRlTG9nZ2VyLnNhdmVMb2cocHJvamVjdERpcilcbiAgICAudGhlbigoKSA9PiBlbmQoZXJyKSlcbiAgICAuY2F0Y2goZXJyID0+IGVuZChlcnIpKVxufSlcbiJdfQ==