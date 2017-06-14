'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const { debug } = require('../utils/log')('hopp'

/**
 * Hopp class to manage tasks.
 */
);class Hopp {
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
  start() {
    // TODO: actually start the task
    debug('Starting task: %s -> %s', this.src, this.dest);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiZGVidWciLCJyZXF1aXJlIiwiSG9wcCIsImNvbnN0cnVjdG9yIiwic3JjIiwic3RhY2siLCJkZXN0Iiwib3V0Iiwic3RhcnQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRvSlNPTiIsImZyb21KU09OIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Ozs7O0FBTUEsTUFBTSxFQUFFQSxLQUFGLEtBQVlDLFFBQVEsY0FBUixFQUF3Qjs7QUFFMUM7OztBQUZrQixDQUFsQixDQUtlLE1BQU1DLElBQU4sQ0FBVztBQUN4Qjs7Ozs7OztBQU9BQyxjQUFhQyxHQUFiLEVBQWtCO0FBQ2hCLFNBQUtBLEdBQUwsR0FBV0EsR0FBWDtBQUNBLFNBQUtDLEtBQUwsR0FBYSxFQUFiO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0FDLE9BQU1DLEdBQU4sRUFBVztBQUNULFNBQUtELElBQUwsR0FBWUMsR0FBWjtBQUNBLFdBQU8sSUFBUDtBQUNEOztBQUVEOzs7O0FBSUFDLFVBQVM7QUFDUDtBQUNBUixVQUFNLHlCQUFOLEVBQWlDLEtBQUtJLEdBQXRDLEVBQTJDLEtBQUtFLElBQWhEOztBQUVBLFdBQU9HLFFBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBUDtBQUNEOztBQUVEOzs7O0FBSUFDLFdBQVU7QUFDUixXQUFPO0FBQ0xMLFlBQU0sS0FBS0EsSUFETjtBQUVMRixXQUFLLEtBQUtBLEdBRkw7QUFHTEMsYUFBTyxLQUFLQTtBQUhQLEtBQVA7QUFLRDs7QUFFRDs7Ozs7QUFLQU8sV0FBVUMsSUFBVixFQUFnQjtBQUNkLFNBQUtQLElBQUwsR0FBWU8sS0FBS1AsSUFBakI7QUFDQSxTQUFLRixHQUFMLEdBQVdTLEtBQUtULEdBQWhCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhUSxLQUFLUixLQUFsQjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQXpEdUI7a0JBQUxILEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4uL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICB0aGlzLnNyYyA9IHNyY1xuICAgIHRoaXMuc3RhY2sgPSBbXVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgc3RhcnQgKCkge1xuICAgIC8vIFRPRE86IGFjdHVhbGx5IHN0YXJ0IHRoZSB0YXNrXG4gICAgZGVidWcoJ1N0YXJ0aW5nIHRhc2s6ICVzIC0+ICVzJywgdGhpcy5zcmMsIHRoaXMuZGVzdClcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5zcmMsXG4gICAgICBzdGFjazogdGhpcy5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==