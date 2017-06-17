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
   * Run tasks.
   */
  let goal;

  if (tasks.length === 1) {
    let name = tasks[0];
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = (0, _parallel2.default)(goal, taskDefns);
    }

    goal = (async () => {
      try {
        await goal.start(name, projectDir);
      } catch (err) {
        (0, _log2.default)(`hopp:${name}`).error(err.stack || err);
        throw 'Build failed.';
      }
    })();
  } else {
    goal = Promise.all(tasks.map(async name => {
      let task = taskDefns[name];

      if (task instanceof Array) {
        task = (0, _parallel2.default)(task, taskDefns);
      }

      try {
        await task.start(name, projectDir);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwibG9nIiwiZGVidWciLCJlcnJvciIsImFyZ3YiLCJhcmdzIiwibyIsIl8iLCJpIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImhhcm1vbnkiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwicmVxdWlyZSIsInRhc2tzIiwiZW52IiwiSE9QUF9ERUJVRyIsIkhBUk1PTllfRkxBRyIsInByb2plY3REaXIiLCJyZXNvbHZlIiwiY3dkIiwiZmluZCIsImRpcm5hbWUiLCJfX2Rpcm5hbWUiLCJmaWxlIiwibG9jayIsImxvYWQiLCJob3BwIiwiX3Jlc29sdmUiLCJfcmVzb2x2ZUZpbGVuYW1lIiwid2hhdCIsInBhcmVudCIsImlkIiwiZmlsZW5hbWUiLCJsb2FkZWQiLCJleHBvcnRzIiwiZnJvbUNhY2hlIiwidGFza0RlZm5zIiwiZnVsbExpc3QiLCJzbGljZSIsImNhbGwiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiQXJyYXkiLCJjb25jYXQiLCJmb3JFYWNoIiwic3ViIiwiZ29hbCIsIm5hbWUiLCJzdGFydCIsImVyciIsInN0YWNrIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInNhdmUiLCJjYXRjaCJdLCJtYXBwaW5ncyI6Ijs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUMsUTs7QUFDWjs7OztBQUNBOzs7Ozs7OztBQWZBOzs7Ozs7QUFpQkEsTUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsRUFBY0MsS0FBZCxLQUF3QixtQkFBYTs7QUFFM0M7OztBQUY4QixDQUE5QixDQUtBLE1BQU1DLE9BQU8sQ0FBQ0MsUUFBUTtBQUNwQixRQUFNQyxJQUFJO0FBQ1JDLE9BQUc7QUFESyxHQUFWOztBQUlBLE9BQUssSUFBSUMsSUFB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QUFXckMsVUFBWCxDQUFOO0FBQ0QsQ0EvSUEsSUErSUlzQyxLQS9JSixDQStJVU4sT0FBTztBQUNoQnRELFFBQU1zRCxJQUFJQyxLQUFKLElBQWFELEdBQW5CO0FBQ0F4QyxVQUFRRSxJQUFSLENBQWEsQ0FBQyxDQUFkO0FBQ0QsQ0FsSkEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIGluZGV4LmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgTW9kdWxlIGZyb20gJ21vZHVsZSdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlSG9wcCBmcm9tICcuL2hvcHAnXG5pbXBvcnQgZnJvbVRyZWUgZnJvbSAnLi90YXNrcy90cmVlJ1xuaW1wb3J0ICogYXMgaG9wcGZpbGUgZnJvbSAnLi9ob3BwZmlsZSdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi90YXNrcy9wYXJhbGxlbCdcblxuY29uc3QgeyBsb2csIGRlYnVnLCBlcnJvciB9ID0gY3JlYXRlTG9nZ2VyKCdob3BwJylcblxuLyoqXG4gKiBQYXJzZSBhcmdzXG4gKi9cbmNvbnN0IGFyZ3YgPSAoYXJncyA9PiB7XG4gIGNvbnN0IG8gPSB7XG4gICAgXzogW11cbiAgfVxuXG4gIGZvciAobGV0IGkgPSAyOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGxldCBhID0gYXJnc1tpXVxuXG4gICAgaWYgKGEgPT09ICctaCcgfHwgYSA9PT0gJy0taGVscCcpIG8uaGVscCA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLVYnIHx8IGEgPT09ICctLXZlcnNpb24nKSBvLnZlcnNpb24gPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy12JyB8fCBhID09PSAnLS12ZXJib3NlJykgby52ZXJib3NlID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctSCcgfHwgYSA9PT0gJy0taGFybW9ueScpIG8uaGFybW9ueSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLWQnIHx8IGEgPT09ICctLWRpcmVjdG9yeScpIG8uZGlyZWN0b3J5ID0gYXJnc1srK2ldXG4gICAgZWxzZSBpZiAoYVswXSAhPT0gJy0nKSBvLl8ucHVzaChhKVxuICB9XG5cbiAgcmV0dXJuIG9cbn0pKHByb2Nlc3MuYXJndilcblxuLyoqXG4gKiBQcmludCBoZWxwLlxuICovXG5mdW5jdGlvbiBoZWxwKCkge1xuICBjb25zb2xlLmxvZygndXNhZ2U6IGhvcHAgW09QVElPTlNdIFtUQVNLU10nKVxuICBjb25zb2xlLmxvZygnJylcbiAgY29uc29sZS5sb2coJyAgLWQsIC0tZGlyZWN0b3J5IFtkaXJdXFx0cGF0aCB0byBwcm9qZWN0IGRpcmVjdG9yeScpXG4gIGNvbnNvbGUubG9nKCcgIC12LCAtLXZlcmJvc2VcXHRlbmFibGUgZGVidWcgbWVzc2FnZXMnKVxuICBjb25zb2xlLmxvZygnICAtSCwgLS1oYXJtb255XFx0YXV0by10cmFuc3BpbGUgaG9wcGZpbGUgZmVhdHVyZXMnKVxuICBjb25zb2xlLmxvZygnICAtViwgLS12ZXJzaW9uXFx0Z2V0IHZlcnNpb24gaW5mbycpXG4gIGNvbnNvbGUubG9nKCcgIC1oLCAtLWhlbHBcXHRkaXNwbGF5IHRoaXMgbWVzc2FnZScpXG5cbiAgcHJvY2Vzcy5leGl0KDEpXG59XG5cbmlmIChhcmd2LnZlcnNpb24pIHtcbiAgY29uc29sZS5sb2cocmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvbilcbiAgcHJvY2Vzcy5leGl0KDApXG59XG5cbi8qKlxuICogQ3VycmVudGx5IHRoZSBvbmx5IHdheSBmb3IgaGVscCB0byBiZSBjYWxsZWQuXG4gKiBMYXRlciwgaXQgc2hvdWxkIGFsc28gaGFwcGVuIG9uIGludmFsaWQgYXJncyBidXQgd2VcbiAqIGRvbid0IGhhdmUgaW52YWxpZCBhcmd1bWVudHMgeWV0LlxuICogXG4gKiBJbnZhbGlkIGFyZ3VtZW50cyBpcyBhIGZsYWcgbWlzdXNlIC0gbmV2ZXIgYSBtaXNzaW5nXG4gKiB0YXNrLiBUaGF0IGVycm9yIHNob3VsZCBiZSBtb3JlIG1pbmltYWwgYW5kIHNlcGFyYXRlLlxuICovXG5pZiAoYXJndi5oZWxwKSB7XG4gIGhlbHAoKVxufVxuXG4vKipcbiAqIFNldCB0YXNrcy5cbiAqL1xuY29uc3QgdGFza3MgPSBhcmd2Ll8ubGVuZ3RoID09PSAwID8gWydkZWZhdWx0J10gOiBhcmd2Ll9cblxuOyhhc3luYyAoKSA9PiB7XG4gIC8qKlxuICAgKiBQYXNzIHZlcmJvc2l0eSB0aHJvdWdoIHRvIHRoZSBlbnYuXG4gICAqL1xuICBwcm9jZXNzLmVudi5IT1BQX0RFQlVHID0gcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyB8fCAhISBhcmd2LnZlcmJvc2VcbiAgZGVidWcoJ1NldHRpbmcgSE9QUF9ERUJVRyA9ICVqJywgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRylcblxuICAvKipcbiAgICogSGFybW9ueSBmbGFnIGZvciB0cmFuc3BpbGluZyBob3BwZmlsZXMuXG4gICAqL1xuICBwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgPSBwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgfHwgISEgYXJndi5oYXJtb255XG5cbiAgLyoqXG4gICAqIElmIHByb2plY3QgZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQsIGRvIGxvb2t1cCBmb3IgdGhlXG4gICAqIGhvcHBmaWxlLmpzXG4gICAqL1xuICBjb25zdCBwcm9qZWN0RGlyID0gKGRpcmVjdG9yeSA9PiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgZG9uJ3QgbmVlZCBjb3JyZWN0aW5nXG4gICAgaWYgKGRpcmVjdG9yeVswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gc29ydC1vZiByZWxhdGl2ZXMgc2hvdWxkIGJlIG1hZGUgaW50byByZWxhdGl2ZVxuICAgIGlmIChkaXJlY3RvcnlbMF0gIT09ICcuJykge1xuICAgICAgZGlyZWN0b3J5ID0gJy4vJyArIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIG1hcCB0byBjdXJyZW50IGRpcmVjdG9yeVxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgZGlyZWN0b3J5KVxuICB9KShhcmd2LmRpcmVjdG9yeSB8fCBhd2FpdCBob3BwZmlsZS5maW5kKHBhdGguZGlybmFtZShfX2Rpcm5hbWUpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGxldCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyB3YWxrIHRoZSBmdWxsIHRyZWVcbiAgICBmdW5jdGlvbiBhZGREZXBlbmRlbmNpZXModGFzaykge1xuICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZ1bGxMaXN0ID0gZnVsbExpc3QuY29uY2F0KHRhc2tEZWZuc1t0YXNrXSlcbiAgICAgICAgdGFza0RlZm5zW3Rhc2tdLmZvckVhY2goc3ViID0+IGFkZERlcGVuZGVuY2llcyhzdWIpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdhbGtpbmcgZnJvbSB0b3BcbiAgICBmdWxsTGlzdC5mb3JFYWNoKHRhc2sgPT4gYWRkRGVwZW5kZW5jaWVzKHRhc2spKVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrcy5cbiAgICovXG4gIGxldCBnb2FsXG5cbiAgaWYgKHRhc2tzLmxlbmd0aCA9PT0gMSkge1xuICAgIGxldCBuYW1lID0gdGFza3NbMF1cbiAgICBnb2FsID0gdGFza0RlZm5zW3Rhc2tzWzBdXVxuICAgIFxuICAgIGlmIChnb2FsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGdvYWwgPSBjcmVhdGVQYXJhbGxlbChnb2FsLCB0YXNrRGVmbnMpXG4gICAgfVxuXG4gICAgZ29hbCA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnb2FsLnN0YXJ0KG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgbGV0IHRhc2sgPSB0YXNrRGVmbnNbbmFtZV1cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gY3JlYXRlUGFyYWxsZWwodGFzaywgdGFza0RlZm5zKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0YXNrLnN0YXJ0KG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIGF3YWl0IGdvYWxcblxuICAvKipcbiAgICogU3RvcmUgY2FjaGUgZm9yIGxhdGVyLlxuICAgKi9cbiAgYXdhaXQgY2FjaGUuc2F2ZShwcm9qZWN0RGlyKVxufSkoKS5jYXRjaChlcnIgPT4ge1xuICBlcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICBwcm9jZXNzLmV4aXQoLTEpXG59KVxuIl19