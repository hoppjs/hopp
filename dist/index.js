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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwibG9nIiwiZGVidWciLCJlcnJvciIsImFyZ3YiLCJhcmdzIiwibyIsIl8iLCJpIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImRpcmVjdG9yeSIsInB1c2giLCJwcm9jZXNzIiwiY29uc29sZSIsImV4aXQiLCJyZXF1aXJlIiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwicHJvamVjdERpciIsInJlc29sdmUiLCJjd2QiLCJmaW5kIiwiZGlybmFtZSIsIl9fZGlybmFtZSIsImZpbGUiLCJsb2NrIiwibG9hZCIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJ0YXNrRGVmbnMiLCJmdWxsTGlzdCIsInNsaWNlIiwiY2FsbCIsImFkZERlcGVuZGVuY2llcyIsInRhc2siLCJBcnJheSIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJnb2FsIiwibmFtZSIsInN0YXJ0IiwiZXJyIiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwic2F2ZSIsImNhdGNoIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxROztBQUNaOzs7O0FBQ0E7Ozs7Ozs7O0FBZkE7Ozs7OztBQWlCQSxNQUFNLEVBQUVDLEdBQUYsRUFBT0MsS0FBUCxFQUFjQyxLQUFkLEtBQXdCLG1CQUFhOztBQUUzQzs7O0FBRjhCLENBQTlCLENBS0EsTUFBTUMsT0FBTyxDQUFDQyxRQUFRO0FBQ3BCLFFBQU1DLElBQUk7QUFDUkMsT0FBRztBQURLLEdBQVY7O0FBSUEsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlILEtBQUtJLE1BQXpCLEVBQWlDRCxLQUFLLENBQXRDLEVBQXlDO0FBQ3ZDLFFBQUlFLElBQUlMLEtBQUtHLENBQUwsQ0FBUjs7QUFFQSxRQUFJRSxNQUFNLElBQU4sSUFBY0EsTUFBTSxRQUF4QixFQUFrQ0osRUFBRUssSUFBRixHQUFTLElBQVQsQ0FBbEMsS0FDSyxJQUFJRCxNQUFNLElBQU4sSUFBY0EsTUFBTSxXQUF4QixFQUFxQ0osRUFBRU0sT0FBRixHQUFZLElBQVosQ0FBckMsS0FDQSxJQUFJRixNQUFNLElBQU4sSUFBY0EsTUFBTSxXQUF4QixFQUFxQ0osRUFBRU8sT0FBRixHQUFZLElBQVosQ0FBckMsS0FDQSxJQUFJSCxNQUFNLElBQU4sSUFBY0EsTUFBTSxhQUF4QixFQUF1Q0osRUFBRVEsU0FBRixHQUFjVCxLQUFLLEVBQUVHLENBQVAsQ0FBZCxDQUF2QyxLQUNBLElBQUlFLEVBQUUsQ0FBRixNQUFTLEdBQWIsRUFBa0JKLEVBQUVDLENBQUYsQ0FBSVEsSUFBSixDQUFTTCxDQUFUO0FBQ3hCOztBQUVELFNBQU9KLENBQVA7QUFDRCxDQWhCWSxFQWdCVlUsUUFBUVo7O0FBRVg7OztBQWxCYSxDQUFiLENBcUJBLFNBQVNPLElBQVQsR0FBZ0I7QUFDZE0sVUFBUWhCLEdBQVIsQ0FBWSwrQkFBWjtBQUNBZ0IsVUFBUWhCLEdBQVIsQ0FBWSxFQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLG9EQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLHdDQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLG1DQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLG9DQUFaOztBQUVBZSxVQUFRRSxJQUFSLENBQWEsQ0FBYjtBQUNEOztBQUVELElBQUlkLEtBQUtRLE9BQVQsRUFBa0I7QUFDaEJLLFVBQVFoQixHQUFSLENBQVlrQixRQUFRLGlCQUFSLEVBQTJCUCxPQUF2QztBQUNBSSxVQUFRRSxJQUFSLENBQWEsQ0FBYjtBQUNEOztBQUVEOzs7Ozs7OztBQVFBLElBQUlkLEtBQUtPLElBQVQsRUFBZTtBQUNiQTtBQUNEOztBQUVEOzs7QUFHQSxNQUFNUyxRQUFRaEIsS0FBS0csQ0FBTCxDQUFPRSxNQUFQLEtBQWtCLENBQWxCLEdBQXNCLENBQUMsU0FBRCxDQUF0QixHQUFvQ0wsS0FBS0csQ0FBdkQsQ0FFQyxDQUFDLFlBQVk7QUFDWjs7O0FBR0FTLFVBQVFLLEdBQVIsQ0FBWUMsVUFBWixHQUF5Qk4sUUFBUUssR0FBUixDQUFZQyxVQUFaLElBQTBCLENBQUMsQ0FBRWxCLEtBQUtTLE9BQTNEO0FBQ0FYLFFBQU0seUJBQU4sRUFBaUNjLFFBQVFLLEdBQVIsQ0FBWUM7O0FBRTdDOzs7O0FBRkEsSUFNQSxNQUFNQyxhQUFhLENBQUNULGFBQWE7QUFDL0I7QUFDQSxRQUFJQSxVQUFVLENBQVYsTUFBaUIsR0FBckIsRUFBMEI7QUFDeEIsYUFBT0EsU0FBUDtBQUNEOztBQUVEO0FBQ0EsUUFBSUEsVUFBVSxDQUFWLE1BQWlCLEdBQXJCLEVBQTBCO0FBQ3hCQSxrQkFBWSxPQUFPQSxTQUFuQjtBQUNEOztBQUVEO0FBQ0EsV0FBTyxlQUFLVSxPQUFMLENBQWFSLFFBQVFTLEdBQVIsRUFBYixFQUE0QlgsU0FBNUIsQ0FBUDtBQUNELEdBYmtCLEVBYWhCVixLQUFLVSxTQUFMLEtBQWtCLE1BQU1kLFNBQVMwQixJQUFULENBQWMsZUFBS0MsT0FBTCxDQUFhQyxTQUFiLENBQWQsQ0FBeEI7O0FBRUg7Ozs7Ozs7O0FBZm1CLEdBQW5CLENBdUJBLE1BQU1DLE9BQU9OLGFBQWEsY0FBMUI7QUFDQXJCLFFBQU0sd0JBQU4sRUFBZ0MyQjs7QUFFaEM7OztBQUZBLElBS0EsTUFBTUMsT0FBTyxNQUFNL0IsTUFBTWdDLElBQU4sQ0FBV1I7O0FBRTlCOzs7QUFGbUIsR0FBbkIsQ0FLQSxNQUFNUyxPQUFPLE1BQU0sb0JBQVdUOztBQUU5Qjs7OztBQUZtQixHQUFuQixDQU1BLE1BQU1VLFdBQVcsaUJBQU9DLGdCQUF4QjtBQUNBLG1CQUFPQSxnQkFBUCxHQUEwQixDQUFDQyxJQUFELEVBQU9DLE1BQVAsS0FBa0I7QUFDMUMsV0FBT0QsU0FBUyxNQUFULEdBQWtCQSxJQUFsQixHQUF5QkYsU0FBU0UsSUFBVCxFQUFlQyxNQUFmLENBQWhDO0FBQ0QsR0FGRDs7QUFJQWpCLFVBQVFwQixLQUFSLENBQWNpQyxJQUFkLEdBQXFCO0FBQ25CSyxRQUFJLE1BRGU7QUFFbkJDLGNBQVUsTUFGUztBQUduQkMsWUFBUSxJQUhXO0FBSW5CQyxhQUFTUjs7QUFHWDs7O0FBUHFCLEdBQXJCLENBVUEsTUFBTSxDQUFDUyxTQUFELEVBQVlDLFNBQVosSUFBeUIsTUFBTTFDLFNBQVMrQixJQUFULENBQWNGOztBQUVuRDs7O0FBRnFDLEdBQXJDLENBS0EsSUFBSVksU0FBSixFQUFlO0FBQ2I7QUFDQTtBQUNBLFFBQUlFLFdBQVcsR0FBR0MsS0FBSCxDQUFTQyxJQUFULENBQWN6Qjs7QUFFN0I7QUFGZSxLQUFmLENBR0EsU0FBUzBCLGVBQVQsQ0FBeUJDLElBQXpCLEVBQStCO0FBQzdCLFVBQUlMLFVBQVVLLElBQVYsYUFBMkJDLEtBQS9CLEVBQXNDO0FBQ3BDTCxtQkFBV0EsU0FBU00sTUFBVCxDQUFnQlAsVUFBVUssSUFBVixDQUFoQixDQUFYO0FBQ0FMLGtCQUFVSyxJQUFWLEVBQWdCRyxPQUFoQixDQUF3QkMsT0FBT0wsZ0JBQWdCSyxHQUFoQixDQUEvQjtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQVIsYUFBU08sT0FBVCxDQUFpQkgsUUFBUUQsZ0JBQWdCQyxJQUFoQjs7QUFFekI7QUFGQSxNQUdBLG9CQUFTTCxTQUFULEVBQW9CQyxRQUFwQjtBQUNEOztBQUVEOzs7QUFHQSxNQUFJUyxJQUFKOztBQUVBLE1BQUloQyxNQUFNWCxNQUFOLEtBQWlCLENBQXJCLEVBQXdCO0FBQ3RCLFFBQUk0QyxPQUFPakMsTUFBTSxDQUFOLENBQVg7QUFDQWdDLFdBQU9WLFVBQVV0QixNQUFNLENBQU4sQ0FBVixDQUFQOztBQUVBLFFBQUlnQyxnQkFBZ0JKLEtBQXBCLEVBQTJCO0FBQ3pCSSxhQUFPLHdCQUFlQSxJQUFmLEVBQXFCVixTQUFyQixDQUFQO0FBQ0Q7O0FBRURVLFdBQU8sQ0FBQyxZQUFZO0FBQ2xCLFVBQUk7QUFDRixjQUFNQSxLQUFLRSxLQUFMLENBQVdELElBQVgsRUFBaUI5QixVQUFqQixDQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU9nQyxHQUFQLEVBQVk7QUFDWiwyQkFBYyxRQUFPRixJQUFLLEVBQTFCLEVBQTZCbEQsS0FBN0IsQ0FBbUNvRCxJQUFJQyxLQUFKLElBQWFELEdBQWhEO0FBQ0EsY0FBTyxlQUFQO0FBQ0Q7QUFDRixLQVBNLEdBQVA7QUFRRCxHQWhCRCxNQWdCTztBQUNMSCxXQUFPSyxRQUFRQyxHQUFSLENBQVl0QyxNQUFNdUMsR0FBTixDQUFVLE1BQU1OLElBQU4sSUFBYztBQUN6QyxVQUFJTixPQUFPTCxVQUFVVyxJQUFWLENBQVg7O0FBRUEsVUFBSU4sZ0JBQWdCQyxLQUFwQixFQUEyQjtBQUN6QkQsZUFBTyx3QkFBZUEsSUFBZixFQUFxQkwsU0FBckIsQ0FBUDtBQUNEOztBQUVELFVBQUk7QUFDRixjQUFNSyxLQUFLTyxLQUFMLENBQVdELElBQVgsRUFBaUI5QixVQUFqQixDQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU9nQyxHQUFQLEVBQVk7QUFDWiwyQkFBYyxRQUFPRixJQUFLLEVBQTFCLEVBQTZCbEQsS0FBN0IsQ0FBbUNvRCxJQUFJQyxLQUFKLElBQWFELEdBQWhEO0FBQ0EsY0FBTyxlQUFQO0FBQ0Q7QUFDRixLQWJrQixDQUFaLENBQVA7QUFjRDs7QUFFRDs7O0FBR0EsUUFBTUgsSUFBTjs7QUFFQTs7O0FBR0EsUUFBTXJELE1BQU02RCxJQUFOLENBQVdyQyxVQUFYLENBQU47QUFDRCxDQTFJQSxJQTBJSXNDLEtBMUlKLENBMElVTixPQUFPO0FBQ2hCcEQsUUFBTW9ELElBQUlDLEtBQUosSUFBYUQsR0FBbkI7QUFDQXZDLFVBQVFFLElBQVIsQ0FBYSxDQUFDLENBQWQ7QUFDRCxDQTdJQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWlcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBob3BwZmlsZSBmcm9tICcuL2hvcHBmaWxlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuL3V0aWxzL2xvZydcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3Rhc2tzL3BhcmFsbGVsJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSBjcmVhdGVMb2dnZXIoJ2hvcHAnKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIElmIHByb2plY3QgZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQsIGRvIGxvb2t1cCBmb3IgdGhlXG4gICAqIGhvcHBmaWxlLmpzXG4gICAqL1xuICBjb25zdCBwcm9qZWN0RGlyID0gKGRpcmVjdG9yeSA9PiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgZG9uJ3QgbmVlZCBjb3JyZWN0aW5nXG4gICAgaWYgKGRpcmVjdG9yeVswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gc29ydC1vZiByZWxhdGl2ZXMgc2hvdWxkIGJlIG1hZGUgaW50byByZWxhdGl2ZVxuICAgIGlmIChkaXJlY3RvcnlbMF0gIT09ICcuJykge1xuICAgICAgZGlyZWN0b3J5ID0gJy4vJyArIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIG1hcCB0byBjdXJyZW50IGRpcmVjdG9yeVxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgZGlyZWN0b3J5KVxuICB9KShhcmd2LmRpcmVjdG9yeSB8fCBhd2FpdCBob3BwZmlsZS5maW5kKHBhdGguZGlybmFtZShfX2Rpcm5hbWUpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGxldCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyB3YWxrIHRoZSBmdWxsIHRyZWVcbiAgICBmdW5jdGlvbiBhZGREZXBlbmRlbmNpZXModGFzaykge1xuICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZ1bGxMaXN0ID0gZnVsbExpc3QuY29uY2F0KHRhc2tEZWZuc1t0YXNrXSlcbiAgICAgICAgdGFza0RlZm5zW3Rhc2tdLmZvckVhY2goc3ViID0+IGFkZERlcGVuZGVuY2llcyhzdWIpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdhbGtpbmcgZnJvbSB0b3BcbiAgICBmdWxsTGlzdC5mb3JFYWNoKHRhc2sgPT4gYWRkRGVwZW5kZW5jaWVzKHRhc2spKVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrcy5cbiAgICovXG4gIGxldCBnb2FsXG5cbiAgaWYgKHRhc2tzLmxlbmd0aCA9PT0gMSkge1xuICAgIGxldCBuYW1lID0gdGFza3NbMF1cbiAgICBnb2FsID0gdGFza0RlZm5zW3Rhc2tzWzBdXVxuICAgIFxuICAgIGlmIChnb2FsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGdvYWwgPSBjcmVhdGVQYXJhbGxlbChnb2FsLCB0YXNrRGVmbnMpXG4gICAgfVxuXG4gICAgZ29hbCA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnb2FsLnN0YXJ0KG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgbGV0IHRhc2sgPSB0YXNrRGVmbnNbbmFtZV1cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gY3JlYXRlUGFyYWxsZWwodGFzaywgdGFza0RlZm5zKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0YXNrLnN0YXJ0KG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIGF3YWl0IGdvYWxcblxuICAvKipcbiAgICogU3RvcmUgY2FjaGUgZm9yIGxhdGVyLlxuICAgKi9cbiAgYXdhaXQgY2FjaGUuc2F2ZShwcm9qZWN0RGlyKVxufSkoKS5jYXRjaChlcnIgPT4ge1xuICBlcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICBwcm9jZXNzLmV4aXQoLTEpXG59KVxuIl19