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

    // create a new context for this plugin
    this.pluginCtx[plugin] = {
      args,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5Db25maWciLCJpc1VuZGVmaW5lZCIsInZhbHVlIiwidW5kZWZpbmVkIiwiSG9wcCIsImNvbnN0cnVjdG9yIiwic3JjIiwiQXJyYXkiLCJwbHVnaW5DdHgiLCJkIiwic3RhY2siLCJkZXN0Iiwib3V0Iiwid2F0Y2giLCJuYW1lIiwiZGlyZWN0b3J5IiwicmVjYWNoZSIsIndhdGNoZXJzIiwiZm9yRWFjaCIsInJlY3Vyc2l2ZSIsImluZGV4T2YiLCJuZXdwYXRoIiwic3ViIiwic3BsaXQiLCJzZXAiLCJyZXNvbHZlIiwic3Vic3RyIiwicHVzaCIsInN0YXJ0IiwiUHJvbWlzZSIsInByb2Nlc3MiLCJvbiIsIndhdGNoZXIiLCJjbG9zZSIsInN0YXJ0QnVuZGxpbmciLCJtb2RpZmllZCIsInVzZURvdWJsZUNhY2hlIiwiZGVidWciLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImJhc2VuYW1lIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpbiIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsImxvYWRQbHVnaW4iLCJ0YXNrTmFtZSIsImFyZ3MiLCJtb2QiLCJyZXF1aXJlIiwiY29uZmlnIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJsb2dnZXIiLCJlcnJvciIsIm5lZWRzQnVuZGxpbmciLCJuZWVkc1JlY2FjaGluZyIsImxlbmd0aCIsImxvYWRlZFBsdWdpbnMiLCJoYXNPd25Qcm9wZXJ0eSIsIkVycm9yIiwiYm9keSIsImFsbCIsInZhbCIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWZBOzs7Ozs7QUFpQkEsTUFBTUMsV0FBVyx5QkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7O0FBR0EsTUFBTUMsVUFBVSxFQUFoQjtBQUNBLE1BQU1DLGVBQWUsRUFBckI7O0FBRUE7OztBQUdBLFNBQVNDLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQTRCO0FBQzFCLFNBQU9BLFVBQVVDLFNBQVYsSUFBdUJELFVBQVUsSUFBeEM7QUFDRDs7QUFFRDs7O0FBR2UsTUFBTUUsSUFBTixDQUFXO0FBQ3hCOzs7Ozs7O0FBT0FDLGNBQWFDLEdBQWIsRUFBa0I7QUFDaEIsUUFBSSxFQUFFQSxlQUFlQyxLQUFqQixDQUFKLEVBQTZCO0FBQzNCRCxZQUFNLENBQUNBLEdBQUQsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsU0FBS0UsU0FBTCxHQUFpQixFQUFqQjs7QUFFQTtBQUNBLFNBQUtDLENBQUwsR0FBUztBQUNQSCxTQURPO0FBRVBJLGFBQU87QUFGQSxLQUFUO0FBSUQ7O0FBRUQ7Ozs7O0FBS0FDLE9BQU1DLEdBQU4sRUFBVztBQUNULFNBQUtILENBQUwsQ0FBT0UsSUFBUCxHQUFjQyxHQUFkO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQ7OztBQUdBQyxRQUFPQyxJQUFQLEVBQWFDLFNBQWIsRUFBd0JDLFVBQVUsS0FBbEMsRUFBeUM7QUFDdkNGLFdBQVEsU0FBUUEsSUFBSyxFQUFyQjs7QUFFQSxVQUFNRyxXQUFXLEVBQWpCOztBQUVBLFNBQUtSLENBQUwsQ0FBT0gsR0FBUCxDQUFXWSxPQUFYLENBQW1C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LENBQVluRCxNQUFNb0QsR0FBTixFQUFaLENBQU47QUFDQTdGLFVBQUkseUJBQUosRUFBK0JpRCxLQUFLQyxHQUFMLEtBQWFwQixLQUE1QztBQUNELEtBckVELE1BcUVPO0FBQ0w5QixVQUFJLGVBQUo7QUFDRDtBQUNGOztBQUVEOzs7O0FBSUE4RixXQUFVO0FBQ1IsV0FBTztBQUNMakYsWUFBTSxLQUFLRixDQUFMLENBQU9FLElBRFI7QUFFTEwsV0FBSyxLQUFLRyxDQUFMLENBQU9ILEdBRlA7QUFHTEksYUFBTyxLQUFLRCxDQUFMLENBQU9DLEtBSFQ7QUFJTHlFLHFCQUFlLEtBQUtBLGFBSmY7QUFLTEMsc0JBQWdCLEtBQUtBO0FBTGhCLEtBQVA7QUFPRDs7QUFFRDs7Ozs7QUFLQVMsV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUtyRixDQUFMLENBQU9FLElBQVAsR0FBY21GLEtBQUtuRixJQUFuQjtBQUNBLFNBQUtGLENBQUwsQ0FBT0gsR0FBUCxHQUFhd0YsS0FBS3hGLEdBQWxCO0FBQ0EsU0FBS0csQ0FBTCxDQUFPQyxLQUFQLEdBQWVvRixLQUFLcEYsS0FBcEI7QUFDQSxTQUFLeUUsYUFBTCxHQUFxQlcsS0FBS1gsYUFBMUI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCVSxLQUFLVixjQUEzQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQTNYdUI7a0JBQUxoRixJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBnbG9iIGZyb20gJy4uL2ZzL2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBtYXBTdHJlYW0gZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4uL2ZzL2dldC1wYXRoJ1xuaW1wb3J0IHsgXywgY3JlYXRlTG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMnXG5pbXBvcnQgeyBkaXNhYmxlRlNDYWNoZSwgbWtkaXJwLCBvcGVuRmlsZSwgdG1wRmlsZSB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0IHsgYnVmZmVyLCBjcmVhdGVCdW5kbGUsIGNyZWF0ZVJlYWRTdHJlYW0gfSBmcm9tICcuLi9zdHJlYW1zJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIFBsdWdpbnMgc3RvcmFnZS5cbiAqL1xuY29uc3QgcGx1Z2lucyA9IHt9XG5jb25zdCBwbHVnaW5Db25maWcgPSB7fVxuXG4vKipcbiAqIFRlc3QgZm9yIHVuZGVmaW5lZCBvciBudWxsLlxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICAvLyBzdG9yZSBjb250ZXh0IGxvY2FsIHRvIGVhY2ggdGFza1xuICAgIHRoaXMucGx1Z2luQ3R4ID0ge31cblxuICAgIC8vIHBlcnNpc3RlbnQgaW5mb1xuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUsIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBidW5kbGluZy5cbiAgICovXG4gIGFzeW5jIHN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBtb2RpZmllZCwgZGVzdCwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgZGVidWcoJ1N3aXRjaGVkIHRvIGJ1bmRsaW5nIG1vZGUnKVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc291cmNlbWFwIGZyb20gY2FjaGUuXG4gICAgICovXG4gICAgY29uc3Qgc291cmNlbWFwID0gY2FjaGUuc291cmNlbWFwKG5hbWUpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZnVsbCBsaXN0IG9mIGN1cnJlbnQgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHRydWUpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbGlzdCBvZiB1bm1vZGlmaWVkLlxuICAgICAqL1xuICAgIGxldCBmcmVzaEJ1aWxkID0gdHJ1ZVxuICAgIGNvbnN0IHVubW9kaWZpZWQgPSB7fVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKG1vZGlmaWVkLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgIHVubW9kaWZpZWRbZmlsZV0gPSB0cnVlXG4gICAgICAgIGZyZXNoQnVpbGQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvbGQgYnVuZGxlICYgY3JlYXRlIG5ldyBvbmUuXG4gICAgICovXG4gICAgY29uc3Qgb3JpZ2luYWxGZCA9IGZyZXNoQnVpbGQgPyBudWxsIDogYXdhaXQgb3BlbkZpbGUoZGVzdCwgJ3InKVxuICAgICAgICAsIFt0bXBCdW5kbGUsIHRtcEJ1bmRsZVBhdGhdID0gYXdhaXQgdG1wRmlsZSgpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBidW5kbGUgdG8gZm9yd2FyZCB0by5cbiAgICAgKi9cbiAgICBjb25zdCBidW5kbGUgPSBjcmVhdGVCdW5kbGUodG1wQnVuZGxlKVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgYnVuZGxpbmcgc3RhcnRzIHN0cmVhbWluZyByaWdodCBhd2F5LCB3ZSBjYW4gY291bnQgdGhpc1xuICAgICAqIGFzIHRoZSBzdGFydCBvZiB0aGUgYnVpbGQuXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgZmlsZXMuXG4gICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGV0IHN0cmVhbVxuXG4gICAgICBpZiAodW5tb2RpZmllZFtmaWxlXSkge1xuICAgICAgICBkZWJ1ZygnZm9yd2FyZDogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG51bGwsIHtcbiAgICAgICAgICBmZDogb3JpZ2luYWxGZCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0OiBzb3VyY2VtYXBbZmlsZV0uc3RhcnQsXG4gICAgICAgICAgZW5kOiBzb3VyY2VtYXBbZmlsZV0uZW5kXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndHJhbnNmb3JtOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IHB1bXAoW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgICAgIF0uY29uY2F0KHRoaXMuYnVpbGRTdGFjaygpKSlcbiAgICAgIH1cblxuICAgICAgYnVuZGxlLmFkZChmaWxlLCBzdHJlYW0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2FpdCBmb3IgYnVuZGxpbmcgdG8gZW5kLlxuICAgICAqL1xuICAgIGF3YWl0IGJ1bmRsZS5lbmQodG1wQnVuZGxlUGF0aClcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdGhlIGJ1bmRsZSB0byB0aGUgbmV3IGxvY2F0aW9uLlxuICAgICAqL1xuICAgIGlmIChvcmlnaW5hbEZkKSBvcmlnaW5hbEZkLmNsb3NlKClcbiAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGRlc3QpLnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRtcEJ1bmRsZVBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCkpXG5cbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNvdXJjZW1hcC5cbiAgICAgKi9cbiAgICBjYWNoZS5zb3VyY2VtYXAobmFtZSwgYnVuZGxlLm1hcClcblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYWxsIHBsdWdpbnMgaW4gdGhlIHN0YWNrIGludG8gc3RyZWFtcy5cbiAgICovXG4gIGJ1aWxkU3RhY2sgKCkge1xuICAgIGxldCBtb2RlID0gJ3N0cmVhbSdcblxuICAgIHJldHVybiB0aGlzLmQuc3RhY2subWFwKChbcGx1Z2luXSkgPT4ge1xuICAgICAgY29uc3QgcGx1Z2luU3RyZWFtID0gbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICApXG4gICAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbmV4dChlcnIpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8qKlxuICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICovXG4gICAgICBpZiAobW9kZSA9PT0gJ3N0cmVhbScgJiYgcGx1Z2luQ29uZmlnW3BsdWdpbl0ubW9kZSA9PT0gJ2J1ZmZlcicpIHtcbiAgICAgICAgbW9kZSA9ICdidWZmZXInXG4gICAgICAgIHJldHVybiBwdW1wKGJ1ZmZlcigpLCBwbHVnaW5TdHJlYW0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3RoZXJ3aXNlIGtlZXAgcHVtcGluZy5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIHBsdWdpblN0cmVhbVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYSBwbHVnaW4sIG1hbmFnZXMgaXRzIGVudi5cbiAgICovXG4gIGxvYWRQbHVnaW4gKHRhc2tOYW1lLCBwbHVnaW4sIGFyZ3MpIHtcbiAgICBsZXQgbW9kID0gcGx1Z2luc1twbHVnaW5dXG4gICAgXG4gICAgaWYgKCFtb2QpIHtcbiAgICAgIG1vZCA9IHJlcXVpcmUocGx1Z2luKVxuICAgICAgXG4gICAgICAvLyBleHBvc2UgbW9kdWxlIGNvbmZpZ1xuICAgICAgcGx1Z2luQ29uZmlnW3BsdWdpbl0gPSBtb2QuY29uZmlnIHx8IHt9XG5cbiAgICAgIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gICAgICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gICAgICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICAgICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHBsdWdpbnMgdG8gbG9hZGVkIHBsdWdpbnNcbiAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IG1vZFxuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gICAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7dGFza05hbWV9OiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICAgIGFyZ3MsXG4gICAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgICBkZWJ1ZzogbG9nZ2VyLmRlYnVnLFxuICAgICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBGaWd1cmUgb3V0IGlmIGJ1bmRsaW5nIGlzIG5lZWRlZCAmIGxvYWQgcGx1Z2lucy5cbiAgICAgKi9cbiAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5uZWVkc0J1bmRsaW5nKSB8fCBpc1VuZGVmaW5lZCh0aGlzLm5lZWRzUmVjYWNoaW5nKSB8fCAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMubG9hZGVkUGx1Z2lucykpIHtcbiAgICAgIHRoaXMubG9hZGVkUGx1Z2lucyA9IHRydWVcblxuICAgICAgdGhpcy5kLnN0YWNrLmZvckVhY2goKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5DdHguaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgIHRoaXMubG9hZFBsdWdpbihuYW1lLCBwbHVnaW4sIGFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSAhISh0aGlzLm5lZWRzQnVuZGxpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0uYnVuZGxlKVxuICAgICAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0gISEodGhpcy5uZWVkc1JlY2FjaGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5yZWNhY2hlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSByZWNhY2hpbmcuXG4gICAgICovXG4gICAgaWYgKHRoaXMubmVlZHNSZWNhY2hpbmcpIHtcbiAgICAgIHJlY2FjaGUgPSB0cnVlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBkZWJ1ZygndGFzayByZWNhY2hlID0gJXMnLCByZWNhY2hlKVxuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgcmVjYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG5cbiAgICAgIC8qKlxuICAgICAgICogU3dpdGNoIHRvIGJ1bmRsaW5nIG1vZGUgaWYgbmVlZCBiZS5cbiAgICAgICAqL1xuICAgICAgaWYgKHRoaXMubmVlZHNCdW5kbGluZykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgZmlsZXMsIGRlc3QsIHVzZURvdWJsZUNhY2hlKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuc3VyZSBkaXN0IGRpcmVjdG9yeSBleGlzdHMuXG4gICAgICAgKi9cbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUpKVxuICAgICAgICBdXG4gICAgICB9KSlcblxuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0YWNrID0gdGhpcy5idWlsZFN0YWNrKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2JvZHknKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKCdBIHBsdWdpbiBoYXMgZGVzdHJveWVkIHRoZSBzdHJlYW0gYnkgcmV0dXJuaW5nIGEgbm9uLW9iamVjdC4nKSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0KG51bGwsIGRhdGEuYm9keSlcbiAgICAgICAgfSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gcHJvbWlzaWZ5IHRoZSBjdXJyZW50IHBpcGVsaW5lXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtLCBlcnIgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICAvLyBzdGFydCAmIHdhaXQgZm9yIGFsbCBwaXBlbGluZXMgdG8gZW5kXG4gICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcy52YWwoKSlcbiAgICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnU2tpcHBpbmcgdGFzaycpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrLFxuICAgICAgbmVlZHNCdW5kbGluZzogdGhpcy5uZWVkc0J1bmRsaW5nLFxuICAgICAgbmVlZHNSZWNhY2hpbmc6IHRoaXMubmVlZHNSZWNhY2hpbmdcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcbiAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSBqc29uLm5lZWRzQnVuZGxpbmdcbiAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0ganNvbi5uZWVkc1JlY2FjaGluZ1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIl19