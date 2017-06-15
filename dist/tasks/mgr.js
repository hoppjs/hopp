'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
  async start(name) {
    const { debug } = (0, _log2.default)(`hopp:${name}`);
    debug('Starting task');

    return Promise.resolve(1);
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
exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJzdGFydCIsIm5hbWUiLCJkZWJ1ZyIsIlByb21pc2UiLCJyZXNvbHZlIiwidG9KU09OIiwiZnJvbUpTT04iLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7SUFBWUEsSzs7QUFDWjs7Ozs7Ozs7QUFFQTs7O0FBVEE7Ozs7OztBQVllLE1BQU1DLElBQU4sQ0FBVztBQUN4Qjs7Ozs7OztBQU9BQyxjQUFhQyxHQUFiLEVBQWtCO0FBQ2hCLFNBQUtBLEdBQUwsR0FBV0EsR0FBWDtBQUNBLFNBQUtDLEtBQUwsR0FBYSxFQUFiO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0FDLE9BQU1DLEdBQU4sRUFBVztBQUNULFNBQUtELElBQUwsR0FBWUMsR0FBWjtBQUNBLFdBQU8sSUFBUDtBQUNEOztBQUVEOzs7O0FBSUEsUUFBTUMsS0FBTixDQUFhQyxJQUFiLEVBQW1CO0FBQ2pCLFVBQU0sRUFBRUMsS0FBRixLQUFZLG1CQUFjLFFBQU9ELElBQUssRUFBMUIsQ0FBbEI7QUFDQUMsVUFBTSxlQUFOOztBQUVBLFdBQU9DLFFBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBUDtBQUNEOztBQUVEOzs7O0FBSUFDLFdBQVU7QUFDUixXQUFPO0FBQ0xQLFlBQU0sS0FBS0EsSUFETjtBQUVMRixXQUFLLEtBQUtBLEdBRkw7QUFHTEMsYUFBTyxLQUFLQTtBQUhQLEtBQVA7QUFLRDs7QUFFRDs7Ozs7QUFLQVMsV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUtULElBQUwsR0FBWVMsS0FBS1QsSUFBakI7QUFDQSxTQUFLRixHQUFMLEdBQVdXLEtBQUtYLEdBQWhCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhVSxLQUFLVixLQUFsQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQXpEdUI7a0JBQUxILEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgdGhpcy5zcmMgPSBzcmNcbiAgICB0aGlzLnN0YWNrID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lKSB7XG4gICAgY29uc3QgeyBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuICAgIGRlYnVnKCdTdGFydGluZyB0YXNrJylcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5zcmMsXG4gICAgICBzdGFjazogdGhpcy5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==