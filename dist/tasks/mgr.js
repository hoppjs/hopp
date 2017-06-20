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
        plugins[plugin](pluginCtx[plugin], data).then(newData => next(null, newData)).catch(err => next(err));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJjb25zdHJ1Y3RvciIsInNyYyIsIkFycmF5IiwiZCIsInN0YWNrIiwiZGVzdCIsIm91dCIsIndhdGNoIiwibmFtZSIsImRpcmVjdG9yeSIsInJlY2FjaGUiLCJ3YXRjaGVycyIsImZvckVhY2giLCJyZWN1cnNpdmUiLCJpbmRleE9mIiwibmV3cGF0aCIsInN1YiIsInNwbGl0Iiwic2VwIiwicmVzb2x2ZSIsInB1c2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJzdGFydEJ1bmRsaW5nIiwibW9kaWZpZWQiLCJ1c2VEb3VibGVDYWNoZSIsInNvdXJjZW1hcCIsImZpbGVzIiwiZnJlc2hCdWlsZCIsInVubW9kaWZpZWQiLCJmaWxlIiwib3JpZ2luYWxGZCIsInRtcEJ1bmRsZSIsInRtcEJ1bmRsZVBhdGgiLCJidW5kbGUiLCJEYXRlIiwibm93Iiwic3RyZWFtIiwiY3JlYXRlUmVhZFN0cmVhbSIsImZkIiwiYXV0b0Nsb3NlIiwiZW5kIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsImxlbmd0aCIsIm5lZWRzQnVuZGxpbmciLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJv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LE9BYkQ7O0FBZUE7QUFDQSxZQUFNRSxRQUFRa0IsS0FBS0MsR0FBTCxFQUFkO0FBQ0ExRCxVQUFJLGVBQUo7QUFDQSxZQUFNd0MsUUFBUThDLEdBQVIsQ0FBWXJDLE1BQU1zQyxHQUFOLEVBQVosQ0FBTjtBQUNBdkYsVUFBSSx5QkFBSixFQUErQnlELEtBQUtDLEdBQUwsS0FBYW5CLEtBQTVDO0FBQ0QsS0FwRkQsTUFvRk87QUFDTHZDLFVBQUksZUFBSjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7QUFJQXdGLFdBQVU7QUFDUixXQUFPO0FBQ0xqRSxZQUFNLEtBQUtGLENBQUwsQ0FBT0UsSUFEUjtBQUVMSixXQUFLLEtBQUtFLENBQUwsQ0FBT0YsR0FGUDtBQUdMRyxhQUFPLEtBQUtELENBQUwsQ0FBT0M7QUFIVCxLQUFQO0FBS0Q7O0FBRUQ7Ozs7O0FBS0FtRSxXQUFVQyxJQUFWLEVBQWdCO0FBQ2QsU0FBS3JFLENBQUwsQ0FBT0UsSUFBUCxHQUFjbUUsS0FBS25FLElBQW5CO0FBQ0EsU0FBS0YsQ0FBTCxDQUFPRixHQUFQLEdBQWF1RSxLQUFLdkUsR0FBbEI7QUFDQSxTQUFLRSxDQUFMLENBQU9DLEtBQVAsR0FBZW9FLEtBQUtwRSxLQUFwQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQW5VdUI7a0JBQUxMLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZnMvZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZnMvZ2V0LXBhdGgnXG5pbXBvcnQgeyBfLCBjcmVhdGVMb2dnZXIgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlLCBta2RpcnAsIG9wZW5GaWxlLCB0bXBGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgeyBidWZmZXIsIGNyZWF0ZUJ1bmRsZSwgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJy4uL3N0cmVhbXMnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkN0eCA9IHt9XG5jb25zdCBwbHVnaW5Db25maWcgPSB7fVxuXG4vKipcbiAqIExvYWRzIGEgcGx1Z2luLCBtYW5hZ2VzIGl0cyBlbnYuXG4gKi9cbmNvbnN0IGxvYWRQbHVnaW4gPSAocGx1Z2luLCBhcmdzKSA9PiB7XG4gIGxldCBtb2QgPSByZXF1aXJlKHBsdWdpbilcbiAgXG4gIC8vIGV4cG9zZSBtb2R1bGUgY29uZmlnXG4gIHBsdWdpbkNvbmZpZ1twbHVnaW5dID0gbW9kLmNvbmZpZyB8fCB7fVxuXG4gIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgaWYgKG1vZC5fX2VzTW9kdWxlID09PSB0cnVlKSB7XG4gICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgfVxuXG4gIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gIGNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke3BhdGguYmFzZW5hbWUocGx1Z2luKS5zdWJzdHIoNSl9YClcblxuICAvLyBjcmVhdGUgYSBuZXcgY29udGV4dCBmb3IgdGhpcyBwbHVnaW5cbiAgcGx1Z2luQ3R4W3BsdWdpbl0gPSB7XG4gICAgYXJncyxcbiAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgZGVidWc6IGxvZ2dlci5kZWJ1ZyxcbiAgICBlcnJvcjogbG9nZ2VyLmVycm9yXG4gIH1cblxuICAvLyByZXR1cm4gbG9hZGVkIHBsdWdpblxuICByZXR1cm4gbW9kXG59XG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgaWYgKCEoc3JjIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBzcmMgPSBbc3JjXVxuICAgIH1cblxuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUsIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBidW5kbGluZy5cbiAgICovXG4gIGFzeW5jIHN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBtb2RpZmllZCwgZGVzdCwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgZGVidWcoJ1N3aXRjaGVkIHRvIGJ1bmRsaW5nIG1vZGUnKVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc291cmNlbWFwIGZyb20gY2FjaGUuXG4gICAgICovXG4gICAgY29uc3Qgc291cmNlbWFwID0gY2FjaGUuc291cmNlbWFwKG5hbWUpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZnVsbCBsaXN0IG9mIGN1cnJlbnQgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHRydWUpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbGlzdCBvZiB1bm1vZGlmaWVkLlxuICAgICAqL1xuICAgIGxldCBmcmVzaEJ1aWxkID0gdHJ1ZVxuICAgIGNvbnN0IHVubW9kaWZpZWQgPSB7fVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKG1vZGlmaWVkLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgIHVubW9kaWZpZWRbZmlsZV0gPSB0cnVlXG4gICAgICAgIGZyZXNoQnVpbGQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvbGQgYnVuZGxlICYgY3JlYXRlIG5ldyBvbmUuXG4gICAgICovXG4gICAgY29uc3Qgb3JpZ2luYWxGZCA9IGZyZXNoQnVpbGQgPyBudWxsIDogYXdhaXQgb3BlbkZpbGUoZGVzdCwgJ3InKVxuICAgICAgICAsIFt0bXBCdW5kbGUsIHRtcEJ1bmRsZVBhdGhdID0gYXdhaXQgdG1wRmlsZSgpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBidW5kbGUgdG8gZm9yd2FyZCB0by5cbiAgICAgKi9cbiAgICBjb25zdCBidW5kbGUgPSBjcmVhdGVCdW5kbGUodG1wQnVuZGxlKVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgYnVuZGxpbmcgc3RhcnRzIHN0cmVhbWluZyByaWdodCBhd2F5LCB3ZSBjYW4gY291bnQgdGhpc1xuICAgICAqIGFzIHRoZSBzdGFydCBvZiB0aGUgYnVpbGQuXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgZmlsZXMuXG4gICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGV0IHN0cmVhbVxuXG4gICAgICBpZiAodW5tb2RpZmllZFtmaWxlXSkge1xuICAgICAgICBkZWJ1ZygnZm9yd2FyZDogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG51bGwsIHtcbiAgICAgICAgICBmZDogb3JpZ2luYWxGZCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0OiBzb3VyY2VtYXBbZmlsZV0uc3RhcnQsXG4gICAgICAgICAgZW5kOiBzb3VyY2VtYXBbZmlsZV0uZW5kXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndHJhbnNmb3JtOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IHB1bXAoW2NyZWF0ZVJlYWRTdHJlYW0oZmlsZSldLmNvbmNhdCh0aGlzLmJ1aWxkU3RhY2soKSkpXG4gICAgICB9XG5cbiAgICAgIGJ1bmRsZS5hZGQoZmlsZSwgc3RyZWFtKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhaXQgZm9yIGJ1bmRsaW5nIHRvIGVuZC5cbiAgICAgKi9cbiAgICBhd2FpdCBidW5kbGUuZW5kKHRtcEJ1bmRsZVBhdGgpXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRoZSBidW5kbGUgdG8gdGhlIG5ldyBsb2NhdGlvbi5cbiAgICAgKi9cbiAgICBpZiAob3JpZ2luYWxGZCkgb3JpZ2luYWxGZC5jbG9zZSgpXG4gICAgYXdhaXQgbWtkaXJwKHBhdGguZGlybmFtZShkZXN0KS5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0bXBCdW5kbGVQYXRoKS5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QpKVxuXG4gICAgICBzdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgIHN0cmVhbS5vbignZXJyb3InLCByZWplY3QpXG4gICAgfSlcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBzb3VyY2VtYXAuXG4gICAgICovXG4gICAgY2FjaGUuc291cmNlbWFwKG5hbWUsIGJ1bmRsZS5tYXApXG5cbiAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGFsbCBwbHVnaW5zIGluIHRoZSBzdGFjayBpbnRvIHN0cmVhbXMuXG4gICAqL1xuICBidWlsZFN0YWNrICgpIHtcbiAgICBsZXQgbW9kZSA9ICdzdHJlYW0nXG5cbiAgICByZXR1cm4gdGhpcy5kLnN0YWNrLm1hcCgoW3BsdWdpbl0pID0+IHtcbiAgICAgIGNvbnN0IHBsdWdpblN0cmVhbSA9IG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICBwbHVnaW5zW3BsdWdpbl0oXG4gICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgZGF0YVxuICAgICAgICApXG4gICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgIC5jYXRjaChlcnIgPT4gbmV4dChlcnIpKVxuICAgICAgfSlcblxuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGUgYnVmZmVyIG1vZGUgaWYgcmVxdWlyZWQuXG4gICAgICAgKi9cbiAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBwbHVnaW5Db25maWdbcGx1Z2luXS5tb2RlID09PSAnYnVmZmVyJykge1xuICAgICAgICBtb2RlID0gJ2J1ZmZlcidcbiAgICAgICAgcmV0dXJuIHB1bXAoYnVmZmVyKCksIHBsdWdpblN0cmVhbSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBPdGhlcndpc2Uga2VlcCBwdW1waW5nLlxuICAgICAgICovXG4gICAgICByZXR1cm4gcGx1Z2luU3RyZWFtXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGRlYnVnKCd0YXNrIHJlY2FjaGUgPSAlcycsIHJlY2FjaGUpXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlLCByZWNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcblxuICAgICAgLyoqXG4gICAgICAgKiBCdW5kbGluZyB0YW5nZWFudC5cbiAgICAgICAqL1xuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBuZWVkc0J1bmRsaW5nID0gZmFsc2VcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJ5IHRvIGxvYWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIGlmICghdGhpcy5sb2FkZWRQbHVnaW5zKSB7XG4gICAgICAgICAgdGhpcy5sb2FkZWRQbHVnaW5zID0gdHJ1ZVxuXG4gICAgICAgICAgdGhpcy5kLnN0YWNrLmZvckVhY2goKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0gPSBsb2FkUGx1Z2luKHBsdWdpbiwgYXJncylcbiAgICAgICAgICAgICAgbmVlZHNCdW5kbGluZyA9IG5lZWRzQnVuZGxpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0uYnVuZGxlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTd2l0Y2ggdG8gYnVuZGxpbmcgbW9kZSBpZiBuZWVkIGJlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG5lZWRzQnVuZGxpbmcpIHtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgZmlsZXMsIGRlc3QsIHVzZURvdWJsZUNhY2hlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRW5zdXJlIGRpc3QgZGlyZWN0b3J5IGV4aXN0cy5cbiAgICAgICAqL1xuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdClcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdGFjayA9IHRoaXMuYnVpbGRTdGFjaygpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbm5lY3QgcGx1Z2luIHN0cmVhbXMgd2l0aCBwaXBlbGluZXMuXG4gICAgICAgICAqL1xuICAgICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBmaWxlLnN0cmVhbS5jb25jYXQoc3RhY2spXG4gICAgICAgICAgcmV0dXJuIGZpbGVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgLy8gc3RyaXAgb3V0IHRoZSBhY3R1YWwgYm9keSBhbmQgd3JpdGUgaXRcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IG5leHQobnVsbCwgZGF0YS5ib2R5KSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgIGZpbGUuc3RyZWFtID0gcHVtcChmaWxlLnN0cmVhbSlcblxuICAgICAgICAvLyBwcm9taXNpZnkgdGhlIGN1cnJlbnQgcGlwZWxpbmVcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHN0YXJ0ICYgd2FpdCBmb3IgYWxsIHBpcGVsaW5lcyB0byBlbmRcbiAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgbG9nKCdTdGFydGluZyB0YXNrJylcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLnZhbCgpKVxuICAgICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdTa2lwcGluZyB0YXNrJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=