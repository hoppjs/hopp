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

    // add plugins to loaded plugins
  };plugins[plugin] = mod;
};

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

    this.needsBundling = false;
    this.needsRecaching = false;

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
     * Figure out if bundling is needed & load plugins.
     */
    if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || this.d.stack.length > 0 && !this.loadedPlugins) {
      this.loadedPlugins = true;

      this.d.stack.forEach(([plugin, args]) => {
        if (!plugins.hasOwnProperty(plugin)) {
          loadPlugin(plugin, args);
        }

        console.log('testing for recaching');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsImlzVW5kZWZpbmVkIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJBcnJheSIsIm5lZWRzQnVuZGxpbmciLCJuZWVkc1JlY2FjaGluZyIsImQiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJ3YXRjaCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJyZWNhY2hlIiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzdWIiLCJzcGxpdCIsInNlcCIsInJlc29sdmUiLCJwdXNoIiwic3RhcnQiLCJQcm9taXNlIiwicHJvY2VzcyIsIm9uIiwid2F0Y2hlciIsImNsb3NlIiwic3RhcnRCdW5kbGluZyIsIm1vZGlmaWVkIiwidXNlRG91YmxlQ2FjaGUiLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImNvbmNhdCIsImJ1aWxkU3RhY2siLCJhZGQiLCJkaXJuYW1lIiwicmVwbGFjZSIsInJlamVjdCIsInBpcGUiLCJjcmVhdGVXcml0ZVN0cmVhbSIsIm1hcCIsIm1vZGUiLCJwbHVnaW5TdHJlYW0iLCJkYXRhIiwibmV4dCIsInRoZW4iLCJuZXdEYXRhIiwiY2F0Y2giLCJlcnIiLCJsZW5ndGgiLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJjb25zb2xlIiwiRXJyb3IiLCJib2R5IiwiYWxsIiwidmFsIiwidG9KU09OIiwiZnJvbUpTT04iLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBZkE7Ozs7OztBQWlCQSxNQUFNQyxXQUFXLHlCQUFhLFlBQWIsRUFBMkJDLEdBQTVDOztBQUVBOzs7QUFHQSxNQUFNQyxVQUFVLEVBQWhCO0FBQ0EsTUFBTUMsWUFBWSxFQUFsQjtBQUNBLE1BQU1DLGVBQWUsRUFBckI7O0FBRUE7OztBQUdBLE1BQU1DLGFBQWEsQ0FBQ0MsTUFBRCxFQUFTQyxJQUFULEtBQWtCO0FBQ25DLE1BQUlDLE1BQU1DLFFBQVFILE1BQVIsQ0FBVjs7QUFFQTtBQUNBRixlQUFhRSxNQUFiLElBQXVCRSxJQUFJRSxNQUFKLElBQWMsRUFBckM7O0FBRUE7QUFDQTtBQUNBLE1BQUlGLElBQUlHLFVBQUosS0FBbUIsSUFBdkIsRUFBNkI7QUFDM0JILFVBQU1BLElBQUlJLE9BQVY7QUFDRDs7QUFFRDtBQUNBLFFBQU1DLFNBQVMseUJBQWMsUUFBTyxlQUFLQyxRQUFMLENBQWNSLE1BQWQsRUFBc0JTLE1BQXRCLENBQTZCLENBQTdCLENBQWdDLEVBQXJELENBQWY7O0FBRUE7QUFDQVosWUFBVUcsTUFBVixJQUFvQjtBQUNsQkMsUUFEa0I7QUFFbEJOLFNBQUtZLE9BQU9aLEdBRk07QUFHbEJlLFdBQU9ILE9BQU9HLEtBSEk7QUFJbEJDLFdBQU9KLE9BQU9JOztBQUdoQjtBQVBvQixHQUFwQixDQVFBZixRQUFRSSxNQUFSLElBQWtCRSxHQUFsQjtBQUNELENBekJEOztBQTJCQTs7O0FBR0EsU0FBU1UsV0FBVCxDQUFxQkMsS0FBckIsRUFBNEI7QUFDMUIsU0FBT0EsVUFBVUMsU0FB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LEtBckVELE1BcUVPO0FBQ0w1QyxVQUFJLGVBQUo7QUFDRDtBQUNGOztBQUVEOzs7O0FBSUE4RixXQUFVO0FBQ1IsV0FBTztBQUNMbEUsWUFBTSxLQUFLRixDQUFMLENBQU9FLElBRFI7QUFFTE4sV0FBSyxLQUFLSSxDQUFMLENBQU9KLEdBRlA7QUFHTEssYUFBTyxLQUFLRCxDQUFMLENBQU9DLEtBSFQ7QUFJTEgscUJBQWUsS0FBS0EsYUFKZjtBQUtMQyxzQkFBZ0IsS0FBS0E7QUFMaEIsS0FBUDtBQU9EOztBQUVEOzs7OztBQUtBc0UsV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUt0RSxDQUFMLENBQU9FLElBQVAsR0FBY29FLEtBQUtwRSxJQUFuQjtBQUNBLFNBQUtGLENBQUwsQ0FBT0osR0FBUCxHQUFhMEUsS0FBSzFFLEdBQWxCO0FBQ0EsU0FBS0ksQ0FBTCxDQUFPQyxLQUFQLEdBQWVxRSxLQUFLckUsS0FBcEI7QUFDQSxTQUFLSCxhQUFMLEdBQXFCd0UsS0FBS3hFLGFBQTFCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQnVFLEtBQUt2RSxjQUEzQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQTFWdUI7a0JBQUxMLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZnMvZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZnMvZ2V0LXBhdGgnXG5pbXBvcnQgeyBfLCBjcmVhdGVMb2dnZXIgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlLCBta2RpcnAsIG9wZW5GaWxlLCB0bXBGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgeyBidWZmZXIsIGNyZWF0ZUJ1bmRsZSwgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJy4uL3N0cmVhbXMnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkN0eCA9IHt9XG5jb25zdCBwbHVnaW5Db25maWcgPSB7fVxuXG4vKipcbiAqIExvYWRzIGEgcGx1Z2luLCBtYW5hZ2VzIGl0cyBlbnYuXG4gKi9cbmNvbnN0IGxvYWRQbHVnaW4gPSAocGx1Z2luLCBhcmdzKSA9PiB7XG4gIGxldCBtb2QgPSByZXF1aXJlKHBsdWdpbilcbiAgXG4gIC8vIGV4cG9zZSBtb2R1bGUgY29uZmlnXG4gIHBsdWdpbkNvbmZpZ1twbHVnaW5dID0gbW9kLmNvbmZpZyB8fCB7fVxuXG4gIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgaWYgKG1vZC5fX2VzTW9kdWxlID09PSB0cnVlKSB7XG4gICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgfVxuXG4gIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gIGNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke3BhdGguYmFzZW5hbWUocGx1Z2luKS5zdWJzdHIoNSl9YClcblxuICAvLyBjcmVhdGUgYSBuZXcgY29udGV4dCBmb3IgdGhpcyBwbHVnaW5cbiAgcGx1Z2luQ3R4W3BsdWdpbl0gPSB7XG4gICAgYXJncyxcbiAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgZGVidWc6IGxvZ2dlci5kZWJ1ZyxcbiAgICBlcnJvcjogbG9nZ2VyLmVycm9yXG4gIH1cblxuICAvLyBhZGQgcGx1Z2lucyB0byBsb2FkZWQgcGx1Z2luc1xuICBwbHVnaW5zW3BsdWdpbl0gPSBtb2Rcbn1cblxuLyoqXG4gKiBUZXN0IGZvciB1bmRlZmluZWQgb3IgbnVsbC5cbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGxcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgdGhpcy5uZWVkc0J1bmRsaW5nID0gZmFsc2VcbiAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0gZmFsc2VcblxuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUsIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBidW5kbGluZy5cbiAgICovXG4gIGFzeW5jIHN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBtb2RpZmllZCwgZGVzdCwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgZGVidWcoJ1N3aXRjaGVkIHRvIGJ1bmRsaW5nIG1vZGUnKVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc291cmNlbWFwIGZyb20gY2FjaGUuXG4gICAgICovXG4gICAgY29uc3Qgc291cmNlbWFwID0gY2FjaGUuc291cmNlbWFwKG5hbWUpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZnVsbCBsaXN0IG9mIGN1cnJlbnQgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHRydWUpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbGlzdCBvZiB1bm1vZGlmaWVkLlxuICAgICAqL1xuICAgIGxldCBmcmVzaEJ1aWxkID0gdHJ1ZVxuICAgIGNvbnN0IHVubW9kaWZpZWQgPSB7fVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKG1vZGlmaWVkLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgIHVubW9kaWZpZWRbZmlsZV0gPSB0cnVlXG4gICAgICAgIGZyZXNoQnVpbGQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvbGQgYnVuZGxlICYgY3JlYXRlIG5ldyBvbmUuXG4gICAgICovXG4gICAgY29uc3Qgb3JpZ2luYWxGZCA9IGZyZXNoQnVpbGQgPyBudWxsIDogYXdhaXQgb3BlbkZpbGUoZGVzdCwgJ3InKVxuICAgICAgICAsIFt0bXBCdW5kbGUsIHRtcEJ1bmRsZVBhdGhdID0gYXdhaXQgdG1wRmlsZSgpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBidW5kbGUgdG8gZm9yd2FyZCB0by5cbiAgICAgKi9cbiAgICBjb25zdCBidW5kbGUgPSBjcmVhdGVCdW5kbGUodG1wQnVuZGxlKVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgYnVuZGxpbmcgc3RhcnRzIHN0cmVhbWluZyByaWdodCBhd2F5LCB3ZSBjYW4gY291bnQgdGhpc1xuICAgICAqIGFzIHRoZSBzdGFydCBvZiB0aGUgYnVpbGQuXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgZmlsZXMuXG4gICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGV0IHN0cmVhbVxuXG4gICAgICBpZiAodW5tb2RpZmllZFtmaWxlXSkge1xuICAgICAgICBkZWJ1ZygnZm9yd2FyZDogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG51bGwsIHtcbiAgICAgICAgICBmZDogb3JpZ2luYWxGZCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0OiBzb3VyY2VtYXBbZmlsZV0uc3RhcnQsXG4gICAgICAgICAgZW5kOiBzb3VyY2VtYXBbZmlsZV0uZW5kXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndHJhbnNmb3JtOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IHB1bXAoW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgICAgIF0uY29uY2F0KHRoaXMuYnVpbGRTdGFjaygpKSlcbiAgICAgIH1cblxuICAgICAgYnVuZGxlLmFkZChmaWxlLCBzdHJlYW0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2FpdCBmb3IgYnVuZGxpbmcgdG8gZW5kLlxuICAgICAqL1xuICAgIGF3YWl0IGJ1bmRsZS5lbmQodG1wQnVuZGxlUGF0aClcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdGhlIGJ1bmRsZSB0byB0aGUgbmV3IGxvY2F0aW9uLlxuICAgICAqL1xuICAgIGlmIChvcmlnaW5hbEZkKSBvcmlnaW5hbEZkLmNsb3NlKClcbiAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGRlc3QpLnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRtcEJ1bmRsZVBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCkpXG5cbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNvdXJjZW1hcC5cbiAgICAgKi9cbiAgICBjYWNoZS5zb3VyY2VtYXAobmFtZSwgYnVuZGxlLm1hcClcblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYWxsIHBsdWdpbnMgaW4gdGhlIHN0YWNrIGludG8gc3RyZWFtcy5cbiAgICovXG4gIGJ1aWxkU3RhY2sgKCkge1xuICAgIGxldCBtb2RlID0gJ3N0cmVhbSdcblxuICAgIHJldHVybiB0aGlzLmQuc3RhY2subWFwKChbcGx1Z2luXSkgPT4ge1xuICAgICAgY29uc3QgcGx1Z2luU3RyZWFtID0gbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgICAgKVxuICAgICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBuZXh0KGVycikpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIG5leHQoZXJyKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuYWJsZSBidWZmZXIgbW9kZSBpZiByZXF1aXJlZC5cbiAgICAgICAqL1xuICAgICAgaWYgKG1vZGUgPT09ICdzdHJlYW0nICYmIHBsdWdpbkNvbmZpZ1twbHVnaW5dLm1vZGUgPT09ICdidWZmZXInKSB7XG4gICAgICAgIG1vZGUgPSAnYnVmZmVyJ1xuICAgICAgICByZXR1cm4gcHVtcChidWZmZXIoKSwgcGx1Z2luU3RyZWFtKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE90aGVyd2lzZSBrZWVwIHB1bXBpbmcuXG4gICAgICAgKi9cbiAgICAgIHJldHVybiBwbHVnaW5TdHJlYW1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlLCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcblxuICAgIC8qKlxuICAgICAqIEZpZ3VyZSBvdXQgaWYgYnVuZGxpbmcgaXMgbmVlZGVkICYgbG9hZCBwbHVnaW5zLlxuICAgICAqL1xuICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLm5lZWRzQnVuZGxpbmcpIHx8IGlzVW5kZWZpbmVkKHRoaXMubmVlZHNSZWNhY2hpbmcpIHx8ICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCAmJiAhdGhpcy5sb2FkZWRQbHVnaW5zKSkge1xuICAgICAgdGhpcy5sb2FkZWRQbHVnaW5zID0gdHJ1ZVxuXG4gICAgICB0aGlzLmQuc3RhY2suZm9yRWFjaCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgaWYgKCFwbHVnaW5zLmhhc093blByb3BlcnR5KHBsdWdpbikpIHtcbiAgICAgICAgICBsb2FkUGx1Z2luKHBsdWdpbiwgYXJncylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0aW5nIGZvciByZWNhY2hpbmcnKVxuXG4gICAgICAgIHRoaXMubmVlZHNCdW5kbGluZyA9ICEhKHRoaXMubmVlZHNCdW5kbGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5idW5kbGUpXG4gICAgICAgIHRoaXMubmVlZHNSZWNhY2hpbmcgPSAhISh0aGlzLm5lZWRzUmVjYWNoaW5nIHx8IHBsdWdpbkNvbmZpZ1twbHVnaW5dLnJlY2FjaGUpXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHJlY2FjaGluZy5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5uZWVkc1JlY2FjaGluZykge1xuICAgICAgcmVjYWNoZSA9IHRydWVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGRlYnVnKCd0YXNrIHJlY2FjaGUgPSAlcycsIHJlY2FjaGUpXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlLCByZWNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcblxuICAgICAgLyoqXG4gICAgICAgKiBTd2l0Y2ggdG8gYnVuZGxpbmcgbW9kZSBpZiBuZWVkIGJlLlxuICAgICAgICovXG4gICAgICBpZiAodGhpcy5uZWVkc0J1bmRsaW5nKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBmaWxlcywgZGVzdCwgdXNlRG91YmxlQ2FjaGUpXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRW5zdXJlIGRpc3QgZGlyZWN0b3J5IGV4aXN0cy5cbiAgICAgICAqL1xuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgICAgIF1cbiAgICAgIH0pKVxuXG4gICAgICBpZiAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3RhY2sgPSB0aGlzLmJ1aWxkU3RhY2soKVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb25uZWN0IHBsdWdpbiBzdHJlYW1zIHdpdGggcGlwZWxpbmVzLlxuICAgICAgICAgKi9cbiAgICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtID0gZmlsZS5zdHJlYW0uY29uY2F0KHN0YWNrKVxuICAgICAgICAgIHJldHVybiBmaWxlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29ubmVjdCB3aXRoIGRlc3RpbmF0aW9uLlxuICAgICAgICovXG4gICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIC8vIHN0cmlwIG91dCB0aGUgYWN0dWFsIGJvZHkgYW5kIHdyaXRlIGl0XG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2gobWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCAhZGF0YS5oYXNPd25Qcm9wZXJ0eSgnYm9keScpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoJ0EgcGx1Z2luIGhhcyBkZXN0cm95ZWQgdGhlIHN0cmVhbSBieSByZXR1cm5pbmcgYSBub24tb2JqZWN0LicpKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQobnVsbCwgZGF0YS5ib2R5KVxuICAgICAgICB9KSlcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcblxuICAgICAgICAvLyBwcm9taXNpZnkgdGhlIGN1cnJlbnQgcGlwZWxpbmVcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAvLyBjb25uZWN0IGFsbCBzdHJlYW1zIHRvZ2V0aGVyIHRvIGZvcm0gcGlwZWxpbmVcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IHB1bXAoZmlsZS5zdHJlYW0sIGVyciA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHN0YXJ0ICYgd2FpdCBmb3IgYWxsIHBpcGVsaW5lcyB0byBlbmRcbiAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgbG9nKCdTdGFydGluZyB0YXNrJylcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLnZhbCgpKVxuICAgICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdTa2lwcGluZyB0YXNrJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2ssXG4gICAgICBuZWVkc0J1bmRsaW5nOiB0aGlzLm5lZWRzQnVuZGxpbmcsXG4gICAgICBuZWVkc1JlY2FjaGluZzogdGhpcy5uZWVkc1JlY2FjaGluZ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuICAgIHRoaXMubmVlZHNCdW5kbGluZyA9IGpzb24ubmVlZHNCdW5kbGluZ1xuICAgIHRoaXMubmVlZHNSZWNhY2hpbmcgPSBqc29uLm5lZWRzUmVjYWNoaW5nXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59Il19