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

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { log, debug, error } = require('./utils/log')('hopp'

/**
 * Parse args
 */
); /**
    * @file index.js
    * @license MIT
    * @copyright 2017 Karim Alibhai
    */

const argv = require('minimist')(process.argv.slice(2)

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

if (argv.V || argv.version) {
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
if (argv.h || argv.help) {
  help();
}

/**
 * Set tasks.
 */
const tasks = argv._.length === 0 ? ['default'] : argv._;(async () => {
  /**
   * Pass verbosity through to the env.
   */
  process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !!(argv.v || argv.verbose);
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
  })(argv.d || argv.directory || (await hoppfile.find(_path2.default.dirname(__dirname)))

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
    (0, _tree2.default)(taskDefns, tasks);
  }

  /**
   * Run tasks.
   */
  let goal;

  if (tasks.length === 1) {
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = (0, _parallel2.default)(goal);
    }

    goal.start();
  } else {
    goal = Promise.all(tasks.map(task => {
      task = taskDefns[task];

      if (task instanceof Array) {
        task = (0, _parallel2.default)(task);
      }

      return task.start();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwibG9nIiwiZGVidWciLCJlcnJvciIsInJlcXVpcmUiLCJhcmd2IiwicHJvY2VzcyIsInNsaWNlIiwiaGVscCIsImNvbnNvbGUiLCJleGl0IiwiViIsInZlcnNpb24iLCJoIiwidGFza3MiLCJfIiwibGVuZ3RoIiwiZW52IiwiSE9QUF9ERUJVRyIsInYiLCJ2ZXJib3NlIiwicHJvamVjdERpciIsImRpcmVjdG9yeSIsInJlc29sdmUiLCJjd2QiLCJkIiwiZmluZCIsImRpcm5hbWUiLCJfX2Rpcm5hbWUiLCJmaWxlIiwibG9jayIsImxvYWQiLCJob3BwIiwiX3Jlc29sdmUiLCJfcmVzb2x2ZUZpbGVuYW1lIiwid2hhdCIsInBhcmVudCIsImlkIiwiZmlsZW5hbWUiLCJsb2FkZWQiLCJleHBvcnRzIiwiZnJvbUNhY2hlIiwidGFza0RlZm5zIiwiZ29hbCIsIkFycmF5Iiwic3RhcnQiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayIsInNhdmUiLCJjYXRjaCIsImVyciIsInN0YWNrIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxROztBQUNaOzs7Ozs7OztBQUVBLE1BQU0sRUFBRUMsR0FBRixFQUFPQyxLQUFQLEVBQWNDLEtBQWQsS0FBd0JDLFFBQVEsYUFBUixFQUF1Qjs7QUFFckQ7OztBQUY4QixDQUE5QixDLENBaEJBOzs7Ozs7QUFxQkEsTUFBTUMsT0FBT0QsUUFBUSxVQUFSLEVBQW9CRSxRQUFRRCxJQUFSLENBQWFFLEtBQWIsQ0FBbUIsQ0FBbkI7O0FBRWpDOzs7QUFGYSxDQUFiLENBS0EsU0FBU0MsSUFBVCxHQUFnQjtBQUNkQyxVQUFRUixHQUFSLENBQVksK0JBQVo7QUFDQVEsVUFBUVIsR0FBUixDQUFZLEVBQVo7QUFDQVEsVUFBUVIsR0FBUixD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TztBQUNMRixXQUFPRyxRQUFRQyxHQUFSLENBQVlqQyxNQUFNa0MsR0FBTixDQUFVQyxRQUFRO0FBQ25DQSxhQUFPUCxVQUFVTyxJQUFWLENBQVA7O0FBRUEsVUFBSUEsZ0JBQWdCTCxLQUFwQixFQUEyQjtBQUN6QkssZUFBTyx3QkFBZUEsSUFBZixDQUFQO0FBQ0Q7O0FBRUQsYUFBT0EsS0FBS0osS0FBTCxFQUFQO0FBQ0QsS0FSa0IsQ0FBWixDQUFQO0FBU0Q7O0FBRUQ7OztBQUdBLFFBQU1GLElBQU47O0FBRUE7OztBQUdBLFFBQU01QyxNQUFNbUQsSUFBTixDQUFXN0IsVUFBWCxDQUFOO0FBQ0QsQ0E3R0EsSUE2R0k4QixLQTdHSixDQTZHVUMsT0FBTztBQUNoQmpELFFBQU1pRCxJQUFJQyxLQUFKLElBQWFELEdBQW5CO0FBQ0E5QyxVQUFRSSxJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0QsQ0FoSEEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIGluZGV4LmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgTW9kdWxlIGZyb20gJ21vZHVsZSdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlSG9wcCBmcm9tICcuL2hvcHAnXG5pbXBvcnQgZnJvbVRyZWUgZnJvbSAnLi90YXNrcy90cmVlJ1xuaW1wb3J0ICogYXMgaG9wcGZpbGUgZnJvbSAnLi9ob3BwZmlsZSdcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3Rhc2tzL3BhcmFsbGVsJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBQYXJzZSBhcmdzXG4gKi9cbmNvbnN0IGFyZ3YgPSByZXF1aXJlKCdtaW5pbWlzdCcpKHByb2Nlc3MuYXJndi5zbGljZSgyKSlcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgY29uc29sZS5sb2coJyAgLWQsIC0tZGlyZWN0b3J5IFtkaXJdXFx0cGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeScpXG4gIGNvbnNvbGUubG9nKCcgIC12LCAtLXZlcmJvc2VcXHRlbmFibGUgZGVidWcgbWVzc2FnZXMnKVxuICBjb25zb2xlLmxvZygnICAtViwgLS12ZXJzaW9uXFx0Z2V0IHZlcnNpb24gaW5mbycpXG4gIGNvbnNvbGUubG9nKCcgIC1oLCAtLWhlbHBcXHRkaXNwbGF5IHRoaXMgbWVzc2FnZScpXG5cbiAgcHJvY2Vzcy5leGl0KDEpXG59XG5cbmlmIChhcmd2LlYgfHwgYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaCB8fCBhcmd2LmhlbHApIHtcbiAgaGVscCgpXG59XG5cbi8qKlxuICogU2V0IHRhc2tzLlxuICovXG5jb25zdCB0YXNrcyA9IGFyZ3YuXy5sZW5ndGggPT09IDAgPyBbJ2RlZmF1bHQnXSA6IGFyZ3YuX1xuXG47KGFzeW5jICgpID0+IHtcbiAgLyoqXG4gICAqIFBhc3MgdmVyYm9zaXR5IHRocm91Z2ggdG8gdGhlIGVudi5cbiAgICovXG4gIHByb2Nlc3MuZW52LkhPUFBfREVCVUcgPSBwcm9jZXNzLmVudi5IT1BQX0RFQlVHIHx8ICEhIChhcmd2LnYgfHwgYXJndi52ZXJib3NlKVxuICBkZWJ1ZygnU2V0dGluZyBIT1BQX0RFQlVHID0gJWonLCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHKVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgY29uc3QgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kIHx8IGFyZ3YuZGlyZWN0b3J5IHx8IGF3YWl0IGhvcHBmaWxlLmZpbmQocGF0aC5kaXJuYW1lKF9fZGlybmFtZSkpKVxuXG4gIC8qKlxuICAgKiBTZXQgaG9wcGZpbGUgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIHByb2plY3QuXG4gICAqIFxuICAgKiBUaGlzIHdpbGwgY2F1c2UgZXJyb3JzIGxhdGVyIGlmIHRoZSBkaXJlY3Rvcnkgd2FzIHN1cHBsaWVkXG4gICAqIG1hbnVhbGx5IGJ1dCBjb250YWlucyBubyBob3BwZmlsZS4gV2UgZG9uJ3Qgd2FudCB0byBkbyBhIG1hZ2ljXG4gICAqIGxvb2t1cCBmb3IgdGhlIHVzZXIgYmVjYXVzZSB0aGV5IG92ZXJyb2RlIHRoZSBtYWdpYyB3aXRoIHRoZVxuICAgKiBtYW51YWwgZmxhZy5cbiAgICovXG4gIGNvbnN0IGZpbGUgPSBwcm9qZWN0RGlyICsgJy9ob3BwZmlsZS5qcydcbiAgZGVidWcoJ1VzaW5nIGhvcHBmaWxlLmpzIEAgJXMnLCBmaWxlKVxuXG4gIC8qKlxuICAgKiBMb2FkIGNhY2hlLlxuICAgKi9cbiAgY29uc3QgbG9jayA9IGF3YWl0IGNhY2hlLmxvYWQocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ3JlYXRlIGhvcHAgaW5zdGFuY2UgY3JlYXRvci5cbiAgICovXG4gIGNvbnN0IGhvcHAgPSBhd2FpdCBjcmVhdGVIb3BwKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENhY2hlIHRoZSBob3BwIGhhbmRsZXIgdG8gbWFrZSBgcmVxdWlyZSgpYCB3b3JrXG4gICAqIGluIHRoZSBob3BwZmlsZS5cbiAgICovXG4gIGNvbnN0IF9yZXNvbHZlID0gTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWVcbiAgTW9kdWxlLl9yZXNvbHZlRmlsZW5hbWUgPSAod2hhdCwgcGFyZW50KSA9PiB7XG4gICAgcmV0dXJuIHdoYXQgPT09ICdob3BwJyA/IHdoYXQgOiBfcmVzb2x2ZSh3aGF0LCBwYXJlbnQpXG4gIH1cblxuICByZXF1aXJlLmNhY2hlLmhvcHAgPSB7XG4gICAgaWQ6ICdob3BwJyxcbiAgICBmaWxlbmFtZTogJ2hvcHAnLFxuICAgIGxvYWRlZDogdHJ1ZSxcbiAgICBleHBvcnRzOiBob3BwXG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0YXNrcyBmcm9tIGZpbGUuXG4gICAqL1xuICBjb25zdCBbZnJvbUNhY2hlLCB0YXNrRGVmbnNdID0gYXdhaXQgaG9wcGZpbGUubG9hZChmaWxlKVxuXG4gIC8qKlxuICAgKiBQYXJzZSBmcm9tIGNhY2hlLlxuICAgKi9cbiAgaWYgKGZyb21DYWNoZSkge1xuICAgIGZyb21UcmVlKHRhc2tEZWZucywgdGFza3MpXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2tzLlxuICAgKi9cbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gY3JlYXRlUGFyYWxsZWwoZ29hbClcbiAgICB9XG4gICAgXG4gICAgZ29hbC5zdGFydCgpXG4gIH0gZWxzZSB7XG4gICAgZ29hbCA9IFByb21pc2UuYWxsKHRhc2tzLm1hcCh0YXNrID0+IHtcbiAgICAgIHRhc2sgPSB0YXNrRGVmbnNbdGFza11cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gY3JlYXRlUGFyYWxsZWwodGFzaylcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhc2suc3RhcnQoKVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIGF3YWl0IGdvYWxcblxuICAvKipcbiAgICogU3RvcmUgY2FjaGUgZm9yIGxhdGVyLlxuICAgKi9cbiAgYXdhaXQgY2FjaGUuc2F2ZShwcm9qZWN0RGlyKVxufSkoKS5jYXRjaChlcnIgPT4ge1xuICBlcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICBwcm9jZXNzLmV4aXQoLTEpXG59KVxuIl19