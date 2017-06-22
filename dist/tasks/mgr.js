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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsImlzVW5kZWZpbmVkIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJBcnJheSIsIm5lZWRzQnVuZGxpbmciLCJuZWVkc1JlY2FjaGluZyIsImQiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJ3YXRjaCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJyZWNhY2hlIiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzdWIiLCJzcGxpdCIsInNlcCIsInJlc29sdmUiLCJwdXNoIiwic3RhcnQiLCJQcm9taXNlIiwicHJvY2VzcyIsIm9uIiwid2F0Y2hlciIsImNsb3NlIiwic3RhcnRCdW5kbGluZyIsIm1vZGlmaWVkIiwidXNlRG91YmxlQ2FjaGUiLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImNvbmNhdCIsImJ1aWxkU3RhY2siLCJhZGQiLCJkaXJuYW1lIiwicmVwbGFjZSIsInJlamVjdCIsInBpcGUiLCJjcmVhdGVXcml0ZVN0cmVhbSIsIm1hcCIsIm1vZGUiLCJwbHVnaW5TdHJlYW0iLCJkYXRhIiwibmV4dCIsInRoZW4iLCJuZXdEYXRhIiwiY2F0Y2giLCJlcnIiLCJsZW5ndGgiLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJFcnJvciIsImJvZHkiLCJhbGwiLCJ2YWwiLCJ0b0pTT04iLCJmcm9tSlNPTiIsImpzb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFmQTs7Ozs7O0FBaUJBLE1BQU1DLFdBQVcseUJBQWEsWUFBYixFQUEyQkMsR0FBNUM7O0FBRUE7OztBQUdBLE1BQU1DLFVBQVUsRUFBaEI7QUFDQSxNQUFNQyxZQUFZLEVBQWxCO0FBQ0EsTUFBTUMsZUFBZSxFQUFyQjs7QUFFQTs7O0FBR0EsTUFBTUMsYUFBYSxDQUFDQyxNQUFELEVBQVNDLElBQVQsS0FBa0I7QUFDbkMsTUFBSUMsTUFBTUMsUUFBUUgsTUFBUixDQUFWOztBQUVBO0FBQ0FGLGVBQWFFLE1BQWIsSUFBdUJFLElBQUlFLE1BQUosSUFBYyxFQUFyQzs7QUFFQTtBQUNBO0FBQ0EsTUFBSUYsSUFBSUcsVUFBSixLQUFtQixJQUF2QixFQUE2QjtBQUMzQkgsVUFBTUEsSUFBSUksT0FBVjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsU0FBUyx5QkFBYyxRQUFPLGVBQUtDLFFBQUwsQ0FBY1IsTUFBZCxFQUFzQlMsTUFBdEIsQ0FBNkIsQ0FBN0IsQ0FBZ0MsRUFBckQsQ0FBZjs7QUFFQTtBQUNBWixZQUFVRyxNQUFWLElBQW9CO0FBQ2xCQyxRQURrQjtBQUVsQk4sU0FBS1ksT0FBT1osR0FGTTtBQUdsQmUsV0FBT0gsT0FBT0csS0FISTtBQUlsQkMsV0FBT0osT0FBT0k7O0FBR2hCO0FBUG9CLEdBQXBCLENBUUFmLFFBQVFJLE1BQVIsSUFBa0JFLEdBQWxCO0FBQ0QsQ0F6QkQ7O0FBMkJBOzs7QUFHQSxTQUFTVSxXQUFULENBQXFCQyxLQUFyQixFQUE0QjtBQUMxQixTQUFPQSxVQUFVQyxTQUFWLElBQXVCRCxV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QUVEOzs7O0FBSUE2RixXQUFVO0FBQ1IsV0FBTztBQUNMakUsWUFBTSxLQUFLRixDQUFMLENBQU9FLElBRFI7QUFFTE4sV0FBSyxLQUFLSSxDQUFMLENBQU9KLEdBRlA7QUFHTEssYUFBTyxLQUFLRCxDQUFMLENBQU9DLEtBSFQ7QUFJTEgscUJBQWUsS0FBS0EsYUFKZjtBQUtMQyxzQkFBZ0IsS0FBS0E7QUFMaEIsS0FBUDtBQU9EOztBQUVEOzs7OztBQUtBcUUsV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUtyRSxDQUFMLENBQU9FLElBQVAsR0FBY21FLEtBQUtuRSxJQUFuQjtBQUNBLFNBQUtGLENBQUwsQ0FBT0osR0FBUCxHQUFheUUsS0FBS3pFLEdBQWxCO0FBQ0EsU0FBS0ksQ0FBTCxDQUFPQyxLQUFQLEdBQWVvRSxLQUFLcEUsS0FBcEI7QUFDQSxTQUFLSCxhQUFMLEdBQXFCdUUsS0FBS3ZFLGFBQTFCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQnNFLEtBQUt0RSxjQUEzQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQXhWdUI7a0JBQUxMLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZnMvZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZnMvZ2V0LXBhdGgnXG5pbXBvcnQgeyBfLCBjcmVhdGVMb2dnZXIgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlLCBta2RpcnAsIG9wZW5GaWxlLCB0bXBGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgeyBidWZmZXIsIGNyZWF0ZUJ1bmRsZSwgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJy4uL3N0cmVhbXMnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkN0eCA9IHt9XG5jb25zdCBwbHVnaW5Db25maWcgPSB7fVxuXG4vKipcbiAqIExvYWRzIGEgcGx1Z2luLCBtYW5hZ2VzIGl0cyBlbnYuXG4gKi9cbmNvbnN0IGxvYWRQbHVnaW4gPSAocGx1Z2luLCBhcmdzKSA9PiB7XG4gIGxldCBtb2QgPSByZXF1aXJlKHBsdWdpbilcbiAgXG4gIC8vIGV4cG9zZSBtb2R1bGUgY29uZmlnXG4gIHBsdWdpbkNvbmZpZ1twbHVnaW5dID0gbW9kLmNvbmZpZyB8fCB7fVxuXG4gIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgaWYgKG1vZC5fX2VzTW9kdWxlID09PSB0cnVlKSB7XG4gICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgfVxuXG4gIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gIGNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke3BhdGguYmFzZW5hbWUocGx1Z2luKS5zdWJzdHIoNSl9YClcblxuICAvLyBjcmVhdGUgYSBuZXcgY29udGV4dCBmb3IgdGhpcyBwbHVnaW5cbiAgcGx1Z2luQ3R4W3BsdWdpbl0gPSB7XG4gICAgYXJncyxcbiAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgZGVidWc6IGxvZ2dlci5kZWJ1ZyxcbiAgICBlcnJvcjogbG9nZ2VyLmVycm9yXG4gIH1cblxuICAvLyBhZGQgcGx1Z2lucyB0byBsb2FkZWQgcGx1Z2luc1xuICBwbHVnaW5zW3BsdWdpbl0gPSBtb2Rcbn1cblxuLyoqXG4gKiBUZXN0IGZvciB1bmRlZmluZWQgb3IgbnVsbC5cbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGxcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgdGhpcy5uZWVkc0J1bmRsaW5nID0gZmFsc2VcbiAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0gZmFsc2VcblxuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUsIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBidW5kbGluZy5cbiAgICovXG4gIGFzeW5jIHN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBtb2RpZmllZCwgZGVzdCwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgZGVidWcoJ1N3aXRjaGVkIHRvIGJ1bmRsaW5nIG1vZGUnKVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc291cmNlbWFwIGZyb20gY2FjaGUuXG4gICAgICovXG4gICAgY29uc3Qgc291cmNlbWFwID0gY2FjaGUuc291cmNlbWFwKG5hbWUpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZnVsbCBsaXN0IG9mIGN1cnJlbnQgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHRydWUpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbGlzdCBvZiB1bm1vZGlmaWVkLlxuICAgICAqL1xuICAgIGxldCBmcmVzaEJ1aWxkID0gdHJ1ZVxuICAgIGNvbnN0IHVubW9kaWZpZWQgPSB7fVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKG1vZGlmaWVkLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgIHVubW9kaWZpZWRbZmlsZV0gPSB0cnVlXG4gICAgICAgIGZyZXNoQnVpbGQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvbGQgYnVuZGxlICYgY3JlYXRlIG5ldyBvbmUuXG4gICAgICovXG4gICAgY29uc3Qgb3JpZ2luYWxGZCA9IGZyZXNoQnVpbGQgPyBudWxsIDogYXdhaXQgb3BlbkZpbGUoZGVzdCwgJ3InKVxuICAgICAgICAsIFt0bXBCdW5kbGUsIHRtcEJ1bmRsZVBhdGhdID0gYXdhaXQgdG1wRmlsZSgpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBidW5kbGUgdG8gZm9yd2FyZCB0by5cbiAgICAgKi9cbiAgICBjb25zdCBidW5kbGUgPSBjcmVhdGVCdW5kbGUodG1wQnVuZGxlKVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgYnVuZGxpbmcgc3RhcnRzIHN0cmVhbWluZyByaWdodCBhd2F5LCB3ZSBjYW4gY291bnQgdGhpc1xuICAgICAqIGFzIHRoZSBzdGFydCBvZiB0aGUgYnVpbGQuXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgZmlsZXMuXG4gICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGV0IHN0cmVhbVxuXG4gICAgICBpZiAodW5tb2RpZmllZFtmaWxlXSkge1xuICAgICAgICBkZWJ1ZygnZm9yd2FyZDogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG51bGwsIHtcbiAgICAgICAgICBmZDogb3JpZ2luYWxGZCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0OiBzb3VyY2VtYXBbZmlsZV0uc3RhcnQsXG4gICAgICAgICAgZW5kOiBzb3VyY2VtYXBbZmlsZV0uZW5kXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndHJhbnNmb3JtOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IHB1bXAoW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgICAgIF0uY29uY2F0KHRoaXMuYnVpbGRTdGFjaygpKSlcbiAgICAgIH1cblxuICAgICAgYnVuZGxlLmFkZChmaWxlLCBzdHJlYW0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2FpdCBmb3IgYnVuZGxpbmcgdG8gZW5kLlxuICAgICAqL1xuICAgIGF3YWl0IGJ1bmRsZS5lbmQodG1wQnVuZGxlUGF0aClcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdGhlIGJ1bmRsZSB0byB0aGUgbmV3IGxvY2F0aW9uLlxuICAgICAqL1xuICAgIGlmIChvcmlnaW5hbEZkKSBvcmlnaW5hbEZkLmNsb3NlKClcbiAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGRlc3QpLnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRtcEJ1bmRsZVBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCkpXG5cbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNvdXJjZW1hcC5cbiAgICAgKi9cbiAgICBjYWNoZS5zb3VyY2VtYXAobmFtZSwgYnVuZGxlLm1hcClcblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYWxsIHBsdWdpbnMgaW4gdGhlIHN0YWNrIGludG8gc3RyZWFtcy5cbiAgICovXG4gIGJ1aWxkU3RhY2sgKCkge1xuICAgIGxldCBtb2RlID0gJ3N0cmVhbSdcblxuICAgIHJldHVybiB0aGlzLmQuc3RhY2subWFwKChbcGx1Z2luXSkgPT4ge1xuICAgICAgY29uc3QgcGx1Z2luU3RyZWFtID0gbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgICAgKVxuICAgICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBuZXh0KGVycikpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIG5leHQoZXJyKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuYWJsZSBidWZmZXIgbW9kZSBpZiByZXF1aXJlZC5cbiAgICAgICAqL1xuICAgICAgaWYgKG1vZGUgPT09ICdzdHJlYW0nICYmIHBsdWdpbkNvbmZpZ1twbHVnaW5dLm1vZGUgPT09ICdidWZmZXInKSB7XG4gICAgICAgIG1vZGUgPSAnYnVmZmVyJ1xuICAgICAgICByZXR1cm4gcHVtcChidWZmZXIoKSwgcGx1Z2luU3RyZWFtKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE90aGVyd2lzZSBrZWVwIHB1bXBpbmcuXG4gICAgICAgKi9cbiAgICAgIHJldHVybiBwbHVnaW5TdHJlYW1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlLCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcblxuICAgIC8qKlxuICAgICAqIEZpZ3VyZSBvdXQgaWYgYnVuZGxpbmcgaXMgbmVlZGVkICYgbG9hZCBwbHVnaW5zLlxuICAgICAqL1xuICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLm5lZWRzQnVuZGxpbmcpIHx8IGlzVW5kZWZpbmVkKHRoaXMubmVlZHNSZWNhY2hpbmcpIHx8ICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCAmJiAhdGhpcy5sb2FkZWRQbHVnaW5zKSkge1xuICAgICAgdGhpcy5sb2FkZWRQbHVnaW5zID0gdHJ1ZVxuXG4gICAgICB0aGlzLmQuc3RhY2suZm9yRWFjaCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgaWYgKCFwbHVnaW5zLmhhc093blByb3BlcnR5KHBsdWdpbikpIHtcbiAgICAgICAgICBsb2FkUGx1Z2luKHBsdWdpbiwgYXJncylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmVlZHNCdW5kbGluZyA9ICEhKHRoaXMubmVlZHNCdW5kbGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5idW5kbGUpXG4gICAgICAgIHRoaXMubmVlZHNSZWNhY2hpbmcgPSAhISh0aGlzLm5lZWRzUmVjYWNoaW5nIHx8IHBsdWdpbkNvbmZpZ1twbHVnaW5dLnJlY2FjaGUpXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHJlY2FjaGluZy5cbiAgICAgKi9cbiAgICBpZiAodGhpcy5uZWVkc1JlY2FjaGluZykge1xuICAgICAgcmVjYWNoZSA9IHRydWVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGRlYnVnKCd0YXNrIHJlY2FjaGUgPSAlcycsIHJlY2FjaGUpXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlLCByZWNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcblxuICAgICAgLyoqXG4gICAgICAgKiBTd2l0Y2ggdG8gYnVuZGxpbmcgbW9kZSBpZiBuZWVkIGJlLlxuICAgICAgICovXG4gICAgICBpZiAodGhpcy5uZWVkc0J1bmRsaW5nKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBmaWxlcywgZGVzdCwgdXNlRG91YmxlQ2FjaGUpXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRW5zdXJlIGRpc3QgZGlyZWN0b3J5IGV4aXN0cy5cbiAgICAgICAqL1xuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgICAgIF1cbiAgICAgIH0pKVxuXG4gICAgICBpZiAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3RhY2sgPSB0aGlzLmJ1aWxkU3RhY2soKVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb25uZWN0IHBsdWdpbiBzdHJlYW1zIHdpdGggcGlwZWxpbmVzLlxuICAgICAgICAgKi9cbiAgICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtID0gZmlsZS5zdHJlYW0uY29uY2F0KHN0YWNrKVxuICAgICAgICAgIHJldHVybiBmaWxlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29ubmVjdCB3aXRoIGRlc3RpbmF0aW9uLlxuICAgICAgICovXG4gICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIC8vIHN0cmlwIG91dCB0aGUgYWN0dWFsIGJvZHkgYW5kIHdyaXRlIGl0XG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2gobWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCAhZGF0YS5oYXNPd25Qcm9wZXJ0eSgnYm9keScpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoJ0EgcGx1Z2luIGhhcyBkZXN0cm95ZWQgdGhlIHN0cmVhbSBieSByZXR1cm5pbmcgYSBub24tb2JqZWN0LicpKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQobnVsbCwgZGF0YS5ib2R5KVxuICAgICAgICB9KSlcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcblxuICAgICAgICAvLyBwcm9taXNpZnkgdGhlIGN1cnJlbnQgcGlwZWxpbmVcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAvLyBjb25uZWN0IGFsbCBzdHJlYW1zIHRvZ2V0aGVyIHRvIGZvcm0gcGlwZWxpbmVcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IHB1bXAoZmlsZS5zdHJlYW0sIGVyciA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHN0YXJ0ICYgd2FpdCBmb3IgYWxsIHBpcGVsaW5lcyB0byBlbmRcbiAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgbG9nKCdTdGFydGluZyB0YXNrJylcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLnZhbCgpKVxuICAgICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdTa2lwcGluZyB0YXNrJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2ssXG4gICAgICBuZWVkc0J1bmRsaW5nOiB0aGlzLm5lZWRzQnVuZGxpbmcsXG4gICAgICBuZWVkc1JlY2FjaGluZzogdGhpcy5uZWVkc1JlY2FjaGluZ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuICAgIHRoaXMubmVlZHNCdW5kbGluZyA9IGpzb24ubmVlZHNCdW5kbGluZ1xuICAgIHRoaXMubmVlZHNSZWNhY2hpbmcgPSBqc29uLm5lZWRzUmVjYWNoaW5nXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG4iXX0=