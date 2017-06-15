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
     * Create a tree of the current state.
     */
    );const tree = await (0, _glob2.default)(this.src, directory

    // console.log(tree)

    );log('Task ended (took %s ms)', Date.now() - start);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwiY29uc3RydWN0b3IiLCJzcmMiLCJzdGFjayIsImRlc3QiLCJvdXQiLCJzdGFydCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJsb2ciLCJkZWJ1ZyIsIkRhdGUiLCJub3ciLCJ0cmVlIiwidG9KU09OIiwiZnJvbUpTT04iLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7Ozs7OztBQUVBOzs7QUFHZSxNQUFNQyxJQUFOLENBQVc7QUFDeEI7Ozs7Ozs7QUFPQUMsY0FBYUMsR0FBYixFQUFrQjtBQUNoQixTQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFDQSxTQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNEOztBQUVEOzs7OztBQUtBQyxPQUFNQyxHQUFOLEVBQVc7QUFDVCxTQUFLRCxJQUFMLEdBQVlDLEdBQVo7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFFRDs7OztBQUlBLFFBQU1DLEtBQU4sQ0FBYUMsSUFBYixFQUFtQkMsU0FBbkIsRUFBOEI7QUFDNUIsVUFBTSxFQUFFQyxHQUFGLEVBQU9DLEtBQVAsS0FBaUIsbUJBQWMsUUFBT0gsSUFBSyxFQUExQixDQUF2QjtBQUNBLFVBQU1ELFFBQVFLLEtBQUtDLEdBQUwsRUFBZDtBQUNBSCxRQUFJOztBQUVKOzs7QUFGQSxNQUtBLE1BQU1JLE9BQU8sTUFBTSxvQkFBSyxLQUFLWCxHQUFWLEVBQWVNOztBQUVsQzs7QUFGbUIsS0FBbkIsQ0FJQUMsSUFBSSx5QkFBSixFQUErQkUsS0FBS0MsR0FBTCxLQUFhTixLQUE1QztBQUNEOztBQUVEOzs7O0FBSUFRLFdBQVU7QUFDUixXQUFPO0FBQ0xWLFlBQU0sS0FBS0EsSUFETjtBQUVMRixXQUFLLEtBQUtBLEdBRkw7QUFHTEMsYUFBTyxLQUFLQTtBQUhQLEtBQVA7QUFLRDs7QUFFRDs7Ozs7QUFLQVksV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUtaLElBQUwsR0FBWVksS0FBS1osSUFBakI7QUFDQSxTQUFLRixHQUFMLEdBQVdjLEtBQUtkLEdBQWhCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhYSxLQUFLYixLQUFsQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQWpFdUI7a0JBQUxILEksRUFickIiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBnbG9iIGZyb20gJy4uL2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nJ1xuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIHRoaXMuc3JjID0gc3JjXG4gICAgdGhpcy5zdGFjayA9IFtdXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIHRyZWUgb2YgdGhlIGN1cnJlbnQgc3RhdGUuXG4gICAgICovXG4gICAgY29uc3QgdHJlZSA9IGF3YWl0IGdsb2IodGhpcy5zcmMsIGRpcmVjdG9yeSlcblxuICAgIC8vIGNvbnNvbGUubG9nKHRyZWUpXG5cbiAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kZXN0LFxuICAgICAgc3JjOiB0aGlzLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuc3RhY2sgPSBqc29uLnN0YWNrXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59Il19