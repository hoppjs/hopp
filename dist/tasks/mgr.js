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
     * Get the modified files.
     */
    );let files = await (0, _glob2.default)(this.d.src, directory);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJkIiwic3RhY2siLCJkZXN0Iiwib3V0Iiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwibG9nIiwiZGVidWciLCJEYXRlIiwibm93IiwiZmlsZXMiLCJsZW5ndGgiLCJtYXAiLCJmaWxlIiwic3RyZWFtIiwiY3JlYXRlUmVhZFN0cmVhbSIsImVuY29kaW5nIiwicmVzb2x2ZSIsInJlcGxhY2UiLCJwaXBlIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJiYXNlbmFtZSIsInZhbCIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7Ozs7O0FBRUE7OztBQWZBOzs7Ozs7QUFrQmUsTUFBTUMsSUFBTixDQUFXO0FBQ3hCOzs7Ozs7O0FBT0FDLGNBQWFDLEdBQWIsRUFBa0I7QUFDaEIsU0FBS0MsQ0FBTCxHQUFTO0FBQ1BELFNBRE87QUFFUEUsYUFBTztBQUZBLEtBQVQ7QUFJRDs7QUFFRDs7Ozs7QUFLQUMsT0FBTUMsR0FBTixFQUFXO0FBQ1QsU0FBS0gsQ0FBTCxDQUFPRSxJQUFQLEdBQWNDLEdBQWQ7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFFRDs7OztBQUlBLFFBQU1DLEtBQU4sQ0FBYUMsSUFBYixFQUFtQkMsU0FBbkIsRUFBOEI7QUFDNUIsVUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsS0FBaUIsbUJBQWMsUUFBT0gsSUFBSyxFQUExQixDQUF2QjtBQUNBLFVBQU1ELFFBQVFLLEtBQUtDLEdBQUwsRUFBZDtBQUNBSCxRQUFJOztBQUVKOzs7QUFGQSxNQUtBLElBQUlJLFFBQVEsTUFBTSxvQkFBSyxLQUFLWCxDQUFMLENBQU9ELEdBQVosRUFBaUJPLFNBQWpCLENBQWxCOztBQUVBLFFBQUlLLE1BQU1DLE1BQU4sR0FBZSxDQUFuQixFQUFzQjtBQUNwQjs7O0FBR0FELGNBQVEsZ0JBQUVBLEtBQUYsRUFBU0UsR0FBVCxDQUFhQyxTQUFTO0FBQzVCQSxZQUQ0QjtBQUU1QkMsZ0JBQVEsYUFBR0MsZ0JBQUgsQ0FBb0JGLElBQXBCLEVBQTBCLEVBQUVHLFVBQVUsTUFBWixFQUExQjtBQUZvQixPQUFUOztBQUtyQjs7QUFFQTs7O0FBUFEsT0FBUixDQVVBLE1BQU1mLE9BQU8sZUFBS2dCLE9BQUwsQ0FBYVosU0FBYixFQUF3Qix1QkFBUSxLQUFLTixDQUFMLENBQU9FLElBQWYsQ0FBeEIsQ0FBYjtBQUNBLFlBQU0sc0JBQU9BLEtBQUtpQixPQUFMLENBQWFiLFNBQWIsRUFBd0IsRUFBeEIsQ0FBUCxFQUFvQ0EsU0FBcEMsQ0FBTjs7QUFFQUssWUFBTUUsR0FBTixDQUFVQyxRQUFRO0FBQ2hCQSxhQUFLQyxNQUFMLENBQVlLLElBQVosQ0FDRSxhQUFHQyxpQkFBSCxDQUFxQm5CLE9BQU8sR0FBUCxHQUFhLGVBQUtvQixRQUFMLENBQWNSLEtBQUtBLElBQW5CLENBQWxDLENBREY7QUFHRDs7QUFFRDtBQU5BLFFBT0FILE1BQU1ZLEdBQU47QUFDRDs7QUFFRGhCLFFBQUkseUJBQUosRUFBK0JFLEtBQUtDLEdBQUwsS0FBYU4sS0FBNUM7QUFDRDs7QUFFRDs7OztBQUlBb0IsV0FBVTtBQUNSLFdBQU87QUFDTHRCLFlBQU0sS0FBS0YsQ0FBTCxDQUFPRSxJQURSO0FBRUxILFdBQUssS0FBS0MsQ0FBTCxDQUFPRCxHQUZQO0FBR0xFLGFBQU8sS0FBS0QsQ0FBTCxDQUFPQztBQUhULEtBQVA7QUFLRDs7QUFFRDs7Ozs7QUFLQXdCLFdBQVVDLElBQVYsRUFBZ0I7QUFDZCxTQUFLMUIsQ0FBTCxDQUFPRSxJQUFQLEdBQWN3QixLQUFLeEIsSUFBbkI7QUFDQSxTQUFLRixDQUFMLENBQU9ELEdBQVAsR0FBYTJCLEtBQUszQixHQUFsQjtBQUNBLFNBQUtDLENBQUwsQ0FBT0MsS0FBUCxHQUFleUIsS0FBS3pCLEtBQXBCOztBQUVBLFdBQU8sSUFBUDtBQUNEO0FBNUZ1QjtrQkFBTEosSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAnLi4vXydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0IG1rZGlycCBmcm9tICcuLi9ta2RpcnAnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9nZXQtcGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnkpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pXG4gICAgICB9KSlcblxuICAgICAgLy8gVE9ETzogcGlwZSB0byBwbHVnaW4gc3RyZWFtc1xuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIGZpbGUuc3RyZWFtLnBpcGUoXG4gICAgICAgICAgZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSlcbiAgICAgICAgKVxuICAgICAgfSlcblxuICAgICAgLy8gbGF1bmNoXG4gICAgICBmaWxlcy52YWwoKVxuICAgIH1cblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=