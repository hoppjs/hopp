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
const pluginConfig = {};

/**
 * Loads a plugin, manages its env.
 */
const loadPlugin = (plugin, args) => {
  let mod = require(plugin);

  // expose module config
  pluginConfig[plugin] = mod.config || {};

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
    log: logger.log,
    debug: logger.debug,
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
        stream = (0, _pump2.default)([(0, _streams.createReadStream)(file)].concat(this.buildStack()));
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
          plugins[plugin](pluginCtx[plugin], data).then(newData => next(null, newData)).catch(err => next(err));
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

      /**
       * Bundling tangeant.
       */
      if (this.d.stack.length > 0) {
        let needsBundling = false;

        /**
         * Try to load plugins.
         */
        if (!this.loadedPlugins) {
          this.loadedPlugins = true;

          this.d.stack.forEach(([plugin, args]) => {
            if (!plugins.hasOwnProperty(plugin)) {
              plugins[plugin] = loadPlugin(plugin, args);
              needsBundling = needsBundling || pluginConfig[plugin].bundle;
            }
          });
        }

        /**
         * Switch to bundling mode if need be.
         */
        if (needsBundling) {
          return await this.startBundling(name, directory, files, dest, useDoubleCache);
        }
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
        stream: [(0, _streams.createReadStream)(file, dest)]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJjb25zdHJ1Y3RvciIsInNyYyIsIkFycmF5IiwiZCIsInN0YWNrIiwiZGVzdCIsIm91dCIsIndhdGNoIiwibmFtZSIsImRpcmVjdG9yeSIsInJlY2FjaGUiLCJ3YXRjaGVycyIsImZvckVhY2giLCJyZWN1cnNpdmUiLCJpbmRleE9mIiwibmV3cGF0aCIsInN1YiIsInNwbGl0Iiwic2VwIiwicmVzb2x2ZSIsInB1c2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJzdGFydEJ1bmRsaW5nIiwibW9kaWZpZWQiLCJ1c2VEb3VibGVDYWNoZSIsInNvdXJjZW1hcCIsImZpbGVzIiwiZnJlc2hCdWlsZCIsInVubW9kaWZpZWQiLCJmaWxlIiwib3JpZ2luYWxGZCIsInRtcEJ1bmRsZSIsInRtcEJ1bmRsZVBhdGgiLCJidW5kbGUiLCJEYXRlIiwibm93Iiwic3RyZWFtIiwiY3JlYXRlUmVhZFN0cmVhbSIsImZkIiwiYXV0b0Nsb3NlIiwiZW5kIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsImxlbmd0aCIsIm5lZWRzQnVuZGxpbmciLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJv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T0FBSixDQUFZLENBQUNILE9BQUQsRUFBVWdDLE1BQVYsS0FBcUI7QUFDdEM7QUFDQWpCLGVBQUtPLE1BQUwsR0FBYyxvQkFBS1AsS0FBS08sTUFBVixFQUFrQnFCLE9BQU87QUFDckMsZ0JBQUlBLEdBQUosRUFBU1gsT0FBT1csR0FBUDtBQUNWLFdBRmEsQ0FBZDtBQUdBNUIsZUFBS08sTUFBTCxDQUFZakIsRUFBWixDQUFlLE9BQWYsRUFBd0JMLE9BQXhCO0FBQ0QsU0FOTSxDQUFQO0FBT0QsT0FuQkQ7O0FBcUJBO0FBQ0EsWUFBTUUsUUFBUWtCLEtBQUtDLEdBQUwsRUFBZDtBQUNBMUQsVUFBSSxlQUFKO0FBQ0EsWUFBTXdDLFFBQVErQyxHQUFSLENBQVl0QyxNQUFNdUMsR0FBTixFQUFaLENBQU47QUFDQXhGLFVBQUkseUJBQUosRUFBK0J5RCxLQUFLQyxHQUFMLEtBQWFuQixLQUE1QztBQUNELEtBMUZELE1BMEZPO0FBQ0x2QyxVQUFJLGVBQUo7QUFDRDtBQUNGOztBQUVEOzs7O0FBSUF5RixXQUFVO0FBQ1IsV0FBTztBQUNMbEUsWUFBTSxLQUFLRixDQUFMLENBQU9FLElBRFI7QUFFTEosV0FBSyxLQUFLRSxDQUFMLENBQU9GLEdBRlA7QUFHTEcsYUFBTyxLQUFLRCxDQUFMLENBQU9DO0FBSFQsS0FBUDtBQUtEOztBQUVEOzs7OztBQUtBb0UsV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUt0RSxDQUFMLENBQU9FLElBQVAsR0FBY29FLEtBQUtwRSxJQUFuQjtBQUNBLFNBQUtGLENBQUwsQ0FBT0YsR0FBUCxHQUFhd0UsS0FBS3hFLEdBQWxCO0FBQ0EsU0FBS0UsQ0FBTCxDQUFPQyxLQUFQLEdBQWVxRSxLQUFLckUsS0FBcEI7O0FBRUEsV0FBTyxJQUFQO0FBQ0Q7QUE3VXVCO2tCQUFMTCxJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBnbG9iIGZyb20gJy4uL2ZzL2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBtYXBTdHJlYW0gZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4uL2ZzL2dldC1wYXRoJ1xuaW1wb3J0IHsgXywgY3JlYXRlTG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMnXG5pbXBvcnQgeyBkaXNhYmxlRlNDYWNoZSwgbWtkaXJwLCBvcGVuRmlsZSwgdG1wRmlsZSB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0IHsgYnVmZmVyLCBjcmVhdGVCdW5kbGUsIGNyZWF0ZVJlYWRTdHJlYW0gfSBmcm9tICcuLi9zdHJlYW1zJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIFBsdWdpbnMgc3RvcmFnZS5cbiAqL1xuY29uc3QgcGx1Z2lucyA9IHt9XG5jb25zdCBwbHVnaW5DdHggPSB7fVxuY29uc3QgcGx1Z2luQ29uZmlnID0ge31cblxuLyoqXG4gKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICovXG5jb25zdCBsb2FkUGx1Z2luID0gKHBsdWdpbiwgYXJncykgPT4ge1xuICBsZXQgbW9kID0gcmVxdWlyZShwbHVnaW4pXG4gIFxuICAvLyBleHBvc2UgbW9kdWxlIGNvbmZpZ1xuICBwbHVnaW5Db25maWdbcGx1Z2luXSA9IG1vZC5jb25maWcgfHwge31cblxuICAvLyBpZiBkZWZpbmVkIGFzIGFuIEVTMjAxNSBtb2R1bGUsIGFzc3VtZSB0aGF0IHRoZVxuICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgIG1vZCA9IG1vZC5kZWZhdWx0XG4gIH1cblxuICAvLyBjcmVhdGUgcGx1Z2luIGxvZ2dlclxuICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gIHBsdWdpbkN0eFtwbHVnaW5dID0ge1xuICAgIGFyZ3MsXG4gICAgbG9nOiBsb2dnZXIubG9nLFxuICAgIGRlYnVnOiBsb2dnZXIuZGVidWcsXG4gICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICB9XG5cbiAgLy8gcmV0dXJuIGxvYWRlZCBwbHVnaW5cbiAgcmV0dXJuIG1vZFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgd2F0Y2ggc2hvdWxkIGJlIHJlY3Vyc2l2ZVxuICAgICAgY29uc3QgcmVjdXJzaXZlID0gc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcblxuICAgICAgLy8gZ2V0IG1vc3QgZGVmaW5pdGl2ZSBwYXRoIHBvc3NpYmxlXG4gICAgICBsZXQgbmV3cGF0aCA9ICcnXG4gICAgICBmb3IgKGxldCBzdWIgb2Ygc3JjLnNwbGl0KCcvJykpIHtcbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIGlmIChzdWIuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdwYXRoICs9IHBhdGguc2VwICsgc3ViXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld3BhdGggPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBuZXdwYXRoLnN1YnN0cigxKSlcblxuICAgICAgLy8gZGlzYWJsZSBmcyBjYWNoaW5nIGZvciB3YXRjaFxuICAgICAgZGlzYWJsZUZTQ2FjaGUoKVxuXG4gICAgICAvLyBzdGFydCB3YXRjaFxuICAgICAgd2F0Y2hsb2coJ1dhdGNoaW5nIGZvciAlcyAuLi4nLCBuYW1lKVxuICAgICAgd2F0Y2hlcnMucHVzaChmcy53YXRjaChuZXdwYXRoLCB7XG4gICAgICAgIHJlY3Vyc2l2ZTogc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcbiAgICAgIH0sICgpID0+IHRoaXMuc3RhcnQobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlLCBmYWxzZSkpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB3YXRjaGVyLmNsb3NlKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYnVuZGxpbmcuXG4gICAqL1xuICBhc3luYyBzdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgbW9kaWZpZWQsIGRlc3QsIHVzZURvdWJsZUNhY2hlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuICAgIGRlYnVnKCdTd2l0Y2hlZCB0byBidW5kbGluZyBtb2RlJylcblxuICAgIC8qKlxuICAgICAqIEZldGNoIHNvdXJjZW1hcCBmcm9tIGNhY2hlLlxuICAgICAqL1xuICAgIGNvbnN0IHNvdXJjZW1hcCA9IGNhY2hlLnNvdXJjZW1hcChuYW1lKVxuXG4gICAgLyoqXG4gICAgICogR2V0IGZ1bGwgbGlzdCBvZiBjdXJyZW50IGZpbGVzLlxuICAgICAqL1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlLCB0cnVlKVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGxpc3Qgb2YgdW5tb2RpZmllZC5cbiAgICAgKi9cbiAgICBsZXQgZnJlc2hCdWlsZCA9IHRydWVcbiAgICBjb25zdCB1bm1vZGlmaWVkID0ge31cblxuICAgIGZvciAobGV0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgIGlmIChtb2RpZmllZC5pbmRleE9mKGZpbGUpID09PSAtMSkge1xuICAgICAgICB1bm1vZGlmaWVkW2ZpbGVdID0gdHJ1ZVxuICAgICAgICBmcmVzaEJ1aWxkID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgb2xkIGJ1bmRsZSAmIGNyZWF0ZSBuZXcgb25lLlxuICAgICAqL1xuICAgIGNvbnN0IG9yaWdpbmFsRmQgPSBmcmVzaEJ1aWxkID8gbnVsbCA6IGF3YWl0IG9wZW5GaWxlKGRlc3QsICdyJylcbiAgICAgICAgLCBbdG1wQnVuZGxlLCB0bXBCdW5kbGVQYXRoXSA9IGF3YWl0IHRtcEZpbGUoKVxuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBuZXcgYnVuZGxlIHRvIGZvcndhcmQgdG8uXG4gICAgICovXG4gICAgY29uc3QgYnVuZGxlID0gY3JlYXRlQnVuZGxlKHRtcEJ1bmRsZSlcblxuICAgIC8qKlxuICAgICAqIFNpbmNlIGJ1bmRsaW5nIHN0YXJ0cyBzdHJlYW1pbmcgcmlnaHQgYXdheSwgd2UgY2FuIGNvdW50IHRoaXNcbiAgICAgKiBhcyB0aGUgc3RhcnQgb2YgdGhlIGJ1aWxkLlxuICAgICAqL1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYWxsIGZpbGVzLlxuICAgICAqL1xuICAgIGZvciAobGV0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgIGxldCBzdHJlYW1cblxuICAgICAgaWYgKHVubW9kaWZpZWRbZmlsZV0pIHtcbiAgICAgICAgZGVidWcoJ2ZvcndhcmQ6ICVzJywgZmlsZSlcbiAgICAgICAgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShudWxsLCB7XG4gICAgICAgICAgZmQ6IG9yaWdpbmFsRmQsXG4gICAgICAgICAgYXV0b0Nsb3NlOiBmYWxzZSxcbiAgICAgICAgICBzdGFydDogc291cmNlbWFwW2ZpbGVdLnN0YXJ0LFxuICAgICAgICAgIGVuZDogc291cmNlbWFwW2ZpbGVdLmVuZFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVidWcoJ3RyYW5zZm9ybTogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBwdW1wKFtjcmVhdGVSZWFkU3RyZWFtKGZpbGUpXS5jb25jYXQodGhpcy5idWlsZFN0YWNrKCkpKVxuICAgICAgfVxuXG4gICAgICBidW5kbGUuYWRkKGZpbGUsIHN0cmVhbSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYWl0IGZvciBidW5kbGluZyB0byBlbmQuXG4gICAgICovXG4gICAgYXdhaXQgYnVuZGxlLmVuZCh0bXBCdW5kbGVQYXRoKVxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0aGUgYnVuZGxlIHRvIHRoZSBuZXcgbG9jYXRpb24uXG4gICAgICovXG4gICAgaWYgKG9yaWdpbmFsRmQpIG9yaWdpbmFsRmQuY2xvc2UoKVxuICAgIGF3YWl0IG1rZGlycChwYXRoLmRpcm5hbWUoZGVzdCkucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odG1wQnVuZGxlUGF0aCkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KSlcblxuICAgICAgc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgIH0pXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc291cmNlbWFwLlxuICAgICAqL1xuICAgIGNhY2hlLnNvdXJjZW1hcChuYW1lLCBidW5kbGUubWFwKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbGwgcGx1Z2lucyBpbiB0aGUgc3RhY2sgaW50byBzdHJlYW1zLlxuICAgKi9cbiAgYnVpbGRTdGFjayAoKSB7XG4gICAgbGV0IG1vZGUgPSAnc3RyZWFtJ1xuXG4gICAgcmV0dXJuIHRoaXMuZC5zdGFjay5tYXAoKFtwbHVnaW5dKSA9PiB7XG4gICAgICBjb25zdCBwbHVnaW5TdHJlYW0gPSBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0oXG4gICAgICAgICAgICBwbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICApXG4gICAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbmV4dChlcnIpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8qKlxuICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICovXG4gICAgICBpZiAobW9kZSA9PT0gJ3N0cmVhbScgJiYgcGx1Z2luQ29uZmlnW3BsdWdpbl0ubW9kZSA9PT0gJ2J1ZmZlcicpIHtcbiAgICAgICAgbW9kZSA9ICdidWZmZXInXG4gICAgICAgIHJldHVybiBwdW1wKGJ1ZmZlcigpLCBwbHVnaW5TdHJlYW0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3RoZXJ3aXNlIGtlZXAgcHVtcGluZy5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIHBsdWdpblN0cmVhbVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UsIHVzZURvdWJsZUNhY2hlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBkZWJ1ZygndGFzayByZWNhY2hlID0gJXMnLCByZWNhY2hlKVxuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgcmVjYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG5cbiAgICAgIC8qKlxuICAgICAgICogQnVuZGxpbmcgdGFuZ2VhbnQuXG4gICAgICAgKi9cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgbmVlZHNCdW5kbGluZyA9IGZhbHNlXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyeSB0byBsb2FkIHBsdWdpbnMuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoIXRoaXMubG9hZGVkUGx1Z2lucykge1xuICAgICAgICAgIHRoaXMubG9hZGVkUGx1Z2lucyA9IHRydWVcblxuICAgICAgICAgIHRoaXMuZC5zdGFjay5mb3JFYWNoKChbcGx1Z2luLCBhcmdzXSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwbHVnaW5zLmhhc093blByb3BlcnR5KHBsdWdpbikpIHtcbiAgICAgICAgICAgICAgcGx1Z2luc1twbHVnaW5dID0gbG9hZFBsdWdpbihwbHVnaW4sIGFyZ3MpXG4gICAgICAgICAgICAgIG5lZWRzQnVuZGxpbmcgPSBuZWVkc0J1bmRsaW5nIHx8IHBsdWdpbkNvbmZpZ1twbHVnaW5dLmJ1bmRsZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogU3dpdGNoIHRvIGJ1bmRsaW5nIG1vZGUgaWYgbmVlZCBiZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChuZWVkc0J1bmRsaW5nKSB7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIGZpbGVzLCBkZXN0LCB1c2VEb3VibGVDYWNoZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuc3VyZSBkaXN0IGRpcmVjdG9yeSBleGlzdHMuXG4gICAgICAgKi9cbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QpXG4gICAgICAgIF1cbiAgICAgIH0pKVxuXG4gICAgICBpZiAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3RhY2sgPSB0aGlzLmJ1aWxkU3RhY2soKVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb25uZWN0IHBsdWdpbiBzdHJlYW1zIHdpdGggcGlwZWxpbmVzLlxuICAgICAgICAgKi9cbiAgICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtID0gZmlsZS5zdHJlYW0uY29uY2F0KHN0YWNrKVxuICAgICAgICAgIHJldHVybiBmaWxlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29ubmVjdCB3aXRoIGRlc3RpbmF0aW9uLlxuICAgICAgICovXG4gICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIC8vIHN0cmlwIG91dCB0aGUgYWN0dWFsIGJvZHkgYW5kIHdyaXRlIGl0XG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2gobWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCAhZGF0YS5oYXNPd25Qcm9wZXJ0eSgnYm9keScpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoJ0EgcGx1Z2luIGhhcyBkZXN0cm95ZWQgdGhlIHN0cmVhbSBieSByZXR1cm5pbmcgYSBub24tb2JqZWN0LicpKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQobnVsbCwgZGF0YS5ib2R5KVxuICAgICAgICB9KSlcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcblxuICAgICAgICAvLyBwcm9taXNpZnkgdGhlIGN1cnJlbnQgcGlwZWxpbmVcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAvLyBjb25uZWN0IGFsbCBzdHJlYW1zIHRvZ2V0aGVyIHRvIGZvcm0gcGlwZWxpbmVcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IHB1bXAoZmlsZS5zdHJlYW0sIGVyciA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHN0YXJ0ICYgd2FpdCBmb3IgYWxsIHBpcGVsaW5lcyB0byBlbmRcbiAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgbG9nKCdTdGFydGluZyB0YXNrJylcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLnZhbCgpKVxuICAgICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdTa2lwcGluZyB0YXNrJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=