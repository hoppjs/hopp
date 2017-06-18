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

var _readStream = require('./read-stream');

var _readStream2 = _interopRequireDefault(_readStream);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const watchlog = (0, _log2.default)('hopp:watch').log;

/**
 * Plugins storage.
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
    const { log, debug } = (0, _log2.default)(`hopp:${name}`

    /**
     * Get the modified files.
     */
    );let files = await (0, _glob2.default)(this.d.src, directory, useDoubleCache);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJjb25zdHJ1Y3RvciIsInNyYyIsIkFycmF5IiwiZCIsInN0YWNrIiwiZGVzdCIsIm91dCIsIndhdGNoIiwibmFtZSIsImRpcmVjdG9yeSIsIndhdGNoZXJzIiwiZm9yRWFjaCIsInJlY3Vyc2l2ZSIsImluZGV4T2YiLCJuZXdwYXRoIiwic3ViIiwic3BsaXQiLCJzZXAiLCJyZXNvbHZlIiwicHVzaCIsInN0YXJ0IiwiUHJvbWlzZSIsInByb2Nlc3MiLCJvbiIsIndhdGNoZXIiLCJjbG9zZSIsInVzZURvdWJsZUNhY2hlIiwiZmlsZXMiLCJsZW5ndGgiLCJyZXBsYWNlIiwibWFwIiwiZmlsZSIsInN0cmVhbSIsImhhc093blByb3BlcnR5IiwiZGF0YSIsIm5leHQiLCJ0aGVuIiwibmV3RGF0YSIsImNhdGNoIiwiZXJyIiwidmFsIiwiY29uY2F0IiwiYm9keSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwicmVqZWN0IiwiRGF0ZSIsIm5vdyIsImFsbCIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBakJBOzs7Ozs7QUFtQkEsTUFBTUMsV0FBVyxtQkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7O0FBR0EsTUFBTUMsVUFBVSxFQUFoQjtBQUNBLE1BQU1DLFlBQVksRUFBbEI7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QUFDQXhELFVBQUkseUJBQUosRUFBK0I2RCxLQUFLQyxHQUFMLEtBQWExQixLQUE1QztBQUNELEtBOUVELE1BOEVPO0FBQ0xwQyxVQUFJLGVBQUo7QUFDRDtBQUNGOztBQUVEOzs7O0FBSUFnRSxXQUFVO0FBQ1IsV0FBTztBQUNMM0MsWUFBTSxLQUFLRixDQUFMLENBQU9FLElBRFI7QUFFTEosV0FBSyxLQUFLRSxDQUFMLENBQU9GLEdBRlA7QUFHTEcsYUFBTyxLQUFLRCxDQUFMLENBQU9DO0FBSFQsS0FBUDtBQUtEOztBQUVEOzs7OztBQUtBNkMsV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUsvQyxDQUFMLENBQU9FLElBQVAsR0FBYzZDLEtBQUs3QyxJQUFuQjtBQUNBLFNBQUtGLENBQUwsQ0FBT0YsR0FBUCxHQUFhaUQsS0FBS2pELEdBQWxCO0FBQ0EsU0FBS0UsQ0FBTCxDQUFPQyxLQUFQLEdBQWU4QyxLQUFLOUMsS0FBcEI7O0FBRUEsV0FBTyxJQUFQO0FBQ0Q7QUE5THVCO2tCQUFMTCxJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICcuLi9fJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0IG1rZGlycCBmcm9tICcuLi9ta2RpcnAnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9nZXQtcGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IHsgZGlzYWJsZUZTQ2FjaGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nJ1xuaW1wb3J0IGNyZWF0ZVJlYWRTdHJlYW0gZnJvbSAnLi9yZWFkLXN0cmVhbSdcblxuY29uc3Qgd2F0Y2hsb2cgPSBjcmVhdGVMb2dnZXIoJ2hvcHA6d2F0Y2gnKS5sb2dcblxuLyoqXG4gKiBQbHVnaW5zIHN0b3JhZ2UuXG4gKi9cbmNvbnN0IHBsdWdpbnMgPSB7fVxuY29uc3QgcGx1Z2luQ3R4ID0ge31cblxuLyoqXG4gKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICovXG5jb25zdCBsb2FkUGx1Z2luID0gKHBsdWdpbiwgYXJncykgPT4ge1xuICBsZXQgbW9kID0gcmVxdWlyZShwbHVnaW4pXG5cbiAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgLy8gZXhwb3J0IGlzIGF0ICdkZWZhdWx0J1xuICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICB9XG5cbiAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBjb250ZXh0IGZvciB0aGlzIHBsdWdpblxuICBwbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICBhcmdzLFxuICAgIGxvZzogbG9nZ2VyLmRlYnVnLFxuICAgIGVycm9yOiBsb2dnZXIuZXJyb3JcbiAgfVxuXG4gIC8vIHJldHVybiBsb2FkZWQgcGx1Z2luXG4gIHJldHVybiBtb2Rcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2sgaW4gY29udGludW91cyBtb2RlLlxuICAgKi9cbiAgd2F0Y2ggKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QpXG4gICAgICAgIF1cbiAgICAgIH0pKVxuXG4gICAgICBpZiAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyeSB0byBsb2FkIHBsdWdpbnMuXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgc3RhY2sgPSBfKHRoaXMuZC5zdGFjaylcblxuICAgICAgICBpZiAoIXRoaXMucGx1Z2lucykge1xuICAgICAgICAgIHRoaXMucGx1Z2lucyA9IHt9XG5cbiAgICAgICAgICBzdGFjay5tYXAoKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0gPSBsb2FkUGx1Z2luKHBsdWdpbiwgYXJncylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFtwbHVnaW4sIGFyZ3NdXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIHN0YWNrID0gc3RhY2subWFwKChbcGx1Z2luXSkgPT5cbiAgICAgICAgICBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXShcbiAgICAgICAgICAgICAgcGx1Z2luQ3R4W3BsdWdpbl0sXG4gICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLnRoZW4obmV3RGF0YSA9PiBuZXh0KG51bGwsIG5ld0RhdGEpKVxuICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgICB9KVxuICAgICAgICApLnZhbCgpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbm5lY3QgcGx1Z2luIHN0cmVhbXMgd2l0aCBwaXBlbGluZXMuXG4gICAgICAgICAqL1xuICAgICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBmaWxlLnN0cmVhbS5jb25jYXQoc3RhY2spXG4gICAgICAgICAgcmV0dXJuIGZpbGVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgLy8gc3RyaXAgb3V0IHRoZSBhY3R1YWwgYm9keSBhbmQgd3JpdGUgaXRcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IG5leHQobnVsbCwgZGF0YS5ib2R5KSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgIGZpbGUuc3RyZWFtID0gcHVtcChmaWxlLnN0cmVhbSlcblxuICAgICAgICAvLyBwcm9taXNpZnkgdGhlIGN1cnJlbnQgcGlwZWxpbmVcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHN0YXJ0ICYgd2FpdCBmb3IgYWxsIHBpcGVsaW5lcyB0byBlbmRcbiAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgbG9nKCdTdGFydGluZyB0YXNrJylcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLnZhbCgpKVxuICAgICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdTa2lwcGluZyB0YXNrJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=