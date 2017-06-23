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

var _through = require('through');

var _through2 = _interopRequireDefault(_through);

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

const watchlog = (0, _utils.createLogger)('hopp:watch').log;

/**
 * Plugins storage.
 */
/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const plugins = {};
const pluginConfig = {};

/**
 * Test for undefined or null.
 */
function isUndefined(value) {
  return value === undefined || value === null;
}

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

    // store context local to each task
    this.pluginCtx = {};

    // persistent info
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
   * Handles bundling.
   */
  async startBundling(name, directory, modified, dest, useDoubleCache = true) {
    const { log, debug } = (0, _utils.createLogger)(`hopp:${name}`);
    debug('Switched to bundling mode');

    /**
     * Fetch sourcemap from cache.
     */
    const sourcemap = cache.sourcemap(name);

    /**
     * Get full list of current files.
     */
    const files = await (0, _glob2.default)(this.d.src, directory, useDoubleCache, true);

    /**
     * Create list of unmodified.
     */
    let freshBuild = true;
    const unmodified = {};

    for (let file of files) {
      if (modified.indexOf(file) === -1) {
        unmodified[file] = true;
        freshBuild = false;
      }
    }

    /**
     * Get old bundle & create new one.
     */
    const originalFd = freshBuild ? null : await (0, _fs3.openFile)(dest, 'r'),
          [tmpBundle, tmpBundlePath] = await (0, _fs3.tmpFile)();

    /**
     * Create new bundle to forward to.
     */
    const bundle = (0, _streams.createBundle)(tmpBundle);

    /**
     * Since bundling starts streaming right away, we can count this
     * as the start of the build.
     */
    const start = Date.now();
    log('Starting task');

    /**
     * Add all files.
     */
    for (let file of files) {
      let stream;

      if (unmodified[file]) {
        debug('forward: %s', file);
        stream = _fs2.default.createReadStream(null, {
          fd: originalFd,
          autoClose: false,
          start: sourcemap[file].start,
          end: sourcemap[file].end
        });
      } else {
        debug('transform: %s', file);
        stream = (0, _pump2.default)([(0, _streams.createReadStream)(file, dest + '/' + _path2.default.basename(file))].concat(this.buildStack()));
      }

      bundle.add(file, stream);
    }

    /**
     * Wait for bundling to end.
     */
    await bundle.end(tmpBundlePath);

    /**
     * Move the bundle to the new location.
     */
    if (originalFd) originalFd.close();
    await (0, _fs3.mkdirp)(_path2.default.dirname(dest).replace(directory, ''), directory);
    await new Promise((resolve, reject) => {
      const stream = _fs2.default.createReadStream(tmpBundlePath).pipe(_fs2.default.createWriteStream(dest));

      stream.on('close', resolve);
      stream.on('error', reject);
    });

    /**
     * Update sourcemap.
     */
    cache.sourcemap(name, bundle.map);

    log('Task ended (took %s ms)', Date.now() - start);
  }

  /**
   * Converts all plugins in the stack into streams.
   */
  buildStack() {
    const that = this;
    let mode = 'stream';

    return this.d.stack.map(([plugin]) => {
      const pluginStream = (0, _through2.default)(async function (data) {
        try {
          const handler = plugins[plugin](that.pluginCtx[plugin], data);

          // for async functions/promises
          if (handler instanceof Promise) {
            handler.then(newData => this.emit('data', newData)).catch(err => this.emit('error', err));
          }

          // for async generators
          else if ('next' in handler) {
              let retval;

              do {
                retval = await handler.next();
                this.emit('data', retval.value);
              } while (!retval.done);
            }

            // otherwise, fail
            else {
                this.emit('error', new Error('Unknown return value received from ' + plugin));
              }
        } catch (err) {
          this.emit('error', err);
        }
      });

      /**
       * Enable buffer mode if required.
       */
      if (mode === 'stream' && pluginConfig[plugin].mode === 'buffer') {
        mode = 'buffer';
        return (0, _pump2.default)((0, _streams.buffer)(), pluginStream);
      }

      /**
       * Otherwise keep pumping.
       */
      return pluginStream;
    });
  }

  /**
   * Loads a plugin, manages its env.
   */
  loadPlugin(taskName, plugin, args) {
    let mod = plugins[plugin];

    if (!mod) {
      mod = require(plugin);

      // expose module config
      pluginConfig[plugin] = mod.config || {};

      // if defined as an ES2015 module, assume that the
      // export is at 'default'
      if (mod.__esModule === true) {
        mod = mod.default;
      }

      // add plugins to loaded plugins
      plugins[plugin] = mod;
    }

    // create plugin logger
    const logger = (0, _utils.createLogger)(`hopp:${taskName}:${_path2.default.basename(plugin).substr(5)}`);

    // load/create cache for plugin
    const pluginCache = cache.plugin(plugin);

    // create a new context for this plugin
    this.pluginCtx[plugin] = {
      args,
      cache: pluginCache,
      log: logger.log,
      debug: logger.debug,
      error: logger.error
    };
  }

  /**
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  async start(name, directory, recache = false, useDoubleCache = true) {
    const { log, debug } = (0, _utils.createLogger)(`hopp:${name}`);

    /**
     * Figure out if bundling is needed & load plugins.
     */
    if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || this.d.stack.length > 0 && !this.loadedPlugins) {
      this.loadedPlugins = true;

      this.d.stack.forEach(([plugin, args]) => {
        if (!this.pluginCtx.hasOwnProperty(plugin)) {
          this.loadPlugin(name, plugin, args);
        }

        this.needsBundling = !!(this.needsBundling || pluginConfig[plugin].bundle);
        this.needsRecaching = !!(this.needsRecaching || pluginConfig[plugin].recache);
      });
    }

    /**
     * Override recaching.
     */
    if (this.needsRecaching) {
      recache = true;
    }

    /**
     * Get the modified files.
     */
    debug('task recache = %s', recache);
    let files = await (0, _glob2.default)(this.d.src, directory, useDoubleCache, recache);

    if (files.length > 0) {
      const dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));

      /**
       * Switch to bundling mode if need be.
       */
      if (this.needsBundling) {
        return await this.startBundling(name, directory, files, dest, useDoubleCache);
      }

      /**
       * Ensure dist directory exists.
       */
      await (0, _fs3.mkdirp)(dest.replace(directory, ''), directory);

      /**
       * Create streams.
       */
      files = (0, _utils._)(files).map(file => ({
        file,
        stream: [(0, _streams.createReadStream)(file, dest + '/' + _path2.default.basename(file))]
      }));

      if (this.d.stack.length > 0) {
        /**
         * Create streams.
         */
        const stack = this.buildStack();

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
        file.stream.push((0, _mapStream2.default)((data, next) => {
          if (typeof data !== 'object' || !data.hasOwnProperty('body')) {
            return next(new Error('A plugin has destroyed the stream by returning a non-object.'));
          }

          next(null, data.body);
        }));
        file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));

        // promisify the current pipeline
        return new Promise((resolve, reject) => {
          // connect all streams together to form pipeline
          file.stream = (0, _pump2.default)(file.stream, err => {
            if (err) reject(err);
          });
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
      stack: this.d.stack,
      needsBundling: this.needsBundling,
      needsRecaching: this.needsRecaching
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
    this.needsBundling = json.needsBundling;
    this.needsRecaching = json.needsRecaching;

    return this;
  }
}
exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5Db25maWciLCJpc1VuZGVmaW5lZCIsInZhbHVlIiwidW5kZWZpbmVkIiwiSG9wcCIsImNvbnN0cnVjdG9yIiwic3JjIiwiQXJyYXkiLCJwbHVnaW5DdHgiLCJkIiwic3RhY2siLCJkZXN0Iiwib3V0Iiwid2F0Y2giLCJuYW1lIiwiZGlyZWN0b3J5IiwicmVjYWNoZSIsIndhdGNoZXJzIiwiZm9yRWFjaCIsIm5ld3BhdGgiLCJzdWIiLCJzcGxpdCIsImluZGV4T2YiLCJzZXAiLCJyZXNvbHZlIiwic3Vic3RyIiwicHVzaCIsInJlY3Vyc2l2ZSIsInN0YXJ0IiwiUHJvbWlzZSIsInByb2Nlc3MiLCJvbiIsIndhdGNoZXIiLCJjbG9zZSIsInN0YXJ0QnVuZGxpbmciLCJtb2RpZmllZCIsInVzZURvdWJsZUNhY2hlIiwiZGVidWciLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImJhc2VuYW1lIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwidGhhdCIsIm1vZGUiLCJwbHVnaW4iLCJwbHVnaW5TdHJlYW0iLCJkYXRhIiwiaGFuZGxlciIsInRoZW4iLCJuZXdEYXRhIiwiZW1pdCIsImNhdGNoIiwiZXJyIiwicmV0dmFsIiwibmV4dCIsImRvbmUiLCJFcnJvciIsImxvYWRQbHVnaW4iLCJ0YXNrTmFtZSIsImFyZ3MiLCJtb2QiLCJyZXF1aXJlIiwiY29uZmlnIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJsb2dnZXIiLCJwbHVnaW5DYWNoZSIsImVycm9yIiwibmVlZHNCdW5kbGluZyIsIm5lZWRzUmVjYWNoaW5nIiwibGVuZ3RoIiwibG9hZGVkUGx1Z2lucyIsImhhc093blByb3BlcnR5IiwiYm9keSIsImFsbCIsInZhbCIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsTUFBTUMsV0FBVyx5QkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7O0FBcEJBOzs7Ozs7QUF1QkEsTUFBTUMsVUFBVSxFQUFoQjtBQUNBLE1BQU1DLGVBQWUsRUFBckI7O0FBRUE7OztBQUdBLFNBQVNDLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQTRCO0FBQzFCLFNBQU9BLFVBQVVDLFNBQVYsSUFBdUJELFVBQVUsSUFBeEM7QUFDRDs7QUFFRDs7O0FBR2UsTUFBTUUsSUFBTixDQUFXO0FBQ3hCOzs7Ozs7O0FBT0FDLGNBQWFDLEdBQWIsRUFBa0I7QUFDaEIsUUFBSSxFQUFFQSxlQUFlQyxLQUFqQixDQUFKLEVBQTZCO0FBQzNCRCxZQUFNLENBQUNBLEdBQUQsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsU0FBS0UsU0FBTCxHQUFpQixFQUFqQjs7QUFFQTtBQUNBLFNBQUtDLENBQUwsR0FBUztBQUNQSCxTQURPO0FBRVBJLGFBQU87QUFGQSxLQUFUO0FBSUQ7O0FBRUQ7Ozs7O0FBS0FDLE9BQU1DLEdBQU4sRUFBVztBQUNULFNBQUtILENBQUwsQ0FBT0UsSUFBUCxHQUFjQyxHQUFkO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQ7OztBQUdBQyxRQUFPQyxJQUFQLEVBQWFDLFNBQWIsRUFBd0JDLFVBQVUsS0FBbEMsRUFBeUM7QUFDdkNGLFdBQVEsU0FBUUEsSUFBSyxFQUFyQjs7QUFF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LFNBQUtGLENBQUwsQ0FBT0gsR0FBUCxHQUFhOEYsS0FBSzlGLEdBQWxCO0FBQ0EsU0FBS0csQ0FBTCxDQUFPQyxLQUFQLEdBQWUwRixLQUFLMUYsS0FBcEI7QUFDQSxTQUFLZ0YsYUFBTCxHQUFxQlUsS0FBS1YsYUFBMUI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCUyxLQUFLVCxjQUEzQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQWpadUI7a0JBQUx2RixJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBnbG9iIGZyb20gJy4uL2ZzL2dsb2InXG5pbXBvcnQgdGhyb3VnaCBmcm9tICd0aHJvdWdoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgbWFwU3RyZWFtIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9mcy9nZXQtcGF0aCdcbmltcG9ydCB7IF8sIGNyZWF0ZUxvZ2dlciB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgZGlzYWJsZUZTQ2FjaGUsIG1rZGlycCwgb3BlbkZpbGUsIHRtcEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCB7IGJ1ZmZlciwgY3JlYXRlQnVuZGxlLCBjcmVhdGVSZWFkU3RyZWFtIH0gZnJvbSAnLi4vc3RyZWFtcydcblxuY29uc3Qgd2F0Y2hsb2cgPSBjcmVhdGVMb2dnZXIoJ2hvcHA6d2F0Y2gnKS5sb2dcblxuLyoqXG4gKiBQbHVnaW5zIHN0b3JhZ2UuXG4gKi9cbmNvbnN0IHBsdWdpbnMgPSB7fVxuY29uc3QgcGx1Z2luQ29uZmlnID0ge31cblxuLyoqXG4gKiBUZXN0IGZvciB1bmRlZmluZWQgb3IgbnVsbC5cbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGxcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgLy8gc3RvcmUgY29udGV4dCBsb2NhbCB0byBlYWNoIHRhc2tcbiAgICB0aGlzLnBsdWdpbkN0eCA9IHt9XG5cbiAgICAvLyBwZXJzaXN0ZW50IGluZm9cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGJ1bmRsaW5nLlxuICAgKi9cbiAgYXN5bmMgc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIG1vZGlmaWVkLCBkZXN0LCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcbiAgICBkZWJ1ZygnU3dpdGNoZWQgdG8gYnVuZGxpbmcgbW9kZScpXG5cbiAgICAvKipcbiAgICAgKiBGZXRjaCBzb3VyY2VtYXAgZnJvbSBjYWNoZS5cbiAgICAgKi9cbiAgICBjb25zdCBzb3VyY2VtYXAgPSBjYWNoZS5zb3VyY2VtYXAobmFtZSlcblxuICAgIC8qKlxuICAgICAqIEdldCBmdWxsIGxpc3Qgb2YgY3VycmVudCBmaWxlcy5cbiAgICAgKi9cbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgdHJ1ZSlcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBsaXN0IG9mIHVubW9kaWZpZWQuXG4gICAgICovXG4gICAgbGV0IGZyZXNoQnVpbGQgPSB0cnVlXG4gICAgY29uc3QgdW5tb2RpZmllZCA9IHt9XG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAobW9kaWZpZWQuaW5kZXhPZihmaWxlKSA9PT0gLTEpIHtcbiAgICAgICAgdW5tb2RpZmllZFtmaWxlXSA9IHRydWVcbiAgICAgICAgZnJlc2hCdWlsZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9sZCBidW5kbGUgJiBjcmVhdGUgbmV3IG9uZS5cbiAgICAgKi9cbiAgICBjb25zdCBvcmlnaW5hbEZkID0gZnJlc2hCdWlsZCA/IG51bGwgOiBhd2FpdCBvcGVuRmlsZShkZXN0LCAncicpXG4gICAgICAgICwgW3RtcEJ1bmRsZSwgdG1wQnVuZGxlUGF0aF0gPSBhd2FpdCB0bXBGaWxlKClcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IGJ1bmRsZSB0byBmb3J3YXJkIHRvLlxuICAgICAqL1xuICAgIGNvbnN0IGJ1bmRsZSA9IGNyZWF0ZUJ1bmRsZSh0bXBCdW5kbGUpXG5cbiAgICAvKipcbiAgICAgKiBTaW5jZSBidW5kbGluZyBzdGFydHMgc3RyZWFtaW5nIHJpZ2h0IGF3YXksIHdlIGNhbiBjb3VudCB0aGlzXG4gICAgICogYXMgdGhlIHN0YXJ0IG9mIHRoZSBidWlsZC5cbiAgICAgKi9cbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuXG4gICAgLyoqXG4gICAgICogQWRkIGFsbCBmaWxlcy5cbiAgICAgKi9cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBsZXQgc3RyZWFtXG5cbiAgICAgIGlmICh1bm1vZGlmaWVkW2ZpbGVdKSB7XG4gICAgICAgIGRlYnVnKCdmb3J3YXJkOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0obnVsbCwge1xuICAgICAgICAgIGZkOiBvcmlnaW5hbEZkLFxuICAgICAgICAgIGF1dG9DbG9zZTogZmFsc2UsXG4gICAgICAgICAgc3RhcnQ6IHNvdXJjZW1hcFtmaWxlXS5zdGFydCxcbiAgICAgICAgICBlbmQ6IHNvdXJjZW1hcFtmaWxlXS5lbmRcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0cmFuc2Zvcm06ICVzJywgZmlsZSlcbiAgICAgICAgc3RyZWFtID0gcHVtcChbXG4gICAgICAgICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlLCBkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICAgICAgXS5jb25jYXQodGhpcy5idWlsZFN0YWNrKCkpKVxuICAgICAgfVxuXG4gICAgICBidW5kbGUuYWRkKGZpbGUsIHN0cmVhbSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYWl0IGZvciBidW5kbGluZyB0byBlbmQuXG4gICAgICovXG4gICAgYXdhaXQgYnVuZGxlLmVuZCh0bXBCdW5kbGVQYXRoKVxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0aGUgYnVuZGxlIHRvIHRoZSBuZXcgbG9jYXRpb24uXG4gICAgICovXG4gICAgaWYgKG9yaWdpbmFsRmQpIG9yaWdpbmFsRmQuY2xvc2UoKVxuICAgIGF3YWl0IG1rZGlycChwYXRoLmRpcm5hbWUoZGVzdCkucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odG1wQnVuZGxlUGF0aCkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KSlcblxuICAgICAgc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgIH0pXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc291cmNlbWFwLlxuICAgICAqL1xuICAgIGNhY2hlLnNvdXJjZW1hcChuYW1lLCBidW5kbGUubWFwKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbGwgcGx1Z2lucyBpbiB0aGUgc3RhY2sgaW50byBzdHJlYW1zLlxuICAgKi9cbiAgYnVpbGRTdGFjayAoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBsZXQgbW9kZSA9ICdzdHJlYW0nXG5cbiAgICByZXR1cm4gdGhpcy5kLnN0YWNrLm1hcCgoW3BsdWdpbl0pID0+IHtcbiAgICAgIGNvbnN0IHBsdWdpblN0cmVhbSA9IHRocm91Z2goYXN5bmMgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBoYW5kbGVyID0gcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgdGhhdC5wbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICApXG5cbiAgICAgICAgICAvLyBmb3IgYXN5bmMgZnVuY3Rpb25zL3Byb21pc2VzXG4gICAgICAgICAgaWYgKGhhbmRsZXIgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICBoYW5kbGVyXG4gICAgICAgICAgICAgIC50aGVuKG5ld0RhdGEgPT4gdGhpcy5lbWl0KCdkYXRhJywgbmV3RGF0YSkpXG4gICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gdGhpcy5lbWl0KCdlcnJvcicsIGVycikpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZm9yIGFzeW5jIGdlbmVyYXRvcnNcbiAgICAgICAgICBlbHNlIGlmICgnbmV4dCcgaW4gaGFuZGxlcikge1xuICAgICAgICAgICAgbGV0IHJldHZhbFxuXG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgIHJldHZhbCA9IGF3YWl0IGhhbmRsZXIubmV4dCgpXG4gICAgICAgICAgICAgIHRoaXMuZW1pdCgnZGF0YScsIHJldHZhbC52YWx1ZSlcbiAgICAgICAgICAgIH0gd2hpbGUgKCFyZXR2YWwuZG9uZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gb3RoZXJ3aXNlLCBmYWlsXG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdVbmtub3duIHJldHVybiB2YWx1ZSByZWNlaXZlZCBmcm9tICcgKyBwbHVnaW4pKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycilcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGUgYnVmZmVyIG1vZGUgaWYgcmVxdWlyZWQuXG4gICAgICAgKi9cbiAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBwbHVnaW5Db25maWdbcGx1Z2luXS5tb2RlID09PSAnYnVmZmVyJykge1xuICAgICAgICBtb2RlID0gJ2J1ZmZlcidcbiAgICAgICAgcmV0dXJuIHB1bXAoYnVmZmVyKCksIHBsdWdpblN0cmVhbSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBPdGhlcndpc2Uga2VlcCBwdW1waW5nLlxuICAgICAgICovXG4gICAgICByZXR1cm4gcGx1Z2luU3RyZWFtXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICAgKi9cbiAgbG9hZFBsdWdpbiAodGFza05hbWUsIHBsdWdpbiwgYXJncykge1xuICAgIGxldCBtb2QgPSBwbHVnaW5zW3BsdWdpbl1cbiAgICBcbiAgICBpZiAoIW1vZCkge1xuICAgICAgbW9kID0gcmVxdWlyZShwbHVnaW4pXG4gICAgICBcbiAgICAgIC8vIGV4cG9zZSBtb2R1bGUgY29uZmlnXG4gICAgICBwbHVnaW5Db25maWdbcGx1Z2luXSA9IG1vZC5jb25maWcgfHwge31cblxuICAgICAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgICAgIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgICAgIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgICAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICAgICAgfVxuXG4gICAgICAvLyBhZGQgcGx1Z2lucyB0byBsb2FkZWQgcGx1Z2luc1xuICAgICAgcGx1Z2luc1twbHVnaW5dID0gbW9kXG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHt0YXNrTmFtZX06JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgICAvLyBsb2FkL2NyZWF0ZSBjYWNoZSBmb3IgcGx1Z2luXG4gICAgY29uc3QgcGx1Z2luQ2FjaGUgPSBjYWNoZS5wbHVnaW4ocGx1Z2luKVxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICAgIGFyZ3MsXG4gICAgICBjYWNoZTogcGx1Z2luQ2FjaGUsXG4gICAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgICBkZWJ1ZzogbG9nZ2VyLmRlYnVnLFxuICAgICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBGaWd1cmUgb3V0IGlmIGJ1bmRsaW5nIGlzIG5lZWRlZCAmIGxvYWQgcGx1Z2lucy5cbiAgICAgKi9cbiAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5uZWVkc0J1bmRsaW5nKSB8fCBpc1VuZGVmaW5lZCh0aGlzLm5lZWRzUmVjYWNoaW5nKSB8fCAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMubG9hZGVkUGx1Z2lucykpIHtcbiAgICAgIHRoaXMubG9hZGVkUGx1Z2lucyA9IHRydWVcblxuICAgICAgdGhpcy5kLnN0YWNrLmZvckVhY2goKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5DdHguaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgIHRoaXMubG9hZFBsdWdpbihuYW1lLCBwbHVnaW4sIGFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSAhISh0aGlzLm5lZWRzQnVuZGxpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0uYnVuZGxlKVxuICAgICAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0gISEodGhpcy5uZWVkc1JlY2FjaGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5yZWNhY2hlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSByZWNhY2hpbmcuXG4gICAgICovXG4gICAgaWYgKHRoaXMubmVlZHNSZWNhY2hpbmcpIHtcbiAgICAgIHJlY2FjaGUgPSB0cnVlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBkZWJ1ZygndGFzayByZWNhY2hlID0gJXMnLCByZWNhY2hlKVxuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgcmVjYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG5cbiAgICAgIC8qKlxuICAgICAgICogU3dpdGNoIHRvIGJ1bmRsaW5nIG1vZGUgaWYgbmVlZCBiZS5cbiAgICAgICAqL1xuICAgICAgaWYgKHRoaXMubmVlZHNCdW5kbGluZykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgZmlsZXMsIGRlc3QsIHVzZURvdWJsZUNhY2hlKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuc3VyZSBkaXN0IGRpcmVjdG9yeSBleGlzdHMuXG4gICAgICAgKi9cbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUpKVxuICAgICAgICBdXG4gICAgICB9KSlcblxuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0YWNrID0gdGhpcy5idWlsZFN0YWNrKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2JvZHknKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKCdBIHBsdWdpbiBoYXMgZGVzdHJveWVkIHRoZSBzdHJlYW0gYnkgcmV0dXJuaW5nIGEgbm9uLW9iamVjdC4nKSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0KG51bGwsIGRhdGEuYm9keSlcbiAgICAgICAgfSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gcHJvbWlzaWZ5IHRoZSBjdXJyZW50IHBpcGVsaW5lXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtLCBlcnIgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICAvLyBzdGFydCAmIHdhaXQgZm9yIGFsbCBwaXBlbGluZXMgdG8gZW5kXG4gICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcy52YWwoKSlcbiAgICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnU2tpcHBpbmcgdGFzaycpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrLFxuICAgICAgbmVlZHNCdW5kbGluZzogdGhpcy5uZWVkc0J1bmRsaW5nLFxuICAgICAgbmVlZHNSZWNhY2hpbmc6IHRoaXMubmVlZHNSZWNhY2hpbmdcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcbiAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSBqc29uLm5lZWRzQnVuZGxpbmdcbiAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0ganNvbi5uZWVkc1JlY2FjaGluZ1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIl19