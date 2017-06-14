'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

var _require = require('../utils/log')('hopp'

/**
 * Hopp class to manage tasks.
 */
),
    debug = _require.debug;

var Hopp = function () {
  /**
   * Creates a new task with the glob.
   * DOES NOT START THE TASK.
   * 
   * @param {Glob} src
   * @return {Hopp} new hopp object
   */
  function Hopp(src) {
    _classCallCheck(this, Hopp);

    this.src = src;
    this.stack = [];
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */


  _createClass(Hopp, [{
    key: 'dest',
    value: function dest(out) {
      this.dest = out;
      return this;
    }

    /**
     * Starts the pipeline.
     * @return {Promise} resolves when task is complete
     */

  }, {
    key: 'start',
    value: function start() {
      // TODO: actually start the task
      debug('Starting task: %s -> %s', this.src, this.dest);

      return Promise.resolve(1);
    }

    /**
     * Converts task manager to JSON for storage.
     * @return {Object} proper JSON object
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
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

  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      this.dest = json.dest;
      this.src = json.src;
      this.stack = json.stack;

      return this;
    }
  }]);

  return Hopp;
}();

exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsicmVxdWlyZSIsImRlYnVnIiwiSG9wcCIsInNyYyIsInN0YWNrIiwib3V0IiwiZGVzdCIsIlByb21pc2UiLCJyZXNvbHZlIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7Ozs7ZUFNa0JBLFFBQVEsY0FBUixFQUF3Qjs7QUFFMUM7OztBQUZrQixDO0lBQVZDLEssWUFBQUEsSzs7SUFLYUMsSTtBQUNuQjs7Ozs7OztBQU9BLGdCQUFhQyxHQUFiLEVBQWtCO0FBQUE7O0FBQ2hCLFNBQUtBLEdBQUwsR0FBV0EsR0FBWDtBQUNBLFNBQUtDLEtBQUwsR0FBYSxFQUFiO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozt5QkFLTUMsRyxFQUFLO0FBQ1QsV0FBS0MsSUFBTCxHQUFZRCxHQUFaO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7NEJBSVM7QUFDUDtBQUNBSixZQUFNLHlCQUFOLEVBQWlDLEtBQUtFLEdBQXRDLEVBQTJDLEtBQUtHLElBQWhEOztBQUVBLGFBQU9DLFFBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7OzZCQUlVO0FBQ1IsYUFBTztBQUNMRixjQUFNLEtBQUtBLElBRE47QUFFTEgsYUFBSyxLQUFLQSxHQUZMO0FBR0xDLGVBQU8sS0FBS0E7QUFIUCxPQUFQO0FBS0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtVSyxJLEVBQU07QUFDZCxXQUFLSCxJQUFMLEdBQVlHLEtBQUtILElBQWpCO0FBQ0EsV0FBS0gsR0FBTCxHQUFXTSxLQUFLTixHQUFoQjtBQUNBLFdBQUtDLEtBQUwsR0FBYUssS0FBS0wsS0FBbEI7O0FBRUEsYUFBTyxJQUFQO0FBQ0Q7Ozs7OztrQkF6RGtCRixJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuLi91dGlscy9sb2cnKSgnaG9wcCcpXG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgdGhpcy5zcmMgPSBzcmNcbiAgICB0aGlzLnN0YWNrID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIHN0YXJ0ICgpIHtcbiAgICAvLyBUT0RPOiBhY3R1YWxseSBzdGFydCB0aGUgdGFza1xuICAgIGRlYnVnKCdTdGFydGluZyB0YXNrOiAlcyAtPiAlcycsIHRoaXMuc3JjLCB0aGlzLmRlc3QpXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDEpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmRlc3QgPSBqc29uLmRlc3RcbiAgICB0aGlzLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=