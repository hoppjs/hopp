'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _glob = require('../glob');

var _glob2 = _interopRequireDefault(_glob);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

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
    this.src = src;
    this.stack = [];
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */
  dest(out) {
    this.dest = out;
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
    );const files = await (0, _glob2.default)(this.src, directory);

    console.log('%j', files);

    log('Task ended (took %s ms)', Date.now() - start);
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON() {
    return {
      dest: this.dest,
      src: this.src,
      stack: this.stack
    };
  }

  /**
   * Deserializes a JSON object into a manager.
   * @param {Object} json
   * @return {Hopp} task manager
   */
  fromJSON(json) {
    this.dest = json.dest;
    this.src = json.src;
    this.stack = json.stack;

    return this;
  }
}
exports.default = Hopp; /**
                         * @file src/tasks/mgr.js
                         * @license MIT
                         * @copyright 2017 Karim Alibhai.
                         */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJzdGFydCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJsb2ciLCJkZWJ1ZyIsIkRhdGUiLCJub3ciLCJmaWxlcyIsImNvbnNvbGUiLCJ0b0pTT04iLCJmcm9tSlNPTiIsImpzb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7Ozs7O0FBRUE7OztBQUdlLE1BQU1DLElBQU4sQ0FBVztBQUN4Qjs7Ozs7OztBQU9BQyxjQUFhQyxHQUFiLEVBQWtCO0FBQ2hCLFNBQUtBLEdBQUwsR0FBV0EsR0FBWDtBQUNBLFNBQUtDLEtBQUwsR0FBYSxFQUFiO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0FDLE9BQU1DLEdBQU4sRUFBVztBQUNULFNBQUtELElBQUwsR0FBWUMsR0FBWjtBQUNBLFdBQU8sSUFBUDtBQUNEOztBQUVEOzs7O0FBSUEsUUFBTUMsS0FBTixDQUFhQyxJQUFiLEVBQW1CQyxTQUFuQixFQUE4QjtBQUM1QixVQUFNLEVBQUVDLEdBQUYsRUFBT0MsS0FBUCxLQUFpQixtQkFBYyxRQUFPSCxJQUFLLEVBQTFCLENBQXZCO0FBQ0EsVUFBTUQsUUFBUUssS0FBS0MsR0FBTCxFQUFkO0FBQ0FILFFBQUk7O0FBRUo7OztBQUZBLE1BS0EsTUFBTUksUUFBUSxNQUFNLG9CQUFLLEtBQUtYLEdBQVYsRUFBZU0sU0FBZixDQUFwQjs7QUFFQU0sWUFBUUwsR0FBUixDQUFZLElBQVosRUFBa0JJLEtBQWxCOztBQUVBSixRQUFJLHlCQUFKLEVBQStCRSxLQUFLQyxHQUFMLEtBQWFOLEtBQTVDO0FBQ0Q7O0FBRUQ7Ozs7QUFJQVMsV0FBVTtBQUNSLFdBQU87QUFDTFgsWUFBTSxLQUFLQSxJQUROO0FBRUxGLFdBQUssS0FBS0EsR0FGTDtBQUdMQyxhQUFPLEtBQUtBO0FBSFAsS0FBUDtBQUtEOztBQUVEOzs7OztBQUtBYSxXQUFVQyxJQUFWLEVBQWdCO0FBQ2QsU0FBS2IsSUFBTCxHQUFZYSxLQUFLYixJQUFqQjtBQUNBLFNBQUtGLEdBQUwsR0FBV2UsS0FBS2YsR0FBaEI7QUFDQSxTQUFLQyxLQUFMLEdBQWFjLEtBQUtkLEtBQWxCOztBQUVBLFdBQU8sSUFBUDtBQUNEO0FBakV1QjtrQkFBTEgsSSxFQWJyQiIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgdGhpcy5zcmMgPSBzcmNcbiAgICB0aGlzLnN0YWNrID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnkpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlcy5cbiAgICAgKi9cbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5zcmMsIGRpcmVjdG9yeSlcblxuICAgIGNvbnNvbGUubG9nKCclaicsIGZpbGVzKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5zcmMsXG4gICAgICBzdGFjazogdGhpcy5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==