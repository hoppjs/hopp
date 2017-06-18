'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

var taskTree = void 0;

/**
 * Creates a Hopp-ish object that runs
 * subtasks in parallel.
 */
var parallel = function parallel(tasks) {
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

parallel.defineTasks = function (defns) {
  taskTree = defns;
};

exports.default = parallel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrVHJlZSIsInBhcmFsbGVsIiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwiUHJvbWlzZSIsImFsbCIsInRhc2tzIiwibWFwIiwidGFzayIsInRvSlNPTiIsImRlZmluZVRhc2tzIiwiZGVmbnMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7Ozs7OztBQU1BLElBQUlBLGlCQUFKOztBQUVBOzs7O0FBSUEsSUFBTUMsV0FBVyxTQUFYQSxRQUFXO0FBQUEsU0FBVTtBQUN6Qjs7Ozs7QUFLQUMsU0FOeUIsaUJBTWxCQyxJQU5rQixFQU1aQyxTQU5ZLEVBTUQ7QUFDdEI7QUFDQSxhQUFPQyxRQUFRQyxHQUFSLENBQVlDLE1BQU1DLEdBQU4sQ0FDakI7QUFBQSxlQUFRUixTQUFTUyxJQUFULEVBQWVQLEtBQWYsQ0FBd0JDLElBQXhCLFNBQWdDTSxJQUFoQyxFQUF3Q0wsU0FBeEMsQ0FBUjtBQUFBLE9BRGlCLENBQVosQ0FBUDtBQUdELEtBWHdCOzs7QUFhekI7Ozs7Ozs7QUFPQU0sVUFwQnlCLG9CQW9CZjtBQUNSLGFBQU8sQ0FBQyxVQUFELEVBQWFILEtBQWIsQ0FBUDtBQUNEO0FBdEJ3QixHQUFWO0FBQUEsQ0FBakI7O0FBeUJBTixTQUFTVSxXQUFULEdBQXVCLGlCQUFTO0FBQzlCWCxhQUFXWSxLQUFYO0FBQ0QsQ0FGRDs7a0JBSWVYLFEiLCJmaWxlIjoicGFyYWxsZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9wbHVnaW5zL3BhcmFsbGVsLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmxldCB0YXNrVHJlZVxuXG4vKipcbiAqIENyZWF0ZXMgYSBIb3BwLWlzaCBvYmplY3QgdGhhdCBydW5zXG4gKiBzdWJ0YXNrcyBpbiBwYXJhbGxlbC5cbiAqL1xuY29uc3QgcGFyYWxsZWwgPSB0YXNrcyA9PiAoe1xuICAvKipcbiAgICogU3RhcnRzIGFsbCB0YXNrcyBjb25jdXJyZW50bHkuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBqb2lucyBhbGwgdGFzayBwcm9taXNlcyB1bmRlciAuYWxsKClcbiAgICovXG4gIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnkpIHtcbiAgICAvLyBqdXN0IGFzeW5jIGZvciBub3dcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGFza3MubWFwKFxuICAgICAgdGFzayA9PiB0YXNrVHJlZVt0YXNrXS5zdGFydChgJHtuYW1lfToke3Rhc2t9YCwgZGlyZWN0b3J5KVxuICAgICkpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2tzIHRvIEpTT04uXG4gICAqIEp1c3QgY29udmVydHMgdGhlbSBpbnRvIGFuIGFycmF5IG9mXG4gICAqIEpTT04gb2JqZWN0cy5cbiAgICogXG4gICAqIEByZXR1cm4ge0FycmF5fSBcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIFsncGFyYWxsZWwnLCB0YXNrc11cbiAgfVxufSlcblxucGFyYWxsZWwuZGVmaW5lVGFza3MgPSBkZWZucyA9PiB7XG4gIHRhc2tUcmVlID0gZGVmbnNcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyYWxsZWwiXX0=