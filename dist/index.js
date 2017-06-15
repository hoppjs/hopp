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

const argv = (args => {
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

    goal = goal.start();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwibG9nIiwiZGVidWciLCJlcnJvciIsInJlcXVpcmUiLCJhcmd2IiwiYXJncyIsIm8iLCJfIiwiaSIsImxlbmd0aCIsImEiLCJoZWxwIiwidmVyc2lvbiIsInZlcmJvc2UiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwicHJvamVjdERpciIsInJlc29sdmUiLCJjd2QiLCJmaW5kIiwiZGlybmFtZSIsIl9fZGlybmFtZSIsImZpbGUiLCJsb2NrIiwibG9hZCIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJ0YXNrRGVmbnMiLCJnb2FsIiwiQXJyYXkiLCJzdGFydCIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0YXNrIiwic2F2ZSIsImNhdGNoIiwiZXJyIiwic3RhY2siXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLFE7O0FBQ1o7Ozs7Ozs7O0FBRUEsTUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsRUFBY0MsS0FBZCxLQUF3QkMsUUFBUSxhQUFSLEVBQXVCOztBQUVyRDs7O0FBRjhCLENBQTlCLEMsQ0FoQkE7Ozs7OztBQXFCQSxNQUFNQyxPQUFPLENBQUNDLFFBQVE7QUFDcEIsUUFBTUMsSUFBSTtBQUNSQyxPQUFHO0FBREssR0FBVjs7QUFJQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUgsS0FBS0ksTUFBekIsRUFBaUNELEtBQUssQ0FBdEMsRUFBeUM7QUFDdkMsUUFBSUUsSUFBSUwsS0FBS0csQ0FBTCxDQUFSOztBQUVB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ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWlcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBob3BwZmlsZSBmcm9tICcuL2hvcHBmaWxlJ1xuaW1wb3J0IGNyZWF0ZVBhcmFsbGVsIGZyb20gJy4vdGFza3MvcGFyYWxsZWwnXG5cbmNvbnN0IHsgbG9nLCBkZWJ1ZywgZXJyb3IgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIElmIHByb2plY3QgZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQsIGRvIGxvb2t1cCBmb3IgdGhlXG4gICAqIGhvcHBmaWxlLmpzXG4gICAqL1xuICBjb25zdCBwcm9qZWN0RGlyID0gKGRpcmVjdG9yeSA9PiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgZG9uJ3QgbmVlZCBjb3JyZWN0aW5nXG4gICAgaWYgKGRpcmVjdG9yeVswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gc29ydC1vZiByZWxhdGl2ZXMgc2hvdWxkIGJlIG1hZGUgaW50byByZWxhdGl2ZVxuICAgIGlmIChkaXJlY3RvcnlbMF0gIT09ICcuJykge1xuICAgICAgZGlyZWN0b3J5ID0gJy4vJyArIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIG1hcCB0byBjdXJyZW50IGRpcmVjdG9yeVxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgZGlyZWN0b3J5KVxuICB9KShhcmd2LmRpcmVjdG9yeSB8fCBhd2FpdCBob3BwZmlsZS5maW5kKHBhdGguZGlybmFtZShfX2Rpcm5hbWUpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIHRhc2tzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrcy5cbiAgICovXG4gIGxldCBnb2FsXG5cbiAgaWYgKHRhc2tzLmxlbmd0aCA9PT0gMSkge1xuICAgIGdvYWwgPSB0YXNrRGVmbnNbdGFza3NbMF1dXG4gICAgXG4gICAgaWYgKGdvYWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZ29hbCA9IGNyZWF0ZVBhcmFsbGVsKGdvYWwpXG4gICAgfVxuICAgIFxuICAgIGdvYWwgPSBnb2FsLnN0YXJ0KClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKHRhc2sgPT4ge1xuICAgICAgdGFzayA9IHRhc2tEZWZuc1t0YXNrXVxuXG4gICAgICBpZiAodGFzayBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRhc2sgPSBjcmVhdGVQYXJhbGxlbCh0YXNrKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGFzay5zdGFydCgpXG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGFzayBjb21wbGV0aW9uLlxuICAgKi9cbiAgYXdhaXQgZ29hbFxuXG4gIC8qKlxuICAgKiBTdG9yZSBjYWNoZSBmb3IgbGF0ZXIuXG4gICAqL1xuICBhd2FpdCBjYWNoZS5zYXZlKHByb2plY3REaXIpXG59KSgpLmNhdGNoKGVyciA9PiB7XG4gIGVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gIHByb2Nlc3MuZXhpdCgtMSlcbn0pXG4iXX0=