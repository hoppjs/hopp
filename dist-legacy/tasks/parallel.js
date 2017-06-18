'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

/**
 * Creates a Hopp-ish object that runs
 * subtasks in parallel.
 */
exports.default = function (tasks, taskTree) {
  return {
    /**
     * Starts all tasks concurrently.
     * 
     * @return {Promise} joins all task promises under .all()
     */
    start: function start(name, directory) {
      // just async for now
      return Promise.all(tasks.map(function (task) {
        return taskTree[task].start(name + ':' + task, directory);
      }));
    },


    /**
     * Converts tasks to JSON.
     * Just converts them into an array of
     * JSON objects.
     * 
     * @return {Array} 
     */
    toJSON: function toJSON() {
      return ['parallel', tasks];
    }
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrcyIsInRhc2tUcmVlIiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZSxVQUFDQSxLQUFELEVBQVFDLFFBQVI7QUFBQSxTQUFzQjtBQUNuQzs7Ozs7QUFLQUMsU0FObUMsaUJBTTVCQyxJQU40QixFQU10QkMsU0FOc0IsRUFNWDtBQUN0QjtBQUNBLGFBQU9DLFFBQVFDLEdBQVIsQ0FBWU4sTUFBTU8sR0FBTixDQUNqQjtBQUFBLGVBQVFOLFNBQVNPLElBQVQsRUFBZU4sS0FBZixDQUF3QkMsSUFBeEIsU0FBZ0NLLElBQWhDLEVBQXdDSixTQUF4QyxDQUFSO0FBQUEsT0FEaUIsQ0FBWixDQUFQO0FBR0QsS0FYa0M7OztBQWFuQzs7Ozs7OztBQU9BSyxVQXBCbUMsb0JBb0J6QjtBQUNSLGFBQU8sQ0FBQyxVQUFELEVBQWFULEtBQWIsQ0FBUDtBQUNEO0FBdEJrQyxHQUF0QjtBQUFBLEMiLCJmaWxlIjoicGFyYWxsZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9wbHVnaW5zL3BhcmFsbGVsLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIEhvcHAtaXNoIG9iamVjdCB0aGF0IHJ1bnNcbiAqIHN1YnRhc2tzIGluIHBhcmFsbGVsLlxuICovXG5leHBvcnQgZGVmYXVsdCAodGFza3MsIHRhc2tUcmVlKSA9PiAoe1xuICAvKipcbiAgICogU3RhcnRzIGFsbCB0YXNrcyBjb25jdXJyZW50bHkuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBqb2lucyBhbGwgdGFzayBwcm9taXNlcyB1bmRlciAuYWxsKClcbiAgICovXG4gIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnkpIHtcbiAgICAvLyBqdXN0IGFzeW5jIGZvciBub3dcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGFza3MubWFwKFxuICAgICAgdGFzayA9PiB0YXNrVHJlZVt0YXNrXS5zdGFydChgJHtuYW1lfToke3Rhc2t9YCwgZGlyZWN0b3J5KVxuICAgICkpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2tzIHRvIEpTT04uXG4gICAqIEp1c3QgY29udmVydHMgdGhlbSBpbnRvIGFuIGFycmF5IG9mXG4gICAqIEpTT04gb2JqZWN0cy5cbiAgICogXG4gICAqIEByZXR1cm4ge0FycmF5fSBcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIFsncGFyYWxsZWwnLCB0YXNrc11cbiAgfVxufSkiXX0=