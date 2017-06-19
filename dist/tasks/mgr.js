'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _2 = require('../_');

var _3 = _interopRequireDefault(_2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _glob = require('../glob');

var _glob2 = _interopRequireDefault(_glob);

var _buffer = require('./buffer');

var _buffer2 = _interopRequireDefault(_buffer);

var _mkdirp = require('../mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _getPath = require('../get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

var _fs3 = require('../fs');

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

var _readStream = require('./read-stream');

var _readStream2 = _interopRequireDefault(_readStream);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const watchlog = (0, _log2.default)('hopp:watch').log;

/**
 * Plugins storage.
 */
/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const plugins = {};
const pluginCtx = {};
const bufferPlugins = {};

/**
 * Loads a plugin, manages its env.
 */
const loadPlugin = (plugin, args) => {
  let mod = require(plugin

  // check for if plugin requires before
  );if (mod.FORCE_BUFFER === true) {
    bufferPlugins[plugin] = true;
  }

  // if defined as an ES2015 module, assume that the
  // export is at 'default'
  if (mod.__esModule === true) {
    mod = mod.default;
  }

  // create plugin logger
  const logger = (0, _log2.default)(`hopp:${_path2.default.basename(plugin).substr(5)}`

  // create a new context for this plugin
  );pluginCtx[plugin] = {
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
      newpath = _path2.default.resolve(directory, newpath.substr(1)

      // disable fs caching for watch
      );(0, _fs3.disableFSCache

      // start watch
      )();watchlog('Watching for %s ...', name);
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
    const { log, debug } = (0, _log2.default)(`hopp:${name}`

    /**
     * Get the modified files.
     */
    );debug('task recache = %s', recache);
    let files = await (0, _glob2.default)(this.d.src, directory, useDoubleCache, recache);

    if (files.length > 0) {
      const dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
      await (0, _mkdirp2.default)(dest.replace(directory, ''), directory

      /**
       * Create streams.
       */
      );files = (0, _3.default)(files).map(file => ({
        file,
        stream: [(0, _readStream2.default)(file, dest)]
      }));

      if (this.d.stack.length > 0) {
        /**
         * Try to load plugins.
         */
        let stack = (0, _3.default)(this.d.stack);

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
          }

          /**
           * Enable buffer mode if required.
           */
          );if (mode === 'stream' && bufferPlugins[plugin]) {
            mode = 'buffer';
            return (0, _pump2.default)((0, _buffer2.default)(), pluginStream);
          }

          /**
           * Otherwise keep pumping.
           */
          return pluginStream;
        }).val

        /**
         * Connect plugin streams with pipelines.
         */
        ();files.map(file => {
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
        file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file))

        // connect all streams together to form pipeline
        );file.stream = (0, _pump2.default)(file.stream

        // promisify the current pipeline
        );return new Promise((resolve, reject) => {
          file.stream.on('error', reject);
          file.stream.on('close', resolve);
        });
      }

      // start & wait for all pipelines to end
      );const start = Date.now();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJidWZmZXJQbHVnaW5zIiwibG9hZFBsdWdpbiIsInBsdWdpbiIsImFyZ3MiLCJtb2QiLCJyZXF1aXJlIiwiRk9SQ0VfQlVGRkVSIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJsb2dnZXIiLCJiYXNlbmFtZSIsInN1YnN0ciIsImRlYnVnIiwiZXJyb3IiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJ3YXRjaCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJyZWNhY2hlIiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzdWIiLCJzcGxpdCIsInNlcCIsInJlc29sdmUiLCJwdXNoIiwic3RhcnQiLCJQcm9taXNlIiwicHJvY2VzcyIsIm9uIiwid2F0Y2hlciIsImNsb3NlIiwidXNlRG91YmxlQ2FjaGUiLCJmaWxlcyIsImxlbmd0aCIsInJlcGxhY2UiLCJtYXAiLCJmaWxlIiwic3RyZWFtIiwiaGFzT3duUHJvcGVydHkiLCJtb2RlIiwicGx1Z2luU3RyZWFtIiwiZGF0YSIsIm5leHQiLCJ0aGVuIiwibmV3RGF0YSIsImNhdGNoIiwiZXJyIiwidmFsIiwiY29uY2F0IiwiYm9keSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwicmVqZWN0IiwiRGF0ZSIsIm5vdyIsImFsbCIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxNQUFNQyxXQUFXLG1CQUFhLFlBQWIsRUFBMkJD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QUFQO0FBQ0Q7QUE3TXVCO2tCQUFMTCxJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICcuLi9fJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0IGJ1ZmZlciBmcm9tICcuL2J1ZmZlcidcbmltcG9ydCBta2RpcnAgZnJvbSAnLi4vbWtkaXJwJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZ2V0LXBhdGgnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBtYXBTdHJlYW0gZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4uL3V0aWxzL2xvZydcbmltcG9ydCBjcmVhdGVSZWFkU3RyZWFtIGZyb20gJy4vcmVhZC1zdHJlYW0nXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkN0eCA9IHt9XG5jb25zdCBidWZmZXJQbHVnaW5zID0ge31cblxuLyoqXG4gKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICovXG5jb25zdCBsb2FkUGx1Z2luID0gKHBsdWdpbiwgYXJncykgPT4ge1xuICBsZXQgbW9kID0gcmVxdWlyZShwbHVnaW4pXG5cbiAgLy8gY2hlY2sgZm9yIGlmIHBsdWdpbiByZXF1aXJlcyBiZWZvcmVcbiAgaWYgKG1vZC5GT1JDRV9CVUZGRVIgPT09IHRydWUpIHtcbiAgICBidWZmZXJQbHVnaW5zW3BsdWdpbl0gPSB0cnVlXG4gIH1cblxuICAvLyBpZiBkZWZpbmVkIGFzIGFuIEVTMjAxNSBtb2R1bGUsIGFzc3VtZSB0aGF0IHRoZVxuICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgIG1vZCA9IG1vZC5kZWZhdWx0XG4gIH1cblxuICAvLyBjcmVhdGUgcGx1Z2luIGxvZ2dlclxuICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gIHBsdWdpbkN0eFtwbHVnaW5dID0ge1xuICAgIGFyZ3MsXG4gICAgbG9nOiBsb2dnZXIuZGVidWcsXG4gICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICB9XG5cbiAgLy8gcmV0dXJuIGxvYWRlZCBwbHVnaW5cbiAgcmV0dXJuIG1vZFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgd2F0Y2ggc2hvdWxkIGJlIHJlY3Vyc2l2ZVxuICAgICAgY29uc3QgcmVjdXJzaXZlID0gc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcblxuICAgICAgLy8gZ2V0IG1vc3QgZGVmaW5pdGl2ZSBwYXRoIHBvc3NpYmxlXG4gICAgICBsZXQgbmV3cGF0aCA9ICcnXG4gICAgICBmb3IgKGxldCBzdWIgb2Ygc3JjLnNwbGl0KCcvJykpIHtcbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIGlmIChzdWIuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdwYXRoICs9IHBhdGguc2VwICsgc3ViXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld3BhdGggPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBuZXdwYXRoLnN1YnN0cigxKSlcblxuICAgICAgLy8gZGlzYWJsZSBmcyBjYWNoaW5nIGZvciB3YXRjaFxuICAgICAgZGlzYWJsZUZTQ2FjaGUoKVxuXG4gICAgICAvLyBzdGFydCB3YXRjaFxuICAgICAgd2F0Y2hsb2coJ1dhdGNoaW5nIGZvciAlcyAuLi4nLCBuYW1lKVxuICAgICAgd2F0Y2hlcnMucHVzaChmcy53YXRjaChuZXdwYXRoLCB7XG4gICAgICAgIHJlY3Vyc2l2ZTogc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcbiAgICAgIH0sICgpID0+IHRoaXMuc3RhcnQobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlLCBmYWxzZSkpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB3YXRjaGVyLmNsb3NlKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlLCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgZGVidWcoJ3Rhc2sgcmVjYWNoZSA9ICVzJywgcmVjYWNoZSlcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHJlY2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdClcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVHJ5IHRvIGxvYWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIGxldCBzdGFjayA9IF8odGhpcy5kLnN0YWNrKVxuXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5zKSB7XG4gICAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cblxuICAgICAgICAgIHN0YWNrLm1hcCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgICAgIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW4pKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IGxvYWRQbHVnaW4ocGx1Z2luLCBhcmdzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gW3BsdWdpbiwgYXJnc11cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IG1vZGUgPSAnc3RyZWFtJ1xuICAgICAgICBzdGFjayA9IHN0YWNrLm1hcCgoW3BsdWdpbl0pID0+IHtcbiAgICAgICAgICBjb25zdCBwbHVnaW5TdHJlYW0gPSBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXShcbiAgICAgICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBidWZmZXJQbHVnaW5zW3BsdWdpbl0pIHtcbiAgICAgICAgICAgIG1vZGUgPSAnYnVmZmVyJ1xuICAgICAgICAgICAgcmV0dXJuIHB1bXAoYnVmZmVyKCksIHBsdWdpblN0cmVhbSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBPdGhlcndpc2Uga2VlcCBwdW1waW5nLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIHJldHVybiBwbHVnaW5TdHJlYW1cbiAgICAgICAgfSkudmFsKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4gbmV4dChudWxsLCBkYXRhLmJvZHkpKSlcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcblxuICAgICAgICAvLyBjb25uZWN0IGFsbCBzdHJlYW1zIHRvZ2V0aGVyIHRvIGZvcm0gcGlwZWxpbmVcbiAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtKVxuXG4gICAgICAgIC8vIHByb21pc2lmeSB0aGUgY3VycmVudCBwaXBlbGluZVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gc3RhcnQgJiB3YWl0IGZvciBhbGwgcGlwZWxpbmVzIHRvIGVuZFxuICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXMudmFsKCkpXG4gICAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1NraXBwaW5nIHRhc2snKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==