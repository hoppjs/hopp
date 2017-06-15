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

var _hoppfile = require('./hoppfile');

var hoppfile = _interopRequireWildcard(_hoppfile);

var _log = require('./utils/log');

var _log2 = _interopRequireDefault(_log);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

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

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a[0] !== '-') o._.push(a);
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
   * If project directory not specified, do lookup for the
   * hoppfile.js
   */
  );const projectDir = (directory => {
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
    const fullList = [].slice.call(tasks

    // loop until we walk the whole tree
    );while (true) {
      let length = fullList.length;

      // add task dependencies to list
      tasks.forEach(task => {
        if (taskDefns[task] instanceof Array) {
          fullList.push(task);
        }
      }

      // once length is unchanging, we've hit the bottom
      // of the tree
      );if (length === fullList.length) {
        break;
      }
    }

    // parse all tasks and their dependencies
    (0, _tree2.default)(taskDefns, fullList);
  }

  /**
   * Run tasks.
   */
  let goal;

  if (tasks.length === 1) {
    let name = tasks[0];
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = (0, _parallel2.default)(name, goal, taskDefns);
    }

    goal = (async () => {
      try {
        await goal.start(name);
      } catch (err) {
        (0, _log2.default)(`hopp:${name}`).error(err.stack || err);
        throw 'Build failed.';
      }
    })();
  } else {
    goal = Promise.all(tasks.map(async name => {
      let task = taskDefns[name];

      if (task instanceof Array) {
        task = (0, _parallel2.default)(name, task, taskDefns);
      }

      try {
        await task.start(name);
      } catch (err) {
        (0, _log2.default)(`hopp:${name}`).error(err.stack || err);
        throw 'Build failed.';
      }
    }));
  }

  /**
   * Wait for task completion.
   */
  await goal;

  /**
   * Store cache for later.
   */
  await cache.save(projectDir);
})().catch(err => {
  error(err.stack || err);
  process.exit(-1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwibG9nIiwiZGVidWciLCJlcnJvciIsImFyZ3YiLCJhcmdzIiwibyIsIl8iLCJpIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImRpcmVjdG9yeSIsInB1c2giLCJwcm9jZXNzIiwiY29uc29sZSIsImV4aXQiLCJyZXF1aXJlIiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwicHJvamVjdERpciIsInJlc29sdmUiLCJjd2QiLCJmaW5kIiwiZGlybmFtZSIsIl9fZGlybmFtZSIsImZpbGUiLCJsb2NrIiwibG9hZCIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJ0YXNrRGVmbnMiLCJmdWxsTGlzdCIsInNsaWNlIiwiY2FsbCIsImZvckVhY2giLCJ0YXNrIiwiQXJyYXkiLCJnb2FsIiwibmFtZSIsInN0YXJ0IiwiZXJyIiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwic2F2ZSIsImNhdGNoIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxROztBQUNaOzs7O0FBQ0E7Ozs7Ozs7O0FBZkE7Ozs7OztBQWlCQSxNQUFNLEVBQUVDLEdBQUYsRUFBT0MsS0FBUCxFQUFjQyxLQUFkLEtBQXdCLG1CQUFhOztBQUUzQzs7O0FBRjhCLENBQTlCLENBS0EsTUFBTUMsT0FBTyxDQUFDQyxRQUFRO0FBQ3BCLFFBQU1DLElBQUk7QUFDUkMsT0FBRztBQURLLEdBQVY7O0FBSUEsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlILEtBQUtJLE1BQXpCLEVBQWlDRCxLQUFLLENBQXRDLEVBQXlDO0FB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QUFMLENBQVdELElBQVgsQ0FBTjtBQUNELE9BRkQsQ0FFRSxPQUFPRSxHQUFQLEVBQVk7QUFDWiwyQkFBYyxRQUFPRixJQUFLLEVBQTFCLEVBQTZCL0MsS0FBN0IsQ0FBbUNpRCxJQUFJQyxLQUFKLElBQWFELEdBQWhEO0FBQ0EsY0FBTyxlQUFQO0FBQ0Q7QUFDRixLQVBNLEdBQVA7QUFRRCxHQWhCRCxNQWdCTztBQUNMSCxXQUFPSyxRQUFRQyxHQUFSLENBQVluQyxNQUFNb0MsR0FBTixDQUFVLE1BQU1OLElBQU4sSUFBYztBQUN6QyxVQUFJSCxPQUFPTCxVQUFVUSxJQUFWLENBQVg7O0FBRUEsVUFBSUgsZ0JBQWdCQyxLQUFwQixFQUEyQjtBQUN6QkQsZUFBTyx3QkFBZUcsSUFBZixFQUFxQkgsSUFBckIsRUFBMkJMLFNBQTNCLENBQVA7QUFDRDs7QUFFRCxVQUFJO0FBQ0YsY0FBTUssS0FBS0ksS0FBTCxDQUFXRCxJQUFYLENBQU47QUFDRCxPQUZELENBRUUsT0FBT0UsR0FBUCxFQUFZO0FBQ1osMkJBQWMsUUFBT0YsSUFBSyxFQUExQixFQUE2Qi9DLEtBQTdCLENBQW1DaUQsSUFBSUMsS0FBSixJQUFhRCxHQUFoRDtBQUNBLGNBQU8sZUFBUDtBQUNEO0FBQ0YsS0Fia0IsQ0FBWixDQUFQO0FBY0Q7O0FBRUQ7OztBQUdBLFFBQU1ILElBQU47O0FBRUE7OztBQUdBLFFBQU1sRCxNQUFNMEQsSUFBTixDQUFXbEMsVUFBWCxDQUFOO0FBQ0QsQ0FqSkEsSUFpSkltQyxLQWpKSixDQWlKVU4sT0FBTztBQUNoQmpELFFBQU1pRCxJQUFJQyxLQUFKLElBQWFELEdBQW5CO0FBQ0FwQyxVQUFRRSxJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0QsQ0FwSkEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIGluZGV4LmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgTW9kdWxlIGZyb20gJ21vZHVsZSdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlSG9wcCBmcm9tICcuL2hvcHAnXG5pbXBvcnQgZnJvbVRyZWUgZnJvbSAnLi90YXNrcy90cmVlJ1xuaW1wb3J0ICogYXMgaG9wcGZpbGUgZnJvbSAnLi9ob3BwZmlsZSdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi90YXNrcy9wYXJhbGxlbCdcblxuY29uc3QgeyBsb2csIGRlYnVnLCBlcnJvciB9ID0gY3JlYXRlTG9nZ2VyKCdob3BwJylcblxuLyoqXG4gKiBQYXJzZSBhcmdzXG4gKi9cbmNvbnN0IGFyZ3YgPSAoYXJncyA9PiB7XG4gIGNvbnN0IG8gPSB7XG4gICAgXzogW11cbiAgfVxuXG4gIGZvciAobGV0IGkgPSAyOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGxldCBhID0gYXJnc1tpXVxuXG4gICAgaWYgKGEgPT09ICctaCcgfHwgYSA9PT0gJy0taGVscCcpIG8uaGVscCA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLVYnIHx8IGEgPT09ICctLXZlcnNpb24nKSBvLnZlcnNpb24gPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy12JyB8fCBhID09PSAnLS12ZXJib3NlJykgby52ZXJib3NlID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctZCcgfHwgYSA9PT0gJy0tZGlyZWN0b3J5Jykgby5kaXJlY3RvcnkgPSBhcmdzWysraV1cbiAgICBlbHNlIGlmIChhWzBdICE9PSAnLScpIG8uXy5wdXNoKGEpXG4gIH1cblxuICByZXR1cm4gb1xufSkocHJvY2Vzcy5hcmd2KVxuXG4vKipcbiAqIFByaW50IGhlbHAuXG4gKi9cbmZ1bmN0aW9uIGhlbHAoKSB7XG4gIGNvbnNvbGUubG9nKCd1c2FnZTogaG9wcCBbT1BUSU9OU10gW1RBU0tTXScpXG4gIGNvbnNvbGUubG9nKCcnKVxuICBjb25zb2xlLmxvZygnICAtZCwgLS1kaXJlY3RvcnkgW2Rpcl1cXHRwYXRoIHRvIHByb2plY3QgZGlyZWN0b3J5JylcbiAgY29uc29sZS5sb2coJyAgLXYsIC0tdmVyYm9zZVxcdGVuYWJsZSBkZWJ1ZyBtZXNzYWdlcycpXG4gIGNvbnNvbGUubG9nKCcgIC1WLCAtLXZlcnNpb25cXHRnZXQgdmVyc2lvbiBpbmZvJylcbiAgY29uc29sZS5sb2coJyAgLWgsIC0taGVscFxcdGRpc3BsYXkgdGhpcyBtZXNzYWdlJylcblxuICBwcm9jZXNzLmV4aXQoMSlcbn1cblxuaWYgKGFyZ3YudmVyc2lvbikge1xuICBjb25zb2xlLmxvZyhyZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uKVxuICBwcm9jZXNzLmV4aXQoMClcbn1cblxuLyoqXG4gKiBDdXJyZW50bHkgdGhlIG9ubHkgd2F5IGZvciBoZWxwIHRvIGJlIGNhbGxlZC5cbiAqIExhdGVyLCBpdCBzaG91bGQgYWxzbyBoYXBwZW4gb24gaW52YWxpZCBhcmdzIGJ1dCB3ZVxuICogZG9uJ3QgaGF2ZSBpbnZhbGlkIGFyZ3VtZW50cyB5ZXQuXG4gKiBcbiAqIEludmFsaWQgYXJndW1lbnRzIGlzIGEgZmxhZyBtaXN1c2UgLSBuZXZlciBhIG1pc3NpbmdcbiAqIHRhc2suIFRoYXQgZXJyb3Igc2hvdWxkIGJlIG1vcmUgbWluaW1hbCBhbmQgc2VwYXJhdGUuXG4gKi9cbmlmIChhcmd2LmhlbHApIHtcbiAgaGVscCgpXG59XG5cbi8qKlxuICogU2V0IHRhc2tzLlxuICovXG5jb25zdCB0YXNrcyA9IGFyZ3YuXy5sZW5ndGggPT09IDAgPyBbJ2RlZmF1bHQnXSA6IGFyZ3YuX1xuXG47KGFzeW5jICgpID0+IHtcbiAgLyoqXG4gICAqIFBhc3MgdmVyYm9zaXR5IHRocm91Z2ggdG8gdGhlIGVudi5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhPUFBfREVCVUcgPSBwcm9jZXNzLmVudi5IT1BQX0RFQlVHIHx8ICEhIGFyZ3YudmVyYm9zZVxuICBkZWJ1ZygnU2V0dGluZyBIT1BQX0RFQlVHID0gJWonLCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHKVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgY29uc3QgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kaXJlY3RvcnkgfHwgYXdhaXQgaG9wcGZpbGUuZmluZChwYXRoLmRpcm5hbWUoX19kaXJuYW1lKSkpXG5cbiAgLyoqXG4gICAqIFNldCBob3BwZmlsZSBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgcHJvamVjdC5cbiAgICogXG4gICAqIFRoaXMgd2lsbCBjYXVzZSBlcnJvcnMgbGF0ZXIgaWYgdGhlIGRpcmVjdG9yeSB3YXMgc3VwcGxpZWRcbiAgICogbWFudWFsbHkgYnV0IGNvbnRhaW5zIG5vIGhvcHBmaWxlLiBXZSBkb24ndCB3YW50IHRvIGRvIGEgbWFnaWNcbiAgICogbG9va3VwIGZvciB0aGUgdXNlciBiZWNhdXNlIHRoZXkgb3ZlcnJvZGUgdGhlIG1hZ2ljIHdpdGggdGhlXG4gICAqIG1hbnVhbCBmbGFnLlxuICAgKi9cbiAgY29uc3QgZmlsZSA9IHByb2plY3REaXIgKyAnL2hvcHBmaWxlLmpzJ1xuICBkZWJ1ZygnVXNpbmcgaG9wcGZpbGUuanMgQCAlcycsIGZpbGUpXG5cbiAgLyoqXG4gICAqIExvYWQgY2FjaGUuXG4gICAqL1xuICBjb25zdCBsb2NrID0gYXdhaXQgY2FjaGUubG9hZChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgaG9wcCBpbnN0YW5jZSBjcmVhdG9yLlxuICAgKi9cbiAgY29uc3QgaG9wcCA9IGF3YWl0IGNyZWF0ZUhvcHAocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ2FjaGUgdGhlIGhvcHAgaGFuZGxlciB0byBtYWtlIGByZXF1aXJlKClgIHdvcmtcbiAgICogaW4gdGhlIGhvcHBmaWxlLlxuICAgKi9cbiAgY29uc3QgX3Jlc29sdmUgPSBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZVxuICBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSA9ICh3aGF0LCBwYXJlbnQpID0+IHtcbiAgICByZXR1cm4gd2hhdCA9PT0gJ2hvcHAnID8gd2hhdCA6IF9yZXNvbHZlKHdoYXQsIHBhcmVudClcbiAgfVxuXG4gIHJlcXVpcmUuY2FjaGUuaG9wcCA9IHtcbiAgICBpZDogJ2hvcHAnLFxuICAgIGZpbGVuYW1lOiAnaG9wcCcsXG4gICAgbG9hZGVkOiB0cnVlLFxuICAgIGV4cG9ydHM6IGhvcHBcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHRhc2tzIGZyb20gZmlsZS5cbiAgICovXG4gIGNvbnN0IFtmcm9tQ2FjaGUsIHRhc2tEZWZuc10gPSBhd2FpdCBob3BwZmlsZS5sb2FkKGZpbGUpXG5cbiAgLyoqXG4gICAqIFBhcnNlIGZyb20gY2FjaGUuXG4gICAqL1xuICBpZiAoZnJvbUNhY2hlKSB7XG4gICAgLy8gY3JlYXRlIGNvcHkgb2YgdGFza3MsIHdlIGRvbid0IHdhbnQgdG8gbW9kaWZ5XG4gICAgLy8gdGhlIGFjdHVhbCBnb2FsIGxpc3RcbiAgICBjb25zdCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyBsb29wIHVudGlsIHdlIHdhbGsgdGhlIHdob2xlIHRyZWVcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IGxlbmd0aCA9IGZ1bGxMaXN0Lmxlbmd0aFxuXG4gICAgICAvLyBhZGQgdGFzayBkZXBlbmRlbmNpZXMgdG8gbGlzdFxuICAgICAgdGFza3MuZm9yRWFjaCh0YXNrID0+IHtcbiAgICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgZnVsbExpc3QucHVzaCh0YXNrKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBvbmNlIGxlbmd0aCBpcyB1bmNoYW5naW5nLCB3ZSd2ZSBoaXQgdGhlIGJvdHRvbVxuICAgICAgLy8gb2YgdGhlIHRyZWVcbiAgICAgIGlmIChsZW5ndGggPT09IGZ1bGxMaXN0Lmxlbmd0aCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHBhcnNlIGFsbCB0YXNrcyBhbmQgdGhlaXIgZGVwZW5kZW5jaWVzXG4gICAgZnJvbVRyZWUodGFza0RlZm5zLCBmdWxsTGlzdClcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFza3MuXG4gICAqL1xuICBsZXQgZ29hbFxuXG4gIGlmICh0YXNrcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgbmFtZSA9IHRhc2tzWzBdXG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gY3JlYXRlUGFyYWxsZWwobmFtZSwgZ29hbCwgdGFza0RlZm5zKVxuICAgIH1cblxuICAgIGdvYWwgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZ29hbC5zdGFydChuYW1lKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSgpXG4gIH0gZWxzZSB7XG4gICAgZ29hbCA9IFByb21pc2UuYWxsKHRhc2tzLm1hcChhc3luYyBuYW1lID0+IHtcbiAgICAgIGxldCB0YXNrID0gdGFza0RlZm5zW25hbWVdXG5cbiAgICAgIGlmICh0YXNrIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGFzayA9IGNyZWF0ZVBhcmFsbGVsKG5hbWUsIHRhc2ssIHRhc2tEZWZucylcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGFzay5zdGFydChuYW1lKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciB0YXNrIGNvbXBsZXRpb24uXG4gICAqL1xuICBhd2FpdCBnb2FsXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgcHJvY2Vzcy5leGl0KC0xKVxufSlcbiJdfQ==