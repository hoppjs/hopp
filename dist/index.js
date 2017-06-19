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
 * Extend the number of default listeners because 10
 * gets hit pretty quickly with piping streams.
 */
);require('events').EventEmitter.defaultMaxListeners = 50;

/**
 * Parse args
 */
const argv = (args => {
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
  };const [fromCache, busted, taskDefns] = await hoppfile.load(file

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
        fullList = fullList.concat(taskDefns[task][1]);
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
  Goal.defineTasks(taskDefns, busted);
  await Goal.create(tasks, projectDir

  /**
   * Store cache for later.
   */
  );await cache.save(projectDir);
})().catch(err => {
  error(err.stack || err);
  process.exit(-1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsIkdvYWwiLCJob3BwZmlsZSIsImxvZyIsImRlYnVnIiwiZXJyb3IiLCJyZXF1aXJlIiwiRXZlbnRFbWl0dGVyIiwiZGVmYXVsdE1heExpc3RlbmVycyIsImFyZ3YiLCJhcmdzIiwibyIsIl8iLCJpIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImhhcm1vbnkiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwiSEFSTU9OWV9GTEFHIiwicHJvamVjdERpciIsInJlc29sdmUiLCJjd2QiLCJmaW5kIiwiZGlybmFtZSIsIl9fZGlybmFtZSIsImZpbGUiLCJsb2NrIiwibG9hZCIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJidXN0ZWQiLCJ0YXNrRGVmbnMiLCJmdWxsTGlzdCIsInNsaWNlIiwiY2FsbCIsImFkZERlcGVuZGVuY2llcyIsInRhc2siLCJBcnJheSIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJkZWZpbmVUYXNrcyIsImNyZWF0ZSIsInNhdmUiLCJjYXRjaCIsImVyciIsInN0YWNrIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxJOztBQUNaOztJQUFZQyxROztBQUNaOzs7Ozs7OztBQWZBOzs7Ozs7QUFpQkEsTUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsRUFBY0MsS0FBZCxLQUF3QixtQkFBYTs7QUFFM0M7Ozs7QUFGOEIsQ0FBOUIsQ0FNQUMsUUFBUSxRQUFSLEVBQWtCQyxZQUFsQixDQUErQkMsbUJBQS9CLEdB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QUFoQixDQUEvQjtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQVIsYUFBU08sT0FBVCxDQUFpQkgsUUFBUUQsZ0JBQWdCQyxJQUFoQjs7QUFFekI7QUFGQSxNQUdBLG9CQUFTTCxTQUFULEVBQW9CQyxRQUFwQjtBQUNEOztBQUVEOzs7QUFHQWpELE9BQUswRCxXQUFMLENBQWlCVixTQUFqQixFQUE0QkQsTUFBNUI7QUFDQSxRQUFNL0MsS0FBSzJELE1BQUwsQ0FBWW5DLEtBQVosRUFBbUJJOztBQUV6Qjs7O0FBRk0sR0FBTixDQUtBLE1BQU03QixNQUFNNkQsSUFBTixDQUFXaEMsVUFBWCxDQUFOO0FBQ0QsQ0ExR0EsSUEwR0lpQyxLQTFHSixDQTBHVUMsT0FBTztBQUNoQjFELFFBQU0wRCxJQUFJQyxLQUFKLElBQWFELEdBQW5CO0FBQ0F6QyxVQUFRRSxJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0QsQ0E3R0EiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIGluZGV4LmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgTW9kdWxlIGZyb20gJ21vZHVsZSdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlSG9wcCBmcm9tICcuL2hvcHAnXG5pbXBvcnQgZnJvbVRyZWUgZnJvbSAnLi90YXNrcy90cmVlJ1xuaW1wb3J0ICogYXMgR29hbCBmcm9tICcuL3Rhc2tzL2dvYWwnXG5pbXBvcnQgKiBhcyBob3BwZmlsZSBmcm9tICcuL2hvcHBmaWxlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuL3V0aWxzL2xvZydcblxuY29uc3QgeyBsb2csIGRlYnVnLCBlcnJvciB9ID0gY3JlYXRlTG9nZ2VyKCdob3BwJylcblxuLyoqXG4gKiBFeHRlbmQgdGhlIG51bWJlciBvZiBkZWZhdWx0IGxpc3RlbmVycyBiZWNhdXNlIDEwXG4gKiBnZXRzIGhpdCBwcmV0dHkgcXVpY2tseSB3aXRoIHBpcGluZyBzdHJlYW1zLlxuICovXG5yZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDUwXG5cbi8qKlxuICogUGFyc2UgYXJnc1xuICovXG5jb25zdCBhcmd2ID0gKGFyZ3MgPT4ge1xuICBjb25zdCBvID0ge1xuICAgIF86IFtdXG4gIH1cblxuICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBsZXQgYSA9IGFyZ3NbaV1cblxuICAgIGlmIChhID09PSAnLWgnIHx8IGEgPT09ICctLWhlbHAnKSBvLmhlbHAgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1WJyB8fCBhID09PSAnLS12ZXJzaW9uJykgby52ZXJzaW9uID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctdicgfHwgYSA9PT0gJy0tdmVyYm9zZScpIG8udmVyYm9zZSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLUgnIHx8IGEgPT09ICctLWhhcm1vbnknKSBvLmhhcm1vbnkgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLUgsIC0taGFybW9ueVxcdGF1dG8tdHJhbnNwaWxlIGhvcHBmaWxlIGZlYXR1cmVzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIEhhcm1vbnkgZmxhZyBmb3IgdHJhbnNwaWxpbmcgaG9wcGZpbGVzLlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID0gcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHIHx8ICEhIGFyZ3YuaGFybW9ueVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgY29uc3QgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kaXJlY3RvcnkgfHwgYXdhaXQgaG9wcGZpbGUuZmluZChwYXRoLmRpcm5hbWUoX19kaXJuYW1lKSkpXG5cbiAgLyoqXG4gICAqIFNldCBob3BwZmlsZSBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgcHJvamVjdC5cbiAgICogXG4gICAqIFRoaXMgd2lsbCBjYXVzZSBlcnJvcnMgbGF0ZXIgaWYgdGhlIGRpcmVjdG9yeSB3YXMgc3VwcGxpZWRcbiAgICogbWFudWFsbHkgYnV0IGNvbnRhaW5zIG5vIGhvcHBmaWxlLiBXZSBkb24ndCB3YW50IHRvIGRvIGEgbWFnaWNcbiAgICogbG9va3VwIGZvciB0aGUgdXNlciBiZWNhdXNlIHRoZXkgb3ZlcnJvZGUgdGhlIG1hZ2ljIHdpdGggdGhlXG4gICAqIG1hbnVhbCBmbGFnLlxuICAgKi9cbiAgY29uc3QgZmlsZSA9IHByb2plY3REaXIgKyAnL2hvcHBmaWxlLmpzJ1xuICBkZWJ1ZygnVXNpbmcgaG9wcGZpbGUuanMgQCAlcycsIGZpbGUpXG5cbiAgLyoqXG4gICAqIExvYWQgY2FjaGUuXG4gICAqL1xuICBjb25zdCBsb2NrID0gYXdhaXQgY2FjaGUubG9hZChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgaG9wcCBpbnN0YW5jZSBjcmVhdG9yLlxuICAgKi9cbiAgY29uc3QgaG9wcCA9IGF3YWl0IGNyZWF0ZUhvcHAocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ2FjaGUgdGhlIGhvcHAgaGFuZGxlciB0byBtYWtlIGByZXF1aXJlKClgIHdvcmtcbiAgICogaW4gdGhlIGhvcHBmaWxlLlxuICAgKi9cbiAgY29uc3QgX3Jlc29sdmUgPSBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZVxuICBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSA9ICh3aGF0LCBwYXJlbnQpID0+IHtcbiAgICByZXR1cm4gd2hhdCA9PT0gJ2hvcHAnID8gd2hhdCA6IF9yZXNvbHZlKHdoYXQsIHBhcmVudClcbiAgfVxuXG4gIHJlcXVpcmUuY2FjaGUuaG9wcCA9IHtcbiAgICBpZDogJ2hvcHAnLFxuICAgIGZpbGVuYW1lOiAnaG9wcCcsXG4gICAgbG9hZGVkOiB0cnVlLFxuICAgIGV4cG9ydHM6IGhvcHBcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHRhc2tzIGZyb20gZmlsZS5cbiAgICovXG4gIGNvbnN0IFtmcm9tQ2FjaGUsIGJ1c3RlZCwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGxldCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyB3YWxrIHRoZSBmdWxsIHRyZWVcbiAgICBmdW5jdGlvbiBhZGREZXBlbmRlbmNpZXModGFzaykge1xuICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZ1bGxMaXN0ID0gZnVsbExpc3QuY29uY2F0KHRhc2tEZWZuc1t0YXNrXVsxXSlcbiAgICAgICAgdGFza0RlZm5zW3Rhc2tdLmZvckVhY2goc3ViID0+IGFkZERlcGVuZGVuY2llcyhzdWIpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdhbGtpbmcgZnJvbSB0b3BcbiAgICBmdWxsTGlzdC5mb3JFYWNoKHRhc2sgPT4gYWRkRGVwZW5kZW5jaWVzKHRhc2spKVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIEdvYWwuZGVmaW5lVGFza3ModGFza0RlZm5zLCBidXN0ZWQpXG4gIGF3YWl0IEdvYWwuY3JlYXRlKHRhc2tzLCBwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBTdG9yZSBjYWNoZSBmb3IgbGF0ZXIuXG4gICAqL1xuICBhd2FpdCBjYWNoZS5zYXZlKHByb2plY3REaXIpXG59KSgpLmNhdGNoKGVyciA9PiB7XG4gIGVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gIHByb2Nlc3MuZXhpdCgtMSlcbn0pXG4iXX0=