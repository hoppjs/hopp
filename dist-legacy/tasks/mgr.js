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
   * @param {Glob} sources
   * @return {Hopp} new hopp object
   */
  function Hopp(sources) {
    _classCallCheck(this, Hopp);

    this.sources = sources;
    this.callStack = [];
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */


  _createClass(Hopp, [{
    key: 'dest',
    value: function dest(out) {
      this.output = out;
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
      debug('Starting task: %s -> %s', this.sources, this.output);

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

  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      this.output = json.output;
      this.sources = json.sources;
      this.callStack = json.callStack;

      return this;
    }
  }]);

  return Hopp;
}();

exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsicmVxdWlyZSIsImRlYnVnIiwiSG9wcCIsInNvdXJjZXMiLCJjYWxsU3RhY2siLCJvdXQiLCJvdXRwdXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImpzb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O2VBTWtCQSxRQUFRLGNBQVIsRUFBd0I7O0FBRTFDOzs7QUFGa0IsQztJQUFWQyxLLFlBQUFBLEs7O0lBS2FDLEk7QUFDbkI7Ozs7Ozs7QUFPQSxnQkFBYUMsT0FBYixFQUFzQjtBQUFBOztBQUNwQixTQUFLQSxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozt5QkFLTUMsRyxFQUFLO0FBQ1QsV0FBS0MsTUFBTCxHQUFjRCxHQUFkO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7NEJBSVM7QUFDUDtBQUNBSixZQUFNLHlCQUFOLEVBQWlDLEtBQUtFLE9BQXRDLEVBQStDLEtBQUtHLE1BQXBEOztBQUVBLGFBQU9DLFFBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7OzZCQUlVO0FBQ1IsYUFBTztBQUNMRixnQkFBUSxLQUFLQSxNQURSO0FBRUxILGlCQUFTLEtBQUtBLE9BRlQ7QUFHTEMsbUJBQVcsS0FBS0E7QUFIWCxPQUFQO0FBS0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtVSyxJLEVBQU07QUFDZCxXQUFLSCxNQUFMLEdBQWNHLEtBQUtILE1BQW5CO0FBQ0EsV0FBS0gsT0FBTCxHQUFlTSxLQUFLTixPQUFwQjtBQUNBLFdBQUtDLFNBQUwsR0FBaUJLLEtBQUtMLFNBQXRCOztBQUVBLGFBQU8sSUFBUDtBQUNEOzs7Ozs7a0JBekRrQkYsSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc291cmNlc1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzb3VyY2VzKSB7XG4gICAgdGhpcy5zb3VyY2VzID0gc291cmNlc1xuICAgIHRoaXMuY2FsbFN0YWNrID0gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5vdXRwdXQgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgc3RhcnQgKCkge1xuICAgIC8vIFRPRE86IGFjdHVhbGx5IHN0YXJ0IHRoZSB0YXNrXG4gICAgZGVidWcoJ1N0YXJ0aW5nIHRhc2s6ICVzIC0+ICVzJywgdGhpcy5zb3VyY2VzLCB0aGlzLm91dHB1dClcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG91dHB1dDogdGhpcy5vdXRwdXQsXG4gICAgICBzb3VyY2VzOiB0aGlzLnNvdXJjZXMsXG4gICAgICBjYWxsU3RhY2s6IHRoaXMuY2FsbFN0YWNrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5vdXRwdXQgPSBqc29uLm91dHB1dFxuICAgIHRoaXMuc291cmNlcyA9IGpzb24uc291cmNlc1xuICAgIHRoaXMuY2FsbFN0YWNrID0ganNvbi5jYWxsU3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=