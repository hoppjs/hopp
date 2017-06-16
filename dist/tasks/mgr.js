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

var _modified = require('../modified');

var _modified2 = _interopRequireDefault(_modified);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  async start(name, directory) {
    const { log, debug } = (0, _log2.default)(`hopp:${name}`);
    const start = Date.now();
    log('Starting task'

    /**
     * Get the files.
     */
    );const files = (0, _3.default)((await (0, _modified2.default)((await (0, _glob2.default)(this.d.src, directory)))

    /**
     * Create streams.
     */
    )).map(file => ({
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
exports.default = Hopp; /**
                         * @file src/tasks/mgr.js
                         * @license MIT
                         * @copyright 2017 Karim Alibhai.
                         */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJkIiwic3RhY2siLCJkZXN0Iiwib3V0Iiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwibG9nIiwiZGVidWciLCJEYXRlIiwibm93IiwiZmlsZXMiLCJtYXAiLCJmaWxlIiwic3RyZWFtIiwiY3JlYXRlUmVhZFN0cmVhbSIsImVuY29kaW5nIiwicmVzb2x2ZSIsInJlcGxhY2UiLCJwaXBlIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJiYXNlbmFtZSIsInZhbCIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7Ozs7Ozs7QUFFQTs7O0FBR2UsTUFBTUMsSUFBTixDQUFXO0FBQ3hCOzs7Ozs7O0FBT0FDLGNBQWFDLEdBQWIsRUFBa0I7QUFDaEIsU0FBS0MsQ0FBTCxHQUFTO0FBQ1BELFNBRE87QUFFUEUsYUFBTztBQUZBLEtBQVQ7QUFJRDs7QUFFRDs7Ozs7QUFLQUMsT0FBTUMsR0FBTixFQUFXO0FBQ1QsU0FBS0gsQ0FBTCxDQUFPRSxJQUFQLEdBQWNDLEdBQWQ7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFFRDs7OztBQUlBLFFBQU1DLEtBQU4sQ0FBYUMsSUFBYixFQUFtQkMsU0FBbkIsRUFBOEI7QUFDNUIsVUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsS0FBaUIsbUJBQWMsUUFBT0gsSUFBSyxFQUExQixDQUF2QjtBQUNBLFVBQU1ELFFBQVFLLEtBQUtDLEdBQUwsRUFBZDtBQUNBSCxRQUFJOztBQUVKOzs7QUFGQSxNQUtBLE1BQU1JLFFBQVEsaUJBQUUsTUFBTSx5QkFBUyxNQUFNLG9CQUFLLEtBQUtYLENBQUwsQ0FBT0QsR0FBWixFQUFpQk8sU0FBakIsQ0FBZjs7QUFFbEI7OztBQUZVLE9BS1RNLEdBTFMsQ0FLTEMsU0FBUztBQUNaQSxVQURZO0FBRVpDLGNBQVEsYUFBR0MsZ0JBQUgsQ0FBb0JGLElBQXBCLEVBQTBCLEVBQUVHLFVBQVUsTUFBWixFQUExQjtBQUZJLEtBQVQ7O0FBS1Q7O0FBRUE7OztBQVpjLEtBQWQsQ0FlQSxNQUFNZCxPQUFPLGVBQUtlLE9BQUwsQ0FBYVgsU0FBYixFQUF3Qix1QkFBUSxLQUFLTixDQUFMLENBQU9FLElBQWYsQ0FBeEIsQ0FBYjtBQUNBLFVBQU0sc0JBQU9BLEtBQUtnQixPQUFMLENBQWFaLFNBQWIsRUFBd0IsRUFBeEIsQ0FBUCxFQUFvQ0EsU0FBcEMsQ0FBTjs7QUFFQUssVUFBTUMsR0FBTixDQUFVQyxRQUFRO0FBQ2hCQSxXQUFLQyxNQUFMLENBQVlLLElBQVosQ0FDRSxhQUFHQyxpQkFBSCxDQUFxQmxCLE9BQU8sR0FBUCxHQUFhLGVBQUttQixRQUFMLENBQWNSLEtBQUtBLElBQW5CLENBQWxDLENBREY7QUFHRDs7QUFFRDtBQU5BLE1BT0FGLE1BQU1XLEdBQU47O0FBRUFmLFFBQUkseUJBQUosRUFBK0JFLEtBQUtDLEdBQUwsS0FBYU4sS0FBNUM7QUFDRDs7QUFFRDs7OztBQUlBbUIsV0FBVTtBQUNSLFdBQU87QUFDTHJCLFlBQU0sS0FBS0YsQ0FBTCxDQUFPRSxJQURSO0FBRUxILFdBQUssS0FBS0MsQ0FBTCxDQUFPRCxHQUZQO0FBR0xFLGFBQU8sS0FBS0QsQ0FBTCxDQUFPQztBQUhULEtBQVA7QUFLRDs7QUFFRDs7Ozs7QUFLQXVCLFdBQVVDLElBQVYsRUFBZ0I7QUFDZCxTQUFLekIsQ0FBTCxDQUFPRSxJQUFQLEdBQWN1QixLQUFLdkIsSUFBbkI7QUFDQSxTQUFLRixDQUFMLENBQU9ELEdBQVAsR0FBYTBCLEtBQUsxQixHQUFsQjtBQUNBLFNBQUtDLENBQUwsQ0FBT0MsS0FBUCxHQUFld0IsS0FBS3hCLEtBQXBCOztBQUVBLFdBQU8sSUFBUDtBQUNEO0FBMUZ1QjtrQkFBTEosSSxFQW5CckIiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBfIGZyb20gJy4uL18nXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZ2xvYidcbmltcG9ydCBta2RpcnAgZnJvbSAnLi4vbWtkaXJwJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZ2V0LXBhdGgnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBtb2RpZmllZCBmcm9tICcuLi9tb2RpZmllZCdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nJ1xuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGVzLlxuICAgICAqL1xuICAgIGNvbnN0IGZpbGVzID0gXyhhd2FpdCBtb2RpZmllZChhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSkpKVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIC5tYXAoZmlsZSA9PiAoe1xuICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgc3RyZWFtOiBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KVxuICAgICAgICB9KSlcblxuICAgIC8vIFRPRE86IHBpcGUgdG8gcGx1Z2luIHN0cmVhbXNcblxuICAgIC8qKlxuICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgKi9cbiAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG4gICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgZmlsZS5zdHJlYW0ucGlwZShcbiAgICAgICAgZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSlcbiAgICAgIClcbiAgICB9KVxuXG4gICAgLy8gbGF1bmNoXG4gICAgZmlsZXMudmFsKClcblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=