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
   * @param {Glob} sources
   * @return {Hopp} new hopp object
   */
  constructor(sources) {
    this.sources = sources;
    this.callStack = [];
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */
  dest(out) {
    this.output = out;
    return this;
  }

  /**
   * Starts the pipeline.
   * @return {Promise} resolves when task is complete
   */
  start() {
    // TODO: actually start the task
    debug('Starting task: %s -> %s', this.sources, this.output);

    return Promise.resolve(1);
  }

  /**
   * Converts task manager to JSON for storage.
   * @return {Object} proper JSON object
   */
  toJSON() {
    return {
      output: this.output,
      sources: this.sources,
      callStack: this.callStack
    };
  }

  /**
   * Deserializes a JSON object into a manager.
   * @param {Object} json
   * @return {Hopp} task manager
   */
  fromJSON(json) {
    this.output = json.output;
    this.sources = json.sources;
    this.callStack = json.callStack;

    return this;
  }
}
exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiZGVidWciLCJyZXF1aXJlIiwiSG9wcCIsImNvbnN0cnVjdG9yIiwic291cmNlcyIsImNhbGxTdGFjayIsImRlc3QiLCJvdXQiLCJvdXRwdXQiLCJzdGFydCIsIlByb21pc2UiLCJyZXNvbHZlIiwidG9KU09OIiwiZnJvbUpTT04iLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOzs7Ozs7QUFNQSxNQUFNLEVBQUVBLEtBQUYsS0FBWUMsUUFBUSxjQUFSLEVBQXdCOztBQUUxQzs7O0FBRmtCLENBQWxCLENBS2UsTUFBTUMsSUFBTixDQUFXO0FBQ3hCOzs7Ozs7O0FBT0FDLGNBQWFDLE9BQWIsRUFBc0I7QUFDcEIsU0FBS0EsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixFQUFqQjtBQUNEOztBQUVEOzs7OztBQUtBQyxPQUFNQyxHQUFOLEVBQVc7QUFDVCxTQUFLQyxNQUFMLEdBQWNELEdBQWQ7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFFRDs7OztBQUlBRSxVQUFTO0FBQ1A7QUFDQVQsVUFBTSx5QkFBTixFQUFpQyxLQUFLSSxPQUF0QyxFQUErQyxLQUFLSSxNQUFwRDs7QUFFQSxXQUFPRSxRQUFRQyxPQUFSLENBQWdCLENBQWhCLENBQVA7QUFDRDs7QUFFRDs7OztBQUlBQyxXQUFVO0FBQ1IsV0FBTztBQUNMSixjQUFRLEtBQUtBLE1BRFI7QUFFTEosZUFBUyxLQUFLQSxPQUZUO0FBR0xDLGlCQUFXLEtBQUtBO0FBSFgsS0FBUDtBQUtEOztBQUVEOzs7OztBQUtBUSxXQUFVQyxJQUFWLEVBQWdCO0FBQ2QsU0FBS04sTUFBTCxHQUFjTSxLQUFLTixNQUFuQjtBQUNBLFNBQUtKLE9BQUwsR0FBZVUsS0FBS1YsT0FBcEI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCUyxLQUFLVCxTQUF0Qjs7QUFFQSxXQUFPLElBQVA7QUFDRDtBQXpEdUI7a0JBQUxILEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4uL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNvdXJjZXNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc291cmNlcykge1xuICAgIHRoaXMuc291cmNlcyA9IHNvdXJjZXNcbiAgICB0aGlzLmNhbGxTdGFjayA9IFtdXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMub3V0cHV0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIHN0YXJ0ICgpIHtcbiAgICAvLyBUT0RPOiBhY3R1YWxseSBzdGFydCB0aGUgdGFza1xuICAgIGRlYnVnKCdTdGFydGluZyB0YXNrOiAlcyAtPiAlcycsIHRoaXMuc291cmNlcywgdGhpcy5vdXRwdXQpXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDEpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvdXRwdXQ6IHRoaXMub3V0cHV0LFxuICAgICAgc291cmNlczogdGhpcy5zb3VyY2VzLFxuICAgICAgY2FsbFN0YWNrOiB0aGlzLmNhbGxTdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMub3V0cHV0ID0ganNvbi5vdXRwdXRcbiAgICB0aGlzLnNvdXJjZXMgPSBqc29uLnNvdXJjZXNcbiAgICB0aGlzLmNhbGxTdGFjayA9IGpzb24uY2FsbFN0YWNrXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59Il19