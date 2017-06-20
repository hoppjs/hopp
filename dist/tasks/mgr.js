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
          if (mode === 'stream' && pluginConfig[plugin].mode === 'buffer') {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJjb25zdHJ1Y3RvciIsInNyYyIsIkFycmF5IiwiZCIsInN0YWNrIiwiZGVzdCIsIm91dCIsIndhdGNoIiwibmFtZSIsImRpcmVjdG9yeSIsInJlY2FjaGUiLCJ3YXRjaGVycyIsImZvckVhY2giLCJyZWN1cnNpdmUiLCJpbmRleE9mIiwibmV3cGF0aCIsInN1YiIsInNwbGl0Iiwic2VwIiwicmVzb2x2ZSIsInB1c2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJ1c2VEb3VibGVDYWNoZSIsImZpbGVzIiwibGVuZ3RoIiwicmVwbGFjZSIsIm1hcCIsImZpbGUiLCJzdHJlYW0iLCJoYXNPd25Qcm9wZXJ0eSIsIm1vZGUiLCJwbHVnaW5TdHJlYW0iLCJkYXRhIiwibmV4dCIsInRoZW4iLCJuZXdEYXRhIiwiY2F0Y2giLCJlcnIiLCJ2YWwiLCJjb25jYXQiLCJib2R5IiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJyZWplY3QiLCJEYXRlIiwibm93IiwiYWxsIiwidG9KU09OIiwiZnJvbUpTT04iLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBZkE7Ozs7OztBQWlCQSxNQUFNQyxXQUFXLHlCQUFhLFlBQWIsRUFBMkJDLEdBQTVDOztBQUVBOzs7QUFHQSxNQUFN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Ii8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBnbG9iIGZyb20gJy4uL2ZzL2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBtYXBTdHJlYW0gZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4uL2ZzL2dldC1wYXRoJ1xuaW1wb3J0IHsgXywgY3JlYXRlTG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMnXG5pbXBvcnQgeyBkaXNhYmxlRlNDYWNoZSwgbWtkaXJwIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgeyBidWZmZXIsIGNyZWF0ZVJlYWRTdHJlYW0gfSBmcm9tICcuLi9zdHJlYW1zJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIFBsdWdpbnMgc3RvcmFnZS5cbiAqL1xuY29uc3QgcGx1Z2lucyA9IHt9XG5jb25zdCBwbHVnaW5DdHggPSB7fVxuY29uc3QgcGx1Z2luQ29uZmlnID0ge31cblxuLyoqXG4gKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICovXG5jb25zdCBsb2FkUGx1Z2luID0gKHBsdWdpbiwgYXJncykgPT4ge1xuICBsZXQgbW9kID0gcmVxdWlyZShwbHVnaW4pXG4gIFxuICAvLyBleHBvc2UgbW9kdWxlIGNvbmZpZ1xuICBwbHVnaW5Db25maWdbcGx1Z2luXSA9IG1vZC5jb25maWcgfHwge31cblxuICAvLyBpZiBkZWZpbmVkIGFzIGFuIEVTMjAxNSBtb2R1bGUsIGFzc3VtZSB0aGF0IHRoZVxuICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgIG1vZCA9IG1vZC5kZWZhdWx0XG4gIH1cblxuICAvLyBjcmVhdGUgcGx1Z2luIGxvZ2dlclxuICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gIHBsdWdpbkN0eFtwbHVnaW5dID0ge1xuICAgIGFyZ3MsXG4gICAgbG9nOiBsb2dnZXIuZGVidWcsXG4gICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICB9XG5cbiAgLy8gcmV0dXJuIGxvYWRlZCBwbHVnaW5cbiAgcmV0dXJuIG1vZFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgd2F0Y2ggc2hvdWxkIGJlIHJlY3Vyc2l2ZVxuICAgICAgY29uc3QgcmVjdXJzaXZlID0gc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcblxuICAgICAgLy8gZ2V0IG1vc3QgZGVmaW5pdGl2ZSBwYXRoIHBvc3NpYmxlXG4gICAgICBsZXQgbmV3cGF0aCA9ICcnXG4gICAgICBmb3IgKGxldCBzdWIgb2Ygc3JjLnNwbGl0KCcvJykpIHtcbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIGlmIChzdWIuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdwYXRoICs9IHBhdGguc2VwICsgc3ViXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld3BhdGggPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBuZXdwYXRoLnN1YnN0cigxKSlcblxuICAgICAgLy8gZGlzYWJsZSBmcyBjYWNoaW5nIGZvciB3YXRjaFxuICAgICAgZGlzYWJsZUZTQ2FjaGUoKVxuXG4gICAgICAvLyBzdGFydCB3YXRjaFxuICAgICAgd2F0Y2hsb2coJ1dhdGNoaW5nIGZvciAlcyAuLi4nLCBuYW1lKVxuICAgICAgd2F0Y2hlcnMucHVzaChmcy53YXRjaChuZXdwYXRoLCB7XG4gICAgICAgIHJlY3Vyc2l2ZTogc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcbiAgICAgIH0sICgpID0+IHRoaXMuc3RhcnQobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlLCBmYWxzZSkpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB3YXRjaGVyLmNsb3NlKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlLCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgZGVidWcoJ3Rhc2sgcmVjYWNoZSA9ICVzJywgcmVjYWNoZSlcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHJlY2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdClcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVHJ5IHRvIGxvYWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIGxldCBzdGFjayA9IF8odGhpcy5kLnN0YWNrKVxuXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5zKSB7XG4gICAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cblxuICAgICAgICAgIHN0YWNrLm1hcCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgICAgIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW4pKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IGxvYWRQbHVnaW4ocGx1Z2luLCBhcmdzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gW3BsdWdpbiwgYXJnc11cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IG1vZGUgPSAnc3RyZWFtJ1xuICAgICAgICBzdGFjayA9IHN0YWNrLm1hcCgoW3BsdWdpbl0pID0+IHtcbiAgICAgICAgICBjb25zdCBwbHVnaW5TdHJlYW0gPSBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXShcbiAgICAgICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBwbHVnaW5Db25maWdbcGx1Z2luXS5tb2RlID09PSAnYnVmZmVyJykge1xuICAgICAgICAgICAgbW9kZSA9ICdidWZmZXInXG4gICAgICAgICAgICByZXR1cm4gcHVtcChidWZmZXIoKSwgcGx1Z2luU3RyZWFtKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIE90aGVyd2lzZSBrZWVwIHB1bXBpbmcuXG4gICAgICAgICAgICovXG4gICAgICAgICAgcmV0dXJuIHBsdWdpblN0cmVhbVxuICAgICAgICB9KS52YWwoKVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb25uZWN0IHBsdWdpbiBzdHJlYW1zIHdpdGggcGlwZWxpbmVzLlxuICAgICAgICAgKi9cbiAgICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtID0gZmlsZS5zdHJlYW0uY29uY2F0KHN0YWNrKVxuICAgICAgICAgIHJldHVybiBmaWxlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29ubmVjdCB3aXRoIGRlc3RpbmF0aW9uLlxuICAgICAgICovXG4gICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIC8vIHN0cmlwIG91dCB0aGUgYWN0dWFsIGJvZHkgYW5kIHdyaXRlIGl0XG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2gobWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiBuZXh0KG51bGwsIGRhdGEuYm9keSkpKVxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUuZmlsZSkpKVxuXG4gICAgICAgIC8vIGNvbm5lY3QgYWxsIHN0cmVhbXMgdG9nZXRoZXIgdG8gZm9ybSBwaXBlbGluZVxuICAgICAgICBmaWxlLnN0cmVhbSA9IHB1bXAoZmlsZS5zdHJlYW0pXG5cbiAgICAgICAgLy8gcHJvbWlzaWZ5IHRoZSBjdXJyZW50IHBpcGVsaW5lXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICAvLyBzdGFydCAmIHdhaXQgZm9yIGFsbCBwaXBlbGluZXMgdG8gZW5kXG4gICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcy52YWwoKSlcbiAgICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnU2tpcHBpbmcgdGFzaycpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5kLmRlc3QgPSBqc29uLmRlc3RcbiAgICB0aGlzLmQuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLmQuc3RhY2sgPSBqc29uLnN0YWNrXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59Il19