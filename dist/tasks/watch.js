'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _goal = require('./goal');

var Goal = _interopRequireWildcard(_goal);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Creates a Hopp-ish object that runs
 * subtasks in watch mode.
 */
exports.default = tasks => ({
  /**
   * Starts all tasks in watch mode.
   * 
   * @return {Promise} joins all watch promises under .all()
   */
  start(name, directory) {
    return Goal.create(tasks, directory, 'watch');
  },

  /**
   * Converts tasks to JSON.
   * Just converts them into an array of
   * JSON objects.
   * 
   * @return {Array} 
   */
  toJSON() {
    return ['watch', tasks];
  }
}); /**
     * @file src/plugins/watch.js
     * @license MIT
     * @copyright 2017 Karim Alibhai.
     */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy93YXRjaC5qcyJdLCJuYW1lcyI6WyJHb2FsIiwidGFza3MiLCJzdGFydCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJjcmVhdGUiLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztJQUFZQSxJOzs7O0FBRVo7Ozs7a0JBSWVDLFVBQVU7QUFDdkI7Ozs7O0FBS0FDLFFBQU9DLElBQVAsRUFBYUMsU0FBYixFQUF3QjtBQUN0QixXQUFPSixLQUFLSyxNQUFMLENBQVlKLEtBQVosRUFBbUJHLFNBQW5CLEVBQThCLE9BQTlCLENBQVA7QUFDRCxHQVJzQjs7QUFVdkI7Ozs7Ozs7QUFPQUUsV0FBVTtBQUNSLFdBQU8sQ0FBQyxPQUFELEVBQVVMLEtBQVYsQ0FBUDtBQUNEO0FBbkJzQixDQUFWLEMsRUFaZiIsImZpbGUiOiJ3YXRjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3BsdWdpbnMvd2F0Y2guanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0ICogYXMgR29hbCBmcm9tICcuL2dvYWwnXG5cbi8qKlxuICogQ3JlYXRlcyBhIEhvcHAtaXNoIG9iamVjdCB0aGF0IHJ1bnNcbiAqIHN1YnRhc2tzIGluIHdhdGNoIG1vZGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IHRhc2tzID0+ICh7XG4gIC8qKlxuICAgKiBTdGFydHMgYWxsIHRhc2tzIGluIHdhdGNoIG1vZGUuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBqb2lucyBhbGwgd2F0Y2ggcHJvbWlzZXMgdW5kZXIgLmFsbCgpXG4gICAqL1xuICBzdGFydCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIEdvYWwuY3JlYXRlKHRhc2tzLCBkaXJlY3RvcnksICd3YXRjaCcpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2tzIHRvIEpTT04uXG4gICAqIEp1c3QgY29udmVydHMgdGhlbSBpbnRvIGFuIGFycmF5IG9mXG4gICAqIEpTT04gb2JqZWN0cy5cbiAgICogXG4gICAqIEByZXR1cm4ge0FycmF5fSBcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIFsnd2F0Y2gnLCB0YXNrc11cbiAgfVxufSkiXX0=