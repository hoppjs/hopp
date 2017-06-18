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

const { log, debug, error } = (0, _log2.default)('hopp'

/**
 * Parse args
 */
);const argv = (args => {
  const o = {
    _: []
  };

  for (let i = 2; i < args.length; i += 1) {
    let a = args[i];

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-H' || a === '--harmony') o.harmony = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a[0] !== '-') o._.push(a);
  }

  return o;
})(process.argv

/**
 * Print help.
 */
);function help() {
  console.log('usage: hopp [OPTIONS] [TASKS]');
  console.log('');
  console.log('  -d, --directory [dir]\tpath to project directory');
  console.log('  -v, --verbose\tenable debug messages');
  console.log('  -H, --harmony\tauto-transpile hoppfile features');
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
  debug('Setting HOPP_DEBUG = %j', process.env.HOPP_DEBUG

  /**
   * Harmony flag for transpiling hoppfiles.
   */
  );process.env.HARMONY_FLAG = process.env.HARMONY_FLAG || !!argv.harmony;

  /**
   * If project directory not specified, do lookup for the
   * hoppfile.js
   */
  const projectDir = (directory => {
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
  })(argv.directory || (await hoppfile.find(_path2.default.dirname(__dirname)))

  /**
   * Set hoppfile location relative to the project.
   * 
   * This will cause errors later if the directory was supplied
   * manually but contains no hoppfile. We don't want to do a magic
   * lookup for the user because they overrode the magic with the
   * manual flag.
   */
  );const file = projectDir + '/hoppfile.js';
  debug('Using hoppfile.js @ %s', file

  /**
   * Load cache.
   */
  );const lock = await cache.load(projectDir

  /**
   * Create hopp instance creator.
   */
  );const hopp = await (0, _hopp2.default)(projectDir

  /**
   * Cache the hopp handler to make `require()` work
   * in the hoppfile.
   */
  );const _resolve = _module2.default._resolveFilename;
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
  };const [fromCache, taskDefns] = await hoppfile.load(file

  /**
   * Parse from cache.
   */
  );if (fromCache) {
    // create copy of tasks, we don't want to modify
    // the actual goal list
    let fullList = [].slice.call(tasks

    // walk the full tree
    );function addDependencies(task) {
      if (taskDefns[task] instanceof Array) {
        fullList = fullList.concat(taskDefns[task]);
        taskDefns[task].forEach(sub => addDependencies(sub));
      }
    }

    // start walking from top
    fullList.forEach(task => addDependencies(task)

    // parse all tasks and their dependencies
    );(0, _tree2.default)(taskDefns, fullList);
  }

  /**
   * Wait for task completion.
   */
  Goal.defineTasks(taskDefns);
  await Goal.create(tasks, projectDir

  /**
   * Store cache for later.
   */
  );await cache.save(projectDir);
})().catch(err => {
  error(err.stack || err);
  process.exit(-1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJhcmd2IiwiYXJncyIsIm8iLCJfIiwiaSIsImxlbmd0aCIsImEiLCJoZWxwIiwidmVyc2lvbiIsInZlcmJvc2UiLCJoYXJtb255IiwiZGlyZWN0b3J5IiwicHVzaCIsInByb2Nlc3MiLCJjb25zb2xlIiwiZXhpdCIsInJlcXVpcmUiLCJ0YXNrcyIsImVudiIsIkhPUFBfREVCVUciLCJIQVJNT05ZX0ZMQUciLCJwcm9qZWN0RGlyIiwicmVzb2x2ZSIsImN3ZCIsImZpbmQiLCJkaXJuYW1lIiwiX19kaXJuYW1lIiwiZmlsZSIsImxvY2siLCJsb2FkIiwiaG9wcCIsIl9yZXNvbHZlIiwiX3Jlc29sdmVGaWxlbmFtZSIsIndoYXQiLCJwYXJlbnQiLCJpZCIsImZpbGVuYW1lIiwibG9hZGVkIiwiZXhwb3J0cyIsImZyb21DYWNoZSIsInRhc2tEZWZucyIsImZ1bGxMaXN0Iiwic2xpY2UiLCJjYWxsIiwiYWRkRGVwZW5kZW5jaWVzIiwidGFzayIsIkFycmF5IiwiY29uY2F0IiwiZm9yRWFjaCIsInN1YiIsImRlZmluZVRhc2tzIiwiY3JlYXRlIiwic2F2ZSIsImNhdGNoIiwiZXJyIiwic3RhY2siXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLEk7O0FBQ1o7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7O0FBZkE7Ozs7OztBQWlCQSxNQUFNLEVBQUVDLEdBQUYsRUFBT0MsS0FBUCxFQUFjQyxLQUFkLEtBQXdCLG1CQUFhOztBQUUzQzs7O0FBRjhCLENBQTlCLENBS0EsTUFBTUMsT0FBTyxDQUFDQyxRQUFRO0FBQ3BCLFFBQU1DLElBQUk7QUFDUkMsT0FBRztBQURLLEdBQVY7O0FBSUEsT0FBSyxJQUFJQyxJQUFJLENBQWIs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QUt1RCxXQUFMLENBQWlCVixTQUFqQjtBQUNBLFFBQU03QyxLQUFLd0QsTUFBTCxDQUFZbEMsS0FBWixFQUFtQkk7O0FBRXpCOzs7QUFGTSxHQUFOLENBS0EsTUFBTTNCLE1BQU0wRCxJQUFOLENBQVcvQixVQUFYLENBQU47QUFDRCxDQTFHQSxJQTBHSWdDLEtBMUdKLENBMEdVQyxPQUFPO0FBQ2hCdkQsUUFBTXVELElBQUlDLEtBQUosSUFBYUQsR0FBbkI7QUFDQXpDLFVBQVFFLElBQVIsQ0FBYSxDQUFDLENBQWQ7QUFDRCxDQTdHQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWlcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBHb2FsIGZyb20gJy4vdGFza3MvZ29hbCdcbmltcG9ydCAqIGFzIGhvcHBmaWxlIGZyb20gJy4vaG9wcGZpbGUnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4vdXRpbHMvbG9nJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSBjcmVhdGVMb2dnZXIoJ2hvcHAnKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1IJyB8fCBhID09PSAnLS1oYXJtb255Jykgby5oYXJtb255ID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctZCcgfHwgYSA9PT0gJy0tZGlyZWN0b3J5Jykgby5kaXJlY3RvcnkgPSBhcmdzWysraV1cbiAgICBlbHNlIGlmIChhWzBdICE9PSAnLScpIG8uXy5wdXNoKGEpXG4gIH1cblxuICByZXR1cm4gb1xufSkocHJvY2Vzcy5hcmd2KVxuXG4vKipcbiAqIFByaW50IGhlbHAuXG4gKi9cbmZ1bmN0aW9uIGhlbHAoKSB7XG4gIGNvbnNvbGUubG9nKCd1c2FnZTogaG9wcCBbT1BUSU9OU10gW1RBU0tTXScpXG4gIGNvbnNvbGUubG9nKCcnKVxuICBjb25zb2xlLmxvZygnICAtZCwgLS1kaXJlY3RvcnkgW2Rpcl1cXHRwYXRoIHRvIHByb2plY3QgZGlyZWN0b3J5JylcbiAgY29uc29sZS5sb2coJyAgLXYsIC0tdmVyYm9zZVxcdGVuYWJsZSBkZWJ1ZyBtZXNzYWdlcycpXG4gIGNvbnNvbGUubG9nKCcgIC1ILCAtLWhhcm1vbnlcXHRhdXRvLXRyYW5zcGlsZSBob3BwZmlsZSBmZWF0dXJlcycpXG4gIGNvbnNvbGUubG9nKCcgIC1WLCAtLXZlcnNpb25cXHRnZXQgdmVyc2lvbiBpbmZvJylcbiAgY29uc29sZS5sb2coJyAgLWgsIC0taGVscFxcdGRpc3BsYXkgdGhpcyBtZXNzYWdlJylcblxuICBwcm9jZXNzLmV4aXQoMSlcbn1cblxuaWYgKGFyZ3YudmVyc2lvbikge1xuICBjb25zb2xlLmxvZyhyZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uKVxuICBwcm9jZXNzLmV4aXQoMClcbn1cblxuLyoqXG4gKiBDdXJyZW50bHkgdGhlIG9ubHkgd2F5IGZvciBoZWxwIHRvIGJlIGNhbGxlZC5cbiAqIExhdGVyLCBpdCBzaG91bGQgYWxzbyBoYXBwZW4gb24gaW52YWxpZCBhcmdzIGJ1dCB3ZVxuICogZG9uJ3QgaGF2ZSBpbnZhbGlkIGFyZ3VtZW50cyB5ZXQuXG4gKiBcbiAqIEludmFsaWQgYXJndW1lbnRzIGlzIGEgZmxhZyBtaXN1c2UgLSBuZXZlciBhIG1pc3NpbmdcbiAqIHRhc2suIFRoYXQgZXJyb3Igc2hvdWxkIGJlIG1vcmUgbWluaW1hbCBhbmQgc2VwYXJhdGUuXG4gKi9cbmlmIChhcmd2LmhlbHApIHtcbiAgaGVscCgpXG59XG5cbi8qKlxuICogU2V0IHRhc2tzLlxuICovXG5jb25zdCB0YXNrcyA9IGFyZ3YuXy5sZW5ndGggPT09IDAgPyBbJ2RlZmF1bHQnXSA6IGFyZ3YuX1xuXG47KGFzeW5jICgpID0+IHtcbiAgLyoqXG4gICAqIFBhc3MgdmVyYm9zaXR5IHRocm91Z2ggdG8gdGhlIGVudi5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhPUFBfREVCVUcgPSBwcm9jZXNzLmVudi5IT1BQX0RFQlVHIHx8ICEhIGFyZ3YudmVyYm9zZVxuICBkZWJ1ZygnU2V0dGluZyBIT1BQX0RFQlVHID0gJWonLCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHKVxuXG4gIC8qKlxuICAgKiBIYXJtb255IGZsYWcgZm9yIHRyYW5zcGlsaW5nIGhvcHBmaWxlcy5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyA9IHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyB8fCAhISBhcmd2Lmhhcm1vbnlcblxuICAvKipcbiAgICogSWYgcHJvamVjdCBkaXJlY3Rvcnkgbm90IHNwZWNpZmllZCwgZG8gbG9va3VwIGZvciB0aGVcbiAgICogaG9wcGZpbGUuanNcbiAgICovXG4gIGNvbnN0IHByb2plY3REaXIgPSAoZGlyZWN0b3J5ID0+IHtcbiAgICAvLyBhYnNvbHV0ZSBwYXRocyBkb24ndCBuZWVkIGNvcnJlY3RpbmdcbiAgICBpZiAoZGlyZWN0b3J5WzBdID09PSAnLycpIHtcbiAgICAgIHJldHVybiBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBzb3J0LW9mIHJlbGF0aXZlcyBzaG91bGQgYmUgbWFkZSBpbnRvIHJlbGF0aXZlXG4gICAgaWYgKGRpcmVjdG9yeVswXSAhPT0gJy4nKSB7XG4gICAgICBkaXJlY3RvcnkgPSAnLi8nICsgZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gbWFwIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBkaXJlY3RvcnkpXG4gIH0pKGFyZ3YuZGlyZWN0b3J5IHx8IGF3YWl0IGhvcHBmaWxlLmZpbmQocGF0aC5kaXJuYW1lKF9fZGlybmFtZSkpKVxuXG4gIC8qKlxuICAgKiBTZXQgaG9wcGZpbGUgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIHByb2plY3QuXG4gICAqIFxuICAgKiBUaGlzIHdpbGwgY2F1c2UgZXJyb3JzIGxhdGVyIGlmIHRoZSBkaXJlY3Rvcnkgd2FzIHN1cHBsaWVkXG4gICAqIG1hbnVhbGx5IGJ1dCBjb250YWlucyBubyBob3BwZmlsZS4gV2UgZG9uJ3Qgd2FudCB0byBkbyBhIG1hZ2ljXG4gICAqIGxvb2t1cCBmb3IgdGhlIHVzZXIgYmVjYXVzZSB0aGV5IG92ZXJyb2RlIHRoZSBtYWdpYyB3aXRoIHRoZVxuICAgKiBtYW51YWwgZmxhZy5cbiAgICovXG4gIGNvbnN0IGZpbGUgPSBwcm9qZWN0RGlyICsgJy9ob3BwZmlsZS5qcydcbiAgZGVidWcoJ1VzaW5nIGhvcHBmaWxlLmpzIEAgJXMnLCBmaWxlKVxuXG4gIC8qKlxuICAgKiBMb2FkIGNhY2hlLlxuICAgKi9cbiAgY29uc3QgbG9jayA9IGF3YWl0IGNhY2hlLmxvYWQocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ3JlYXRlIGhvcHAgaW5zdGFuY2UgY3JlYXRvci5cbiAgICovXG4gIGNvbnN0IGhvcHAgPSBhd2FpdCBjcmVhdGVIb3BwKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENhY2hlIHRoZSBob3BwIGhhbmRsZXIgdG8gbWFrZSBgcmVxdWlyZSgpYCB3b3JrXG4gICAqIGluIHRoZSBob3BwZmlsZS5cbiAgICovXG4gIGNvbnN0IF9yZXNvbHZlID0gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWVcbiAgTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgPSAod2hhdCwgcGFyZW50KSA9PiB7XG4gICAgcmV0dXJuIHdoYXQgPT09ICdob3BwJyA/IHdoYXQgOiBfcmVzb2x2ZSh3aGF0LCBwYXJlbnQpXG4gIH1cblxuICByZXF1aXJlLmNhY2hlLmhvcHAgPSB7XG4gICAgaWQ6ICdob3BwJyxcbiAgICBmaWxlbmFtZTogJ2hvcHAnLFxuICAgIGxvYWRlZDogdHJ1ZSxcbiAgICBleHBvcnRzOiBob3BwXG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0YXNrcyBmcm9tIGZpbGUuXG4gICAqL1xuICBjb25zdCBbZnJvbUNhY2hlLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIC8vIGNyZWF0ZSBjb3B5IG9mIHRhc2tzLCB3ZSBkb24ndCB3YW50IHRvIG1vZGlmeVxuICAgIC8vIHRoZSBhY3R1YWwgZ29hbCBsaXN0XG4gICAgbGV0IGZ1bGxMaXN0ID0gW10uc2xpY2UuY2FsbCh0YXNrcylcblxuICAgIC8vIHdhbGsgdGhlIGZ1bGwgdHJlZVxuICAgIGZ1bmN0aW9uIGFkZERlcGVuZGVuY2llcyh0YXNrKSB7XG4gICAgICBpZiAodGFza0RlZm5zW3Rhc2tdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZnVsbExpc3QgPSBmdWxsTGlzdC5jb25jYXQodGFza0RlZm5zW3Rhc2tdKVxuICAgICAgICB0YXNrRGVmbnNbdGFza10uZm9yRWFjaChzdWIgPT4gYWRkRGVwZW5kZW5jaWVzKHN1YikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3RhcnQgd2Fsa2luZyBmcm9tIHRvcFxuICAgIGZ1bGxMaXN0LmZvckVhY2godGFzayA9PiBhZGREZXBlbmRlbmNpZXModGFzaykpXG5cbiAgICAvLyBwYXJzZSBhbGwgdGFza3MgYW5kIHRoZWlyIGRlcGVuZGVuY2llc1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgZnVsbExpc3QpXG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGFzayBjb21wbGV0aW9uLlxuICAgKi9cbiAgR29hbC5kZWZpbmVUYXNrcyh0YXNrRGVmbnMpXG4gIGF3YWl0IEdvYWwuY3JlYXRlKHRhc2tzLCBwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBTdG9yZSBjYWNoZSBmb3IgbGF0ZXIuXG4gICAqL1xuICBhd2FpdCBjYWNoZS5zYXZlKHByb2plY3REaXIpXG59KSgpLmNhdGNoKGVyciA9PiB7XG4gIGVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gIHByb2Nlc3MuZXhpdCgtMSlcbn0pXG4iXX0=