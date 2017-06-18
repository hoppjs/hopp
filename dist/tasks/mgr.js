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

/**
 * Loads a plugin, manages its env.
 */
const loadPlugin = (plugin, args) => {
  let mod = require(plugin

  // if defined as an ES2015 module, assume that the
  // export is at 'default'
  );if (mod.__esModule === true) {
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
  watch(name, directory) {
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
      }, () => this.start(name, directory, false)));
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
  async start(name, directory, useDoubleCache = true) {
    const { log, debug } = (0, _log2.default)(`hopp:${name}`);
    const start = Date.now();
    log('Starting task'

    /**
     * Get the modified files.
     */
    );let files = await (0, _glob2.default)(this.d.src, directory, useDoubleCache);

    if (files.length > 0) {
      /**
       * Create streams.
       */
      files = (0, _3.default)(files).map(file => ({
        file,
        stream: [_fs2.default.createReadStream(file)]
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
        stack = stack.map(([plugin]) => (0, _mapStream2.default)((data, next) => {
          plugins[plugin](pluginCtx[plugin], data).then(newData => next(null, newData)).catch(err => next(err));
        })).val

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
      const dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
      await (0, _mkdirp2.default)(dest.replace(directory, ''), directory);

      files.map(file => {
        file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));
        file.stream = (0, _pump2.default)(file.stream);
      }

      // launch
      );files.val();
    }

    log('Task ended (took %s ms)', Date.now() - start);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJjb25zdHJ1Y3RvciIsInNyYyIsIkFycmF5IiwiZCIsInN0YWNrIiwiZGVzdCIsIm91dCIsIndhdGNoIiwibmFtZSIsImRpcmVjdG9yeSIsIndhdGNoZXJzIiwiZm9yRWFjaCIsInJlY3Vyc2l2ZSIsImluZGV4T2YiLCJuZXdwYXRoIiwic3ViIiwic3BsaXQiLCJzZXAiLCJyZXNvbHZlIiwicHVzaCIsInN0YXJ0IiwiUHJvbWlzZSIsInByb2Nlc3MiLCJvbiIsIndhdGNoZXIiLCJjbG9zZSIsInVzZURvdWJsZUNhY2hlIiwiRGF0ZSIsIm5vdyIsImZpbGVzIiwibGVuZ3RoIiwibWFwIiwiZmlsZSIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJoYXNPd25Qcm9wZXJ0eSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsInZhbCIsImNvbmNhdCIsInJlcGxhY2UiLCJjcmVhdGVXcml0ZVN0cmVhbSIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLE1BQU1DLFdBQVcsbUJBQWEsWUFBYixFQUEyQkMsR0FBNUM7O0FBRUE7OztBQXBCQTs7Ozs7O0FBdUJBLE1BQU1DLFVBQVUsRUFBaEI7QUFDQSxNQUFNQyxZQUFZLEVBQWxCOztBQUVBOzs7QUFH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S0FBUCxHQUFlNEMsS0FBSzVDLEtBQXBCOztBQUVBLFdBQU8sSUFBUDtBQUNEO0FBbkx1QjtrQkFBTEwsSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAnLi4vXydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZ2xvYidcbmltcG9ydCBta2RpcnAgZnJvbSAnLi4vbWtkaXJwJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZ2V0LXBhdGgnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBtYXBTdHJlYW0gZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4uL3V0aWxzL2xvZydcblxuY29uc3Qgd2F0Y2hsb2cgPSBjcmVhdGVMb2dnZXIoJ2hvcHA6d2F0Y2gnKS5sb2dcblxuLyoqXG4gKiBQbHVnaW5zIHN0b3JhZ2UuXG4gKi9cbmNvbnN0IHBsdWdpbnMgPSB7fVxuY29uc3QgcGx1Z2luQ3R4ID0ge31cblxuLyoqXG4gKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICovXG5jb25zdCBsb2FkUGx1Z2luID0gKHBsdWdpbiwgYXJncykgPT4ge1xuICBsZXQgbW9kID0gcmVxdWlyZShwbHVnaW4pXG5cbiAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgLy8gZXhwb3J0IGlzIGF0ICdkZWZhdWx0J1xuICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICB9XG5cbiAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBjb250ZXh0IGZvciB0aGlzIHBsdWdpblxuICBwbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICBhcmdzLFxuICAgIGxvZzogbG9nZ2VyLmRlYnVnLFxuICAgIGVycm9yOiBsb2dnZXIuZXJyb3JcbiAgfVxuXG4gIC8vIHJldHVybiBsb2FkZWQgcGx1Z2luXG4gIHJldHVybiBtb2Rcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2sgaW4gY29udGludW91cyBtb2RlLlxuICAgKi9cbiAgd2F0Y2ggKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpXG4gICAgICAgIF1cbiAgICAgIH0pKVxuXG4gICAgICBpZiAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyeSB0byBsb2FkIHBsdWdpbnMuXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgc3RhY2sgPSBfKHRoaXMuZC5zdGFjaylcblxuICAgICAgICBpZiAoIXRoaXMucGx1Z2lucykge1xuICAgICAgICAgIHRoaXMucGx1Z2lucyA9IHt9XG5cbiAgICAgICAgICBzdGFjay5tYXAoKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0gPSBsb2FkUGx1Z2luKHBsdWdpbiwgYXJncylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFtwbHVnaW4sIGFyZ3NdXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIHN0YWNrID0gc3RhY2subWFwKChbcGx1Z2luXSkgPT5cbiAgICAgICAgICBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXShcbiAgICAgICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgICB9KVxuICAgICAgICApLnZhbCgpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbm5lY3QgcGx1Z2luIHN0cmVhbXMgd2l0aCBwaXBlbGluZXMuXG4gICAgICAgICAqL1xuICAgICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBmaWxlLnN0cmVhbS5jb25jYXQoc3RhY2spXG4gICAgICAgICAgcmV0dXJuIGZpbGVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUuZmlsZSkpKVxuICAgICAgICBmaWxlLnN0cmVhbSA9IHB1bXAoZmlsZS5zdHJlYW0pXG4gICAgICB9KVxuXG4gICAgICAvLyBsYXVuY2hcbiAgICAgIGZpbGVzLnZhbCgpXG4gICAgfVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==