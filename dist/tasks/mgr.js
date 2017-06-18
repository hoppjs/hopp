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

var _glob = require('../glob');

var _glob2 = _interopRequireDefault(_glob);

var _mkdirp = require('../mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _getPath = require('../get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Hopp class to manage tasks.
 */
/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
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

      // start watch
      );console.log('watching: %s', newpath);
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
        stream: _fs2.default.createReadStream(file, { encoding: 'utf8' })
      })

      // TODO: pipe to plugin streams

      /**
       * Connect with destination.
       */
      );const dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
      await (0, _mkdirp2.default)(dest.replace(directory, ''), directory);

      files.map(file => {
        file.stream.pipe(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJ3YXRjaCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJ3YXRjaGVycyIsImZvckVhY2giLCJyZWN1cnNpdmUiLCJpbmRleE9mIiwibmV3cGF0aCIsInN1YiIsInNwbGl0Iiwic2VwIiwicmVzb2x2ZSIsInN1YnN0ciIsImNvbnNvbGUiLCJsb2ciLCJwdXNoIiwic3RhcnQiLCJQcm9taXNlIiwicHJvY2VzcyIsIm9uIiwid2F0Y2hlciIsImNsb3NlIiwidXNlRG91YmxlQ2FjaGUiLCJkZWJ1ZyIsIkRhdGUiLCJub3ciLCJmaWxlcyIsImxlbmd0aCIsIm1hcCIsImZpbGUiLCJzdHJlYW0iLCJjcmVhdGVSZWFkU3RyZWFtIiwiZW5jb2RpbmciLCJyZXBsYWNlIiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiYmFzZW5hbWUiLCJ2YWwiLCJ0b0pTT04iLCJmcm9tSlNPTiIsImpzb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7Ozs7OztBQUVBOzs7QUFmQTs7Ozs7O0FBa0JlLE1BQU1DLElBQU4sQ0FBVztBQUN4Qjs7Ozs7OztBQU9BQyxjQUFhQyxHQUFiLEVBQWtCO0FBQ2hCLFFBQUksRUFBRUEsZUFBZUMsS0FBakIsQ0FBSixFQUE2QjtBQUMzQkQsWUFBTSxDQUFDQSxHQUFELENBQU47QUFDRDs7QUFFRCxTQUFLRSxDQUFMLEdBQVM7QUFDUEYsU0FETztBQUVQRyxhQUFPO0FBRkEsS0FBVDtBQUlEOztBQUVEOzs7OztBQUtBQyxPQUFNQyxHQUFOLEVBQVc7QUFDVCxTQUFLSCxDQUFMLENBQU9FLElBQVAsR0FBY0MsR0FBZDtBQUNBLFdBQU8sSUFBUDtBQUNEOztB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LFdBQU87QUFDTHhDLFlBQU0sS0FBS0YsQ0FBTCxDQUFPRSxJQURSO0FBRUxKLFdBQUssS0FBS0UsQ0FBTCxDQUFPRixHQUZQO0FBR0xHLGFBQU8sS0FBS0QsQ0FBTCxDQUFPQztBQUhULEtBQVA7QUFLRDs7QUFFRDs7Ozs7QUFLQTBDLFdBQVVDLElBQVYsRUFBZ0I7QUFDZCxTQUFLNUMsQ0FBTCxDQUFPRSxJQUFQLEdBQWMwQyxLQUFLMUMsSUFBbkI7QUFDQSxTQUFLRixDQUFMLENBQU9GLEdBQVAsR0FBYThDLEtBQUs5QyxHQUFsQjtBQUNBLFNBQUtFLENBQUwsQ0FBT0MsS0FBUCxHQUFlMkMsS0FBSzNDLEtBQXBCOztBQUVBLFdBQU8sSUFBUDtBQUNEO0FBeEl1QjtrQkFBTEwsSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAnLi4vXydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0IG1rZGlycCBmcm9tICcuLi9ta2RpcnAnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9nZXQtcGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgaWYgKCEoc3JjIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBzcmMgPSBbc3JjXVxuICAgIH1cblxuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnkpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgd2F0Y2ggc2hvdWxkIGJlIHJlY3Vyc2l2ZVxuICAgICAgY29uc3QgcmVjdXJzaXZlID0gc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcblxuICAgICAgLy8gZ2V0IG1vc3QgZGVmaW5pdGl2ZSBwYXRoIHBvc3NpYmxlXG4gICAgICBsZXQgbmV3cGF0aCA9ICcnXG4gICAgICBmb3IgKGxldCBzdWIgb2Ygc3JjLnNwbGl0KCcvJykpIHtcbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIGlmIChzdWIuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdwYXRoICs9IHBhdGguc2VwICsgc3ViXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld3BhdGggPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBuZXdwYXRoLnN1YnN0cigxKSlcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIGNvbnNvbGUubG9nKCd3YXRjaGluZzogJXMnLCBuZXdwYXRoKVxuICAgICAgd2F0Y2hlcnMucHVzaChmcy53YXRjaChuZXdwYXRoLCB7XG4gICAgICAgIHJlY3Vyc2l2ZTogc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcbiAgICAgIH0sICgpID0+IHRoaXMuc3RhcnQobmFtZSwgZGlyZWN0b3J5LCBmYWxzZSkpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB3YXRjaGVyLmNsb3NlKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgKi9cbiAgICAgIGZpbGVzID0gXyhmaWxlcykubWFwKGZpbGUgPT4gKHtcbiAgICAgICAgZmlsZSxcbiAgICAgICAgc3RyZWFtOiBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KVxuICAgICAgfSkpXG5cbiAgICAgIC8vIFRPRE86IHBpcGUgdG8gcGx1Z2luIHN0cmVhbXNcblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBmaWxlLnN0cmVhbS5waXBlKFxuICAgICAgICAgIGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUuZmlsZSkpXG4gICAgICAgIClcbiAgICAgIH0pXG5cbiAgICAgIC8vIGxhdW5jaFxuICAgICAgZmlsZXMudmFsKClcbiAgICB9XG5cbiAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5kLmRlc3QgPSBqc29uLmRlc3RcbiAgICB0aGlzLmQuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLmQuc3RhY2sgPSBqc29uLnN0YWNrXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59Il19