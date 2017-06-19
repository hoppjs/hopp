'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _glob = require('../fs/glob');

var _glob2 = _interopRequireDefault(_glob);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

var _getPath = require('../fs/get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _utils = require('../utils');

var _fs3 = require('../fs');

var _streams = require('../streams');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const watchlog = (0, _utils.createLogger)('hopp:watch').log;

/**
 * Plugins storage.
 */
const plugins = {};
const pluginCtx = {};
const bufferPlugins = {};

/**
 * Loads a plugin, manages its env.
 */
const loadPlugin = (plugin, args) => {
  let mod = require(plugin);

  // check for if plugin requires before
  if (mod.FORCE_BUFFER === true) {
    bufferPlugins[plugin] = true;
  }

  // if defined as an ES2015 module, assume that the
  // export is at 'default'
  if (mod.__esModule === true) {
    mod = mod.default;
  }

  // create plugin logger
  const logger = (0, _utils.createLogger)(`hopp:${_path2.default.basename(plugin).substr(5)}`);

  // create a new context for this plugin
  pluginCtx[plugin] = {
    args,
    log: logger.debug,
    error: logger.error

    // return loaded plugin
  };return mod;
};

/**
 * Hopp class to manage tasks.
 */
class Hopp {
  /**
   * Creates a new task with the glob.
   * DOES NOT START THE TASK.
   * 
   * @param {Glob} src
   * @return {Hopp} new hopp object
   */
  constructor(src) {
    if (!(src instanceof Array)) {
      src = [src];
    }

    this.d = {
      src,
      stack: []
    };
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */
  dest(out) {
    this.d.dest = out;
    return this;
  }

  /**
   * Run task in continuous mode.
   */
  watch(name, directory, recache = false) {
    name = `watch:${name}`;

    const watchers = [];

    this.d.src.forEach(src => {
      // figure out if watch should be recursive
      const recursive = src.indexOf('/**/') !== -1;

      // get most definitive path possible
      let newpath = '';
      for (let sub of src.split('/')) {
        if (sub) {
          if (sub.indexOf('*') !== -1) {
            break;
          }

          newpath += _path2.default.sep + sub;
        }
      }
      newpath = _path2.default.resolve(directory, newpath.substr(1));

      // disable fs caching for watch
      (0, _fs3.disableFSCache)();

      // start watch
      watchlog('Watching for %s ...', name);
      watchers.push(_fs2.default.watch(newpath, {
        recursive: src.indexOf('/**/') !== -1
      }, () => this.start(name, directory, recache, false)));
    });

    return new Promise(resolve => {
      process.on('SIGINT', () => {
        watchers.forEach(watcher => watcher.close());
        resolve();
      });
    });
  }

  /**
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  async start(name, directory, recache = false, useDoubleCache = true) {
    const { log, debug } = (0, _utils.createLogger)(`hopp:${name}`);

    /**
     * Get the modified files.
     */
    debug('task recache = %s', recache);
    let files = await (0, _glob2.default)(this.d.src, directory, useDoubleCache, recache);

    if (files.length > 0) {
      const dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
      await (0, _fs3.mkdirp)(dest.replace(directory, ''), directory);

      /**
       * Create streams.
       */
      files = (0, _utils._)(files).map(file => ({
        file,
        stream: [(0, _streams.createReadStream)(file, dest)]
      }));

      if (this.d.stack.length > 0) {
        /**
         * Try to load plugins.
         */
        let stack = (0, _utils._)(this.d.stack);

        if (!this.plugins) {
          this.plugins = {};

          stack.map(([plugin, args]) => {
            if (!plugins.hasOwnProperty(plugin)) {
              plugins[plugin] = loadPlugin(plugin, args);
            }

            return [plugin, args];
          });
        }

        /**
         * Create streams.
         */
        let mode = 'stream';
        stack = stack.map(([plugin]) => {
          const pluginStream = (0, _mapStream2.default)((data, next) => {
            plugins[plugin](pluginCtx[plugin], data).then(newData => next(null, newData)).catch(err => next(err));
          });

          /**
           * Enable buffer mode if required.
           */
          if (mode === 'stream' && bufferPlugins[plugin]) {
            mode = 'buffer';
            return (0, _pump2.default)((0, _streams.buffer)(), pluginStream);
          }

          /**
           * Otherwise keep pumping.
           */
          return pluginStream;
        }).val();

        /**
         * Connect plugin streams with pipelines.
         */
        files.map(file => {
          file.stream = file.stream.concat(stack);
          return file;
        });
      }

      /**
       * Connect with destination.
       */
      files.map(file => {
        // strip out the actual body and write it
        file.stream.push((0, _mapStream2.default)((data, next) => next(null, data.body)));
        file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));

        // connect all streams together to form pipeline
        file.stream = (0, _pump2.default)(file.stream);

        // promisify the current pipeline
        return new Promise((resolve, reject) => {
          file.stream.on('error', reject);
          file.stream.on('close', resolve);
        });
      });

      // start & wait for all pipelines to end
      const start = Date.now();
      log('Starting task');
      await Promise.all(files.val());
      log('Task ended (took %s ms)', Date.now() - start);
    } else {
      log('Skipping task');
    }
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON() {
    return {
      dest: this.d.dest,
      src: this.d.src,
      stack: this.d.stack
    };
  }

  /**
   * Deserializes a JSON object into a manager.
   * @param {Object} json
   * @return {Hopp} task manager
   */
  fromJSON(json) {
    this.d.dest = json.dest;
    this.d.src = json.src;
    this.d.stack = json.stack;

    return this;
  }
}
exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJidWZmZXJQbHVnaW5zIiwibG9hZFBsdWdpbiIsInBsdWdpbiIsImFyZ3MiLCJtb2QiLCJyZXF1aXJlIiwiRk9SQ0VfQlVGRkVSIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJsb2dnZXIiLCJiYXNlbmFtZSIsInN1YnN0ciIsImRlYnVnIiwiZXJyb3IiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJ3YXRjaCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJyZWNhY2hlIiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzdWIiLCJzcGxpdCIsInNlcCIsInJlc29sdmUiLCJwdXNoIiwic3RhcnQiLCJQcm9taXNlIiwicHJvY2VzcyIsIm9uIiwid2F0Y2hlciIsImNsb3NlIiwidXNlRG91YmxlQ2FjaGUiLCJmaWxlcyIsImxlbmd0aCIsInJlcGxhY2UiLCJtYXAiLCJmaWxlIiwic3RyZWFtIiwiaGFzT3duUHJvcGVydHkiLCJtb2RlIiwicGx1Z2luU3RyZWFtIiwiZGF0YSIsIm5leHQiLCJ0aGVuIiwibmV3RGF0YSIsImNhdGNoIiwiZXJyIiwidmFsIiwiY29uY2F0IiwiYm9keSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwicmVqZWN0IiwiRGF0ZSIsIm5vdyIsImFsbCIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWZBOzs7Ozs7QUFpQkEsTUFBTUMsV0FBVyx5QkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7O0FBR0EsTUFBTUMsVUFBVSxFQUFoQjtBQUNBLE1BQU1DLFlBQVksRUFBbEI7QUFDQSxNQUFNQyxnQkFBZ0IsRUFBdEI7O0FBRUE7OztBQUdBLE1BQU1DLGFBQWEsQ0FBQ0MsTUFBRCxFQUFTQyxJQUFULEtBQWtCO0FBQ25DLE1BQUlDLE1BQU1DLFFBQVFILE1BQVIsQ0FBVjs7QUFFQTtBQUNBLE1BQUlFLElBQUlFLFlBQUosS0FBcUIsSUFBekIsRUFBK0I7QUFDN0JOLGtCQUFjRSxNQUFkLElBQXdCLElBQXhCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLE1BQUlFLElBQUlHLFVBQUosS0FBbUIsSUFBdkIsRUFBNkI7QUFDM0JILFVBQU1BLElBQUlJLE9BQVY7QUFDRDs7QUFFRDtBQUNBLFFBQU1DLFNBQVMseUJBQWMsUUFBTyxlQUFLQyxRQUFMLENBQWNSLE1BQWQsRUFBc0JTLE1BQXRCLENBQTZCLENBQTdCLENBQWdDLEVBQXJELENBQWY7O0FBRUE7QUFDQVosWUFBVUcsTUFBVixJQUFvQjtBQUNsQkMsUUFEa0I7QUFFbEJOLFNBQUtZLE9BQU9HLEtBRk07QUFHbEJDLFdBQU9KLE9BQU9JOztBQUdoQjtBQU5vQixHQUFwQixDQU9BLE9BQU9ULEdBQVA7QUFDRCxDQTFCRDs7QUE0QkE7OztBQUdlLE1BQU1VLElBQU4sQ0FBVztBQUN4Qjs7Ozs7OztBQU9BQyxjQUFhQyxHQUFiLEVBQWtCO0FBQ2hCLFFBQUksRUFBRUEsZUFBZUMsS0FBakIsQ0FBSixFQUE2QjtBQUMzQkQsWUFBTSxDQUFDQSxHQUFELENBQU47QUFDRDs7QUFFRCxTQUFLRSxDQUFMLEdBQVM7QUFDUEYsU0FETztBQUVQRyxhQUFPO0FBRkEsS0FBVDtBQUlEOztBQUVEOzs7OztBQUtBQyxPQUFNQyxHQUFOLEVBQVc7QUFDVCxTQUFLSCxDQUFMLENBQU9FLElBQVAsR0FBY0MsR0FBZDtBQUNBLFdBQU8sSUFBUDtBQUNEOztBQUVEOzs7QUFHQUMsUUFBT0MsSUFBUCxFQUFhQyxTQUFiLEVBQXdCQyxVQUFVLEtBQWxDLEVBQXlDO0FBQ3ZDRixXQUFRLFNBQVFBLElBQUssRUFBckI7O0FBRUEsVUFBTUcsV0FBVyxFQUFqQjs7QUFFQSxTQUFLUixDQUFMLENBQU9GLEdBQVAsQ0FBV1csT0FBWCxDQUFtQlgsT0FBTztBQUN4QjtBQUNBLFlBQU1ZLFlBQVlaLElBQUlhLE9BQUosQ0FBWSxNQUFaLE1BQXdCLENBQUMsQ0FBM0M7O0FBRUE7QUFDQSxVQUFJQyxVQUFVLEVBQWQ7QUFDQSxXQUFLLElBQUlDLEdBQVQsSUFBZ0JmLElBQUlnQixLQUFKLENBQVUsR0FBVixDQUFoQixFQUFnQztBQUM5QixZQUFJRCxHQUFKLEVBQVM7QUFDUCxjQUFJQSxJQUFJRixPQUFKLENBQVksR0FBWixNQUFxQixDQUFDLENBQTFCLEVBQTZCO0FBQzNCO0FBQ0Q7O0FBRURDLHFCQUFXLGVBQUtHLEdBQUwsR0FBV0YsR0FBdEI7QUFDRDtBQUNGO0FBQ0RELGdCQUFVLGVBQUtJLE9BQUwsQ0FBYVYsU0FBYixFQUF3Qk0sUUFBUW5CLE1BQVIsQ0FBZSxDQUFmLENBQXhCLENBQVY7O0FBRUE7QUFDQTs7QUFFQTtBQUNBZixlQUFTLHFCQUFULEVBQWdDMkIsSUFBaEM7QUFDQUcsZUFBU1MsSUFBVCxDQUFjLGFBQUdiLEtBQUgsQ0FBU1EsT0FBVCxFQUFrQjtBQUM5QkYsbUJBQVdaLElBQUlhLE9BQUosQ0FBWSxNQUFaLE1BQXdCLENBQUM7QUFETixPQUFsQixFQUVYLE1BQU0sS0FBS08sS0FBTCxDQUFXYixJQUFYLEVBQWlCQyxTQUFqQixFQUE0QkMsT0FBNUIsRUFBcUMsS0FBckMsQ0FGSyxDQUFkO0FBR0QsS0F6QkQ7O0FBMkJBLFdBQU8sSUFBSVksT0FBSixDQUFZSCxXQUFXO0FBQzVCSSxjQUFRQyxFQUFSLENBQVcsUUFBWCxFQUFxQixNQUFNO0FBQ3pCYixpQkFBU0MsT0FBVCxDQUFpQmEsV0FBV0EsUUFBUUMsS0FBUixFQUE1QjtBQUNBUDtBQUNELE9BSEQ7QUFJRCxLQUxNLENBQVA7QUFNRDs7QUFFRDs7OztBQUlBLFFBQU1FLEtBQU4sQ0FBYWIsSUFBYixFQUFtQkMsU0FBbkIsRUFBOEJDLFVBQVUsS0FBeEMsRUFBK0NpQixpQkFBaUIsSUFBaEUsRUFBc0U7QUFDcEUsVUFBTSxFQUFFN0MsR0FBRixFQUFPZSxLQUFQLEtBQWlCLHlCQUFjLFFBQU9XLElBQUssRUFBMUIsQ0FBdkI7O0FBRUE7OztBQUdBWCxVQUFNLG1CQUFOLEVBQTJCYSxPQUEzQjtBQUNBLFFBQUlrQixRQUFRLE1BQU0sb0JBQUssS0FBS3pCLENBQUwsQ0FBT0YsR0FBWixFQUFpQlEsU0FBakIsRUFBNEJrQixjQUE1QixFQUE0Q2pCLE9BQTVDLENBQWxCOztBQUVBLFFBQUlrQixNQUFNQyxNQUFOLEdBQWUsQ0FBbkIsRUFBc0I7QUFDcEIsWUFBTXhCLE9BQU8sZUFBS2MsT0FBTCxDQUFhVixTQUFiLEVBQXdCLHVCQUFRLEtBQUtOLENBQUwsQ0FBT0UsSUFBZixDQUF4QixDQUFiO0FBQ0EsWUFBTSxpQkFBT0EsS0FBS3lCLE9BQUwsQ0FBYXJCLFNBQWIsRUFBd0IsRUFBeEIsQ0FBUCxFQUFvQ0EsU0FBcEMsQ0FBTjs7QUFFQTs7O0FBR0FtQixjQUFRLGNBQUVBLEtBQUYsRUFBU0csR0FBVCxDQUFhQyxTQUFTO0FBQzVCQSxZQUQ0QjtBQUU1QkMsZ0JBQVEsQ0FDTiwrQkFBaUJELElBQWpCLEVBQXVCM0IsSUFBdkIsQ0FETTtBQUZvQixPQUFULENBQWIsQ0FBUjs7QUFPQSxVQUFJLEtBQUtGLENBQUwsQ0FBT0MsS0FBUCxDQUFheUIsTUFBYixHQUFzQixDQUExQixFQUE2QjtBQUMzQjs7O0FBR0EsWUFBSXpCLFFBQVEsY0FBRSxLQUFLRCxDQUFMLENBQU9DLEtBQVQsQ0FBWjs7QUFFQSxZQUFJLENBQUMsS0FBS3JCLE9BQVYsRUFBbUI7QUFDakIsZUFBS0EsT0FBTCxHQUFlLEVBQWY7O0FBRUFxQixnQkFBTTJCLEdBQU4sQ0FBVSxDQUFDLENBQUM1QyxNQUFELEVBQVNDLElBQVQsQ0FBRCxLQUFvQjtBQUM1QixnQkFBSSxDQUFDTCxRQUFRbUQsY0FBUixDQUF1Qi9DLE1BQXZCLENBQUwsRUFBcUM7QUFDbkNKLHNCQUFRSSxNQUFSLElBQWtCRCxXQUFXQyxNQUFYLEVBQW1CQyxJQUFuQixDQUFsQjtBQUNEOztBQUVELG1CQUFPLENBQUNELE1BQUQsRUFBU0MsSUFBVCxDQUFQO0FBQ0QsV0FORDtBQU9EOztBQUVEOzs7QUFHQSxZQUFJK0MsT0FBTyxRQUFYO0FBQ0EvQixnQkFBUUEsTUFBTTJCLEdBQU4sQ0FBVSxDQUFDLENBQUM1QyxNQUFELENBQUQsS0FBYztBQUM5QixnQkFBTWlELGVBQWUseUJBQVUsQ0FBQ0MsSUFBRCxFQUFPQyxJQUFQLEtBQWdCO0FBQzdDdkQsb0JBQVFJLE1BQVIsRUFDRUgsVUFBVUcsTUFBVixDQURGLEVBRUVrRCxJQUZGLEVBSUdFLElBSkgsQ0FJUUMsV0FBV0YsS0FBSyxJQUFMLEVBQVdFLE9BQVgsQ0FKbkIsRUFLR0MsS0FMSCxDQUtTQyxPQUFPSixLQUFLSSxHQUFMLENBTGhCO0FBTUQsV0FQb0IsQ0FBckI7O0FBU0E7OztBQUdBLGNBQUlQLFNBQVMsUUFBVCxJQUFxQmxELGNBQWNFLE1BQWQsQ0FBekIsRUFBZ0Q7QUFDOUNnRCxtQkFBTyxRQUFQO0FBQ0EsbUJBQU8sb0JBQUssc0JBQUwsRUFBZUMsWUFBZixDQUFQO0FBQ0Q7O0FBRUQ7OztBQUdBLGlCQUFPQSxZQUFQO0FBQ0QsU0F0Qk8sRUFzQkxPLEdBdEJLLEVBQVI7O0FBd0JBOzs7QUFHQWYsY0FBTUcsR0FBTixDQUFVQyxRQUFRO0FBQ2hCQSxlQUFLQyxNQUFMLEdBQWNELEtBQUtDLE1BQUwsQ0FBWVcsTUFBWixDQUFtQnhDLEtBQW5CLENBQWQ7QUFDQSxpQkFBTzRCLElBQVA7QUFDRCxTQUhEO0FBSUQ7O0FBRUQ7OztBQUdBSixZQUFNRyxHQUFOLENBQVVDLFFBQVE7QUFDaEI7QUFDQUEsYUFBS0MsTUFBTCxDQUFZYixJQUFaLENBQWlCLHlCQUFVLENBQUNpQixJQUFELEVBQU9DLElBQVAsS0FBZ0JBLEtBQUssSUFBTCxFQUFXRCxLQUFLUSxJQUFoQixDQUExQixDQUFqQjtBQUNBYixhQUFLQyxNQUFMLENBQVliLElBQVosQ0FBaUIsYUFBRzBCLGlCQUFILENBQXFCekMsT0FBTyxHQUFQLEdBQWEsZUFBS1YsUUFBTCxDQUFjcUMsS0FBS0EsSUFBbkIsQ0FBbEMsQ0FBakI7O0FBRUE7QUFDQUEsYUFBS0MsTUFBTCxHQUFjLG9CQUFLRCxLQUFLQyxNQUFWLENBQWQ7O0FBRUE7QUFDQSxlQUFPLElBQUlYLE9BQUosQ0FBWSxDQUFDSCxPQUFELEVBQVU0QixNQUFWLEtBQXFCO0FBQ3RDZixlQUFLQyxNQUFMLENBQVlULEVBQVosQ0FBZSxPQUFmLEVBQXdCdUIsTUFBeEI7QUFDQWYsZUFBS0MsTUFBTCxDQUFZVCxFQUFaLENBQWUsT0FBZixFQUF3QkwsT0FBeEI7QUFDRCxTQUhNLENBQVA7QUFJRCxPQWJEOztBQWVBO0FBQ0EsWUFBTUUsUUFBUTJCLEtBQUtDLEdBQUwsRUFBZDtBQUNBbkUsVUFBSSxlQUFKO0FBQ0EsWUFBTXdDLFFBQVE0QixHQUFSLENBQVl0QixNQUFNZSxHQUFOLEVBQVosQ0FBTjtBQUNBN0QsVUFBSSx5QkFBSixFQUErQmtFLEtBQUtDLEdBQUwsS0FBYTVCLEtBQTVDO0FBQ0QsS0E1RkQsTUE0Rk87QUFDTHZDLFVBQUksZUFBSjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7QUFJQXFFLFdBQVU7QUFDUixXQUFPO0FBQ0w5QyxZQUFNLEtBQUtGLENBQUwsQ0FBT0UsSUFEUjtBQUVMSixXQUFLLEtBQUtFLENBQUwsQ0FBT0YsR0FGUDtBQUdMRyxhQUFPLEtBQUtELENBQUwsQ0FBT0M7QUFIVCxLQUFQO0FBS0Q7O0FBRUQ7Ozs7O0FBS0FnRCxXQUFVQyxJQUFWLEVBQWdCO0FBQ2QsU0FBS2xELENBQUwsQ0FBT0UsSUFBUCxHQUFjZ0QsS0FBS2hELElBQW5CO0FBQ0EsU0FBS0YsQ0FBTCxDQUFPRixHQUFQLEdBQWFvRCxLQUFLcEQsR0FBbEI7QUFDQSxTQUFLRSxDQUFMLENBQU9DLEtBQVAsR0FBZWlELEtBQUtqRCxLQUFwQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQTdNdUI7a0JBQUxMLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZnMvZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZnMvZ2V0LXBhdGgnXG5pbXBvcnQgeyBfLCBjcmVhdGVMb2dnZXIgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlLCBta2RpcnAgfSBmcm9tICcuLi9mcydcbmltcG9ydCB7IGJ1ZmZlciwgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJy4uL3N0cmVhbXMnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkN0eCA9IHt9XG5jb25zdCBidWZmZXJQbHVnaW5zID0ge31cblxuLyoqXG4gKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICovXG5jb25zdCBsb2FkUGx1Z2luID0gKHBsdWdpbiwgYXJncykgPT4ge1xuICBsZXQgbW9kID0gcmVxdWlyZShwbHVnaW4pXG5cbiAgLy8gY2hlY2sgZm9yIGlmIHBsdWdpbiByZXF1aXJlcyBiZWZvcmVcbiAgaWYgKG1vZC5GT1JDRV9CVUZGRVIgPT09IHRydWUpIHtcbiAgICBidWZmZXJQbHVnaW5zW3BsdWdpbl0gPSB0cnVlXG4gIH1cblxuICAvLyBpZiBkZWZpbmVkIGFzIGFuIEVTMjAxNSBtb2R1bGUsIGFzc3VtZSB0aGF0IHRoZVxuICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgIG1vZCA9IG1vZC5kZWZhdWx0XG4gIH1cblxuICAvLyBjcmVhdGUgcGx1Z2luIGxvZ2dlclxuICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gIHBsdWdpbkN0eFtwbHVnaW5dID0ge1xuICAgIGFyZ3MsXG4gICAgbG9nOiBsb2dnZXIuZGVidWcsXG4gICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICB9XG5cbiAgLy8gcmV0dXJuIGxvYWRlZCBwbHVnaW5cbiAgcmV0dXJuIG1vZFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgd2F0Y2ggc2hvdWxkIGJlIHJlY3Vyc2l2ZVxuICAgICAgY29uc3QgcmVjdXJzaXZlID0gc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcblxuICAgICAgLy8gZ2V0IG1vc3QgZGVmaW5pdGl2ZSBwYXRoIHBvc3NpYmxlXG4gICAgICBsZXQgbmV3cGF0aCA9ICcnXG4gICAgICBmb3IgKGxldCBzdWIgb2Ygc3JjLnNwbGl0KCcvJykpIHtcbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIGlmIChzdWIuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdwYXRoICs9IHBhdGguc2VwICsgc3ViXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld3BhdGggPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBuZXdwYXRoLnN1YnN0cigxKSlcblxuICAgICAgLy8gZGlzYWJsZSBmcyBjYWNoaW5nIGZvciB3YXRjaFxuICAgICAgZGlzYWJsZUZTQ2FjaGUoKVxuXG4gICAgICAvLyBzdGFydCB3YXRjaFxuICAgICAgd2F0Y2hsb2coJ1dhdGNoaW5nIGZvciAlcyAuLi4nLCBuYW1lKVxuICAgICAgd2F0Y2hlcnMucHVzaChmcy53YXRjaChuZXdwYXRoLCB7XG4gICAgICAgIHJlY3Vyc2l2ZTogc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcbiAgICAgIH0sICgpID0+IHRoaXMuc3RhcnQobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlLCBmYWxzZSkpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB3YXRjaGVyLmNsb3NlKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlLCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgZGVidWcoJ3Rhc2sgcmVjYWNoZSA9ICVzJywgcmVjYWNoZSlcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHJlY2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdClcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVHJ5IHRvIGxvYWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIGxldCBzdGFjayA9IF8odGhpcy5kLnN0YWNrKVxuXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5zKSB7XG4gICAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cblxuICAgICAgICAgIHN0YWNrLm1hcCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgICAgIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW4pKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IGxvYWRQbHVnaW4ocGx1Z2luLCBhcmdzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gW3BsdWdpbiwgYXJnc11cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IG1vZGUgPSAnc3RyZWFtJ1xuICAgICAgICBzdGFjayA9IHN0YWNrLm1hcCgoW3BsdWdpbl0pID0+IHtcbiAgICAgICAgICBjb25zdCBwbHVnaW5TdHJlYW0gPSBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXShcbiAgICAgICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBidWZmZXJQbHVnaW5zW3BsdWdpbl0pIHtcbiAgICAgICAgICAgIG1vZGUgPSAnYnVmZmVyJ1xuICAgICAgICAgICAgcmV0dXJuIHB1bXAoYnVmZmVyKCksIHBsdWdpblN0cmVhbSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBPdGhlcndpc2Uga2VlcCBwdW1waW5nLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIHJldHVybiBwbHVnaW5TdHJlYW1cbiAgICAgICAgfSkudmFsKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4gbmV4dChudWxsLCBkYXRhLmJvZHkpKSlcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcblxuICAgICAgICAvLyBjb25uZWN0IGFsbCBzdHJlYW1zIHRvZ2V0aGVyIHRvIGZvcm0gcGlwZWxpbmVcbiAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtKVxuXG4gICAgICAgIC8vIHByb21pc2lmeSB0aGUgY3VycmVudCBwaXBlbGluZVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gc3RhcnQgJiB3YWl0IGZvciBhbGwgcGlwZWxpbmVzIHRvIGVuZFxuICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXMudmFsKCkpXG4gICAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1NraXBwaW5nIHRhc2snKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==