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
 * @copyright 2017 10244872 Canada Inc.
 */

const watchlog = (0, _utils.createLogger)('hopp:watch').log;

/**
 * Plugins storage.
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
    let mode = 'stream';

    return this.d.stack.map(([plugin]) => {
      const pluginStream = (0, _mapStream2.default)((data, next) => {
        try {
          plugins[plugin](this.pluginCtx[plugin], data).then(newData => next(null, newData)).catch(err => next(err));
        } catch (err) {
          next(err);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5Db25maWciLCJpc1VuZGVmaW5lZCIsInZhbHVlIiwidW5kZWZpbmVkIiwiSG9wcCIsImNvbnN0cnVjdG9yIiwic3JjIiwiQXJyYXkiLCJwbHVnaW5DdHgiLCJkIiwic3RhY2siLCJkZXN0Iiwib3V0Iiwid2F0Y2giLCJuYW1lIiwiZGlyZWN0b3J5IiwicmVjYWNoZSIsIndhdGNoZXJzIiwiZm9yRWFjaCIsIm5ld3BhdGgiLCJzdWIiLCJzcGxpdCIsImluZGV4T2YiLCJzZXAiLCJyZXNvbHZlIiwic3Vic3RyIiwicHVzaCIsInJlY3Vyc2l2ZSIsInN0YXJ0IiwiUHJvbWlzZSIsInByb2Nlc3MiLCJvbiIsIndhdGNoZXIiLCJjbG9zZSIsInN0YXJ0QnVuZGxpbmciLCJtb2RpZmllZCIsInVzZURvdWJsZUNhY2hlIiwiZGVidWciLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImJhc2VuYW1lIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpbiIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsImxvYWRQbHVnaW4iLCJ0YXNrTmFtZSIsImFyZ3MiLCJtb2QiLCJyZXF1aXJlIiwiY29uZmlnIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJsb2dnZXIiLCJwbHVnaW5DYWNoZSIsImVycm9yIiwibmVlZHNCdW5kbGluZyIsIm5lZWRzUmVjYWNoaW5nIiwibGVuZ3RoIiwibG9hZGVkUGx1Z2lucyIsImhhc093blByb3BlcnR5IiwiRXJyb3IiLCJib2R5IiwiYWxsIiwidmFsIiwidG9KU09OIiwiZnJvbUpTT04iLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBZkE7Ozs7OztBQWlCQSxNQUFNQyxXQUFXLHlCQUFhLFlBQWIsRUFBMkJDLEdBQTVDOztBQUVBOzs7QUFHQSxNQUFNQyxVQUFVLEVBQWhCO0FBQ0EsTUFBTUMsZUFBZSxFQUFyQjs7QUFFQTs7O0FBR0EsU0FBU0MsV0FBVCxDQUFxQkMsS0FBckIsRUFBNEI7QUFDMUIsU0FBT0EsVUFBVUMsU0FBVixJQUF1QkQsVUFBVSxJQUF4QztBQUNEOztBQUVEOzs7QUFHZSxNQUFNRSxJQUFOLENBQVc7QUFDeEI7Ozs7Ozs7QUFPQUMsY0FBYUMsR0FBYixFQUFrQjtBQUNoQixRQUFJLEVBQUVBLGVBQWVDLEtBQWpCLENBQUosRUFBNkI7QUFDM0JELFlBQU0sQ0FBQ0EsR0FBRCxDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFLRSxTQUFMLEdBQWlCLEVBQWpCOztBQUVBO0FBQ0EsU0FBS0MsQ0FBTCxHQUFTO0FBQ1BILFNBRE87QUFFUEksYUFBTztBQUZBLEtBQVQ7QUFJRDs7QUFFRDs7Ozs7QUFLQUMsT0FBTUMsR0FBTixFQUFXO0FBQ1QsU0FBS0gsQ0FBTCxDQUFPRSxJQUFQLEdBQWNDLEdBQWQ7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFFRDs7O0FBR0FDLFFBQU9DLElBQVAsRUFBYUMsU0FBYixFQUF3QkMsVUFBVSxLQUFsQyxFQUF5QztBQUN2Q0YsV0FBUSxTQUFRQSxJQUFLLEVBQXJCOztBQUVBLFVBQU1HLFdBQVcsRUFBakI7O0FBRUEsU0FBS1IsQ0FBTCxDQUFPSCxHQUFQLENB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ZUFBSjtBQUNBLFlBQU0rQixRQUFROEQsR0FBUixDQUFZcEQsTUFBTXFELEdBQU4sRUFBWixDQUFOO0FBQ0E5RixVQUFJLHlCQUFKLEVBQStCaUQsS0FBS0MsR0FBTCxLQUFhcEIsS0FBNUM7QUFDRCxLQXJFRCxNQXFFTztBQUNMOUIsVUFBSSxlQUFKO0FBQ0Q7QUFDRjs7QUFFRDs7OztBQUlBK0YsV0FBVTtBQUNSLFdBQU87QUFDTGxGLFlBQU0sS0FBS0YsQ0FBTCxDQUFPRSxJQURSO0FBRUxMLFdBQUssS0FBS0csQ0FBTCxDQUFPSCxHQUZQO0FBR0xJLGFBQU8sS0FBS0QsQ0FBTCxDQUFPQyxLQUhUO0FBSUwwRSxxQkFBZSxLQUFLQSxhQUpmO0FBS0xDLHNCQUFnQixLQUFLQTtBQUxoQixLQUFQO0FBT0Q7O0FBRUQ7Ozs7O0FBS0FTLFdBQVVDLElBQVYsRUFBZ0I7QUFDZCxTQUFLdEYsQ0FBTCxDQUFPRSxJQUFQLEdBQWNvRixLQUFLcEYsSUFBbkI7QUFDQSxTQUFLRixDQUFMLENBQU9ILEdBQVAsR0FBYXlGLEtBQUt6RixHQUFsQjtBQUNBLFNBQUtHLENBQUwsQ0FBT0MsS0FBUCxHQUFlcUYsS0FBS3JGLEtBQXBCO0FBQ0EsU0FBSzBFLGFBQUwsR0FBcUJXLEtBQUtYLGFBQTFCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQlUsS0FBS1YsY0FBM0I7O0FBRUEsV0FBTyxJQUFQO0FBQ0Q7QUE1WHVCO2tCQUFMakYsSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9mcy9nbG9iJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgbWFwU3RyZWFtIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9mcy9nZXQtcGF0aCdcbmltcG9ydCB7IF8sIGNyZWF0ZUxvZ2dlciB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgZGlzYWJsZUZTQ2FjaGUsIG1rZGlycCwgb3BlbkZpbGUsIHRtcEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCB7IGJ1ZmZlciwgY3JlYXRlQnVuZGxlLCBjcmVhdGVSZWFkU3RyZWFtIH0gZnJvbSAnLi4vc3RyZWFtcydcblxuY29uc3Qgd2F0Y2hsb2cgPSBjcmVhdGVMb2dnZXIoJ2hvcHA6d2F0Y2gnKS5sb2dcblxuLyoqXG4gKiBQbHVnaW5zIHN0b3JhZ2UuXG4gKi9cbmNvbnN0IHBsdWdpbnMgPSB7fVxuY29uc3QgcGx1Z2luQ29uZmlnID0ge31cblxuLyoqXG4gKiBUZXN0IGZvciB1bmRlZmluZWQgb3IgbnVsbC5cbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGxcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgLy8gc3RvcmUgY29udGV4dCBsb2NhbCB0byBlYWNoIHRhc2tcbiAgICB0aGlzLnBsdWdpbkN0eCA9IHt9XG5cbiAgICAvLyBwZXJzaXN0ZW50IGluZm9cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGJ1bmRsaW5nLlxuICAgKi9cbiAgYXN5bmMgc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIG1vZGlmaWVkLCBkZXN0LCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcbiAgICBkZWJ1ZygnU3dpdGNoZWQgdG8gYnVuZGxpbmcgbW9kZScpXG5cbiAgICAvKipcbiAgICAgKiBGZXRjaCBzb3VyY2VtYXAgZnJvbSBjYWNoZS5cbiAgICAgKi9cbiAgICBjb25zdCBzb3VyY2VtYXAgPSBjYWNoZS5zb3VyY2VtYXAobmFtZSlcblxuICAgIC8qKlxuICAgICAqIEdldCBmdWxsIGxpc3Qgb2YgY3VycmVudCBmaWxlcy5cbiAgICAgKi9cbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgdHJ1ZSlcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBsaXN0IG9mIHVubW9kaWZpZWQuXG4gICAgICovXG4gICAgbGV0IGZyZXNoQnVpbGQgPSB0cnVlXG4gICAgY29uc3QgdW5tb2RpZmllZCA9IHt9XG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAobW9kaWZpZWQuaW5kZXhPZihmaWxlKSA9PT0gLTEpIHtcbiAgICAgICAgdW5tb2RpZmllZFtmaWxlXSA9IHRydWVcbiAgICAgICAgZnJlc2hCdWlsZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9sZCBidW5kbGUgJiBjcmVhdGUgbmV3IG9uZS5cbiAgICAgKi9cbiAgICBjb25zdCBvcmlnaW5hbEZkID0gZnJlc2hCdWlsZCA/IG51bGwgOiBhd2FpdCBvcGVuRmlsZShkZXN0LCAncicpXG4gICAgICAgICwgW3RtcEJ1bmRsZSwgdG1wQnVuZGxlUGF0aF0gPSBhd2FpdCB0bXBGaWxlKClcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IGJ1bmRsZSB0byBmb3J3YXJkIHRvLlxuICAgICAqL1xuICAgIGNvbnN0IGJ1bmRsZSA9IGNyZWF0ZUJ1bmRsZSh0bXBCdW5kbGUpXG5cbiAgICAvKipcbiAgICAgKiBTaW5jZSBidW5kbGluZyBzdGFydHMgc3RyZWFtaW5nIHJpZ2h0IGF3YXksIHdlIGNhbiBjb3VudCB0aGlzXG4gICAgICogYXMgdGhlIHN0YXJ0IG9mIHRoZSBidWlsZC5cbiAgICAgKi9cbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuXG4gICAgLyoqXG4gICAgICogQWRkIGFsbCBmaWxlcy5cbiAgICAgKi9cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBsZXQgc3RyZWFtXG5cbiAgICAgIGlmICh1bm1vZGlmaWVkW2ZpbGVdKSB7XG4gICAgICAgIGRlYnVnKCdmb3J3YXJkOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0obnVsbCwge1xuICAgICAgICAgIGZkOiBvcmlnaW5hbEZkLFxuICAgICAgICAgIGF1dG9DbG9zZTogZmFsc2UsXG4gICAgICAgICAgc3RhcnQ6IHNvdXJjZW1hcFtmaWxlXS5zdGFydCxcbiAgICAgICAgICBlbmQ6IHNvdXJjZW1hcFtmaWxlXS5lbmRcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0cmFuc2Zvcm06ICVzJywgZmlsZSlcbiAgICAgICAgc3RyZWFtID0gcHVtcChbXG4gICAgICAgICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlLCBkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICAgICAgXS5jb25jYXQodGhpcy5idWlsZFN0YWNrKCkpKVxuICAgICAgfVxuXG4gICAgICBidW5kbGUuYWRkKGZpbGUsIHN0cmVhbSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYWl0IGZvciBidW5kbGluZyB0byBlbmQuXG4gICAgICovXG4gICAgYXdhaXQgYnVuZGxlLmVuZCh0bXBCdW5kbGVQYXRoKVxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0aGUgYnVuZGxlIHRvIHRoZSBuZXcgbG9jYXRpb24uXG4gICAgICovXG4gICAgaWYgKG9yaWdpbmFsRmQpIG9yaWdpbmFsRmQuY2xvc2UoKVxuICAgIGF3YWl0IG1rZGlycChwYXRoLmRpcm5hbWUoZGVzdCkucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odG1wQnVuZGxlUGF0aCkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KSlcblxuICAgICAgc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgIH0pXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc291cmNlbWFwLlxuICAgICAqL1xuICAgIGNhY2hlLnNvdXJjZW1hcChuYW1lLCBidW5kbGUubWFwKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbGwgcGx1Z2lucyBpbiB0aGUgc3RhY2sgaW50byBzdHJlYW1zLlxuICAgKi9cbiAgYnVpbGRTdGFjayAoKSB7XG4gICAgbGV0IG1vZGUgPSAnc3RyZWFtJ1xuXG4gICAgcmV0dXJuIHRoaXMuZC5zdGFjay5tYXAoKFtwbHVnaW5dKSA9PiB7XG4gICAgICBjb25zdCBwbHVnaW5TdHJlYW0gPSBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0oXG4gICAgICAgICAgICB0aGlzLnBsdWdpbkN0eFtwbHVnaW5dLFxuICAgICAgICAgICAgZGF0YVxuICAgICAgICAgIClcbiAgICAgICAgICAgIC50aGVuKG5ld0RhdGEgPT4gbmV4dChudWxsLCBuZXdEYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gbmV4dChlcnIpKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBuZXh0KGVycilcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGUgYnVmZmVyIG1vZGUgaWYgcmVxdWlyZWQuXG4gICAgICAgKi9cbiAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBwbHVnaW5Db25maWdbcGx1Z2luXS5tb2RlID09PSAnYnVmZmVyJykge1xuICAgICAgICBtb2RlID0gJ2J1ZmZlcidcbiAgICAgICAgcmV0dXJuIHB1bXAoYnVmZmVyKCksIHBsdWdpblN0cmVhbSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBPdGhlcndpc2Uga2VlcCBwdW1waW5nLlxuICAgICAgICovXG4gICAgICByZXR1cm4gcGx1Z2luU3RyZWFtXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICAgKi9cbiAgbG9hZFBsdWdpbiAodGFza05hbWUsIHBsdWdpbiwgYXJncykge1xuICAgIGxldCBtb2QgPSBwbHVnaW5zW3BsdWdpbl1cbiAgICBcbiAgICBpZiAoIW1vZCkge1xuICAgICAgbW9kID0gcmVxdWlyZShwbHVnaW4pXG4gICAgICBcbiAgICAgIC8vIGV4cG9zZSBtb2R1bGUgY29uZmlnXG4gICAgICBwbHVnaW5Db25maWdbcGx1Z2luXSA9IG1vZC5jb25maWcgfHwge31cblxuICAgICAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgICAgIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgICAgIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgICAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICAgICAgfVxuXG4gICAgICAvLyBhZGQgcGx1Z2lucyB0byBsb2FkZWQgcGx1Z2luc1xuICAgICAgcGx1Z2luc1twbHVnaW5dID0gbW9kXG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHt0YXNrTmFtZX06JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgICAvLyBsb2FkL2NyZWF0ZSBjYWNoZSBmb3IgcGx1Z2luXG4gICAgY29uc3QgcGx1Z2luQ2FjaGUgPSBjYWNoZS5wbHVnaW4ocGx1Z2luKVxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICAgIGFyZ3MsXG4gICAgICBjYWNoZTogcGx1Z2luQ2FjaGUsXG4gICAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgICBkZWJ1ZzogbG9nZ2VyLmRlYnVnLFxuICAgICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBGaWd1cmUgb3V0IGlmIGJ1bmRsaW5nIGlzIG5lZWRlZCAmIGxvYWQgcGx1Z2lucy5cbiAgICAgKi9cbiAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5uZWVkc0J1bmRsaW5nKSB8fCBpc1VuZGVmaW5lZCh0aGlzLm5lZWRzUmVjYWNoaW5nKSB8fCAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMubG9hZGVkUGx1Z2lucykpIHtcbiAgICAgIHRoaXMubG9hZGVkUGx1Z2lucyA9IHRydWVcblxuICAgICAgdGhpcy5kLnN0YWNrLmZvckVhY2goKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5DdHguaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgIHRoaXMubG9hZFBsdWdpbihuYW1lLCBwbHVnaW4sIGFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSAhISh0aGlzLm5lZWRzQnVuZGxpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0uYnVuZGxlKVxuICAgICAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0gISEodGhpcy5uZWVkc1JlY2FjaGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5yZWNhY2hlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSByZWNhY2hpbmcuXG4gICAgICovXG4gICAgaWYgKHRoaXMubmVlZHNSZWNhY2hpbmcpIHtcbiAgICAgIHJlY2FjaGUgPSB0cnVlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBkZWJ1ZygndGFzayByZWNhY2hlID0gJXMnLCByZWNhY2hlKVxuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgcmVjYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG5cbiAgICAgIC8qKlxuICAgICAgICogU3dpdGNoIHRvIGJ1bmRsaW5nIG1vZGUgaWYgbmVlZCBiZS5cbiAgICAgICAqL1xuICAgICAgaWYgKHRoaXMubmVlZHNCdW5kbGluZykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgZmlsZXMsIGRlc3QsIHVzZURvdWJsZUNhY2hlKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuc3VyZSBkaXN0IGRpcmVjdG9yeSBleGlzdHMuXG4gICAgICAgKi9cbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUpKVxuICAgICAgICBdXG4gICAgICB9KSlcblxuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0YWNrID0gdGhpcy5idWlsZFN0YWNrKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2JvZHknKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKCdBIHBsdWdpbiBoYXMgZGVzdHJveWVkIHRoZSBzdHJlYW0gYnkgcmV0dXJuaW5nIGEgbm9uLW9iamVjdC4nKSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0KG51bGwsIGRhdGEuYm9keSlcbiAgICAgICAgfSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gcHJvbWlzaWZ5IHRoZSBjdXJyZW50IHBpcGVsaW5lXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtLCBlcnIgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICAvLyBzdGFydCAmIHdhaXQgZm9yIGFsbCBwaXBlbGluZXMgdG8gZW5kXG4gICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcy52YWwoKSlcbiAgICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnU2tpcHBpbmcgdGFzaycpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrLFxuICAgICAgbmVlZHNCdW5kbGluZzogdGhpcy5uZWVkc0J1bmRsaW5nLFxuICAgICAgbmVlZHNSZWNhY2hpbmc6IHRoaXMubmVlZHNSZWNhY2hpbmdcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcbiAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSBqc29uLm5lZWRzQnVuZGxpbmdcbiAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0ganNvbi5uZWVkc1JlY2FjaGluZ1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIl19