"use strict";

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
      this.tasks = tasks;

      // just async for now
      return Promise.all(tasks.map(function (task) {
        return taskTree[task].start(name + ":" + task, directory);
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
      return this.tasks;
    }
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrcyIsInRhc2tUcmVlIiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZSxVQUFDQSxLQUFELEVBQVFDLFFBQVI7QUFBQSxTQUFzQjtBQUNuQzs7Ozs7QUFLQUMsU0FObUMsaUJBTTVCQyxJQU40QixFQU10QkMsU0FOc0IsRUFNWDtBQUN0QixXQUFLSixLQUFMLEdBQWFBLEtBQWI7O0FBRUE7QUFDQSxhQUFPSyxRQUFRQyxHQUFSLENBQVlOLE1BQU1PLEdBQU4sQ0FDakI7QUFBQSxlQUFRTixTQUFTTyxJQUFULEVBQWVOLEtBQWYsQ0FBd0JDLElBQXhCLFNBQWdDSyxJQUFoQyxFQUF3Q0osU0FBeEMsQ0FBUjtBQUFBLE9BRGlCLENBQVosQ0FBUDtBQUdELEtBYmtDOzs7QUFlbkM7Ozs7Ozs7QUFPQUssVUF0Qm1DLG9CQXNCekI7QUFDUixhQUFPLEtBQUtULEtBQVo7QUFDRDtBQXhCa0MsR0FBdEI7QUFBQSxDIiwiZmlsZSI6InBhcmFsbGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvcGx1Z2lucy9wYXJhbGxlbC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBIb3BwLWlzaCBvYmplY3QgdGhhdCBydW5zXG4gKiBzdWJ0YXNrcyBpbiBwYXJhbGxlbC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKHRhc2tzLCB0YXNrVHJlZSkgPT4gKHtcbiAgLyoqXG4gICAqIFN0YXJ0cyBhbGwgdGFza3MgY29uY3VycmVudGx5LlxuICAgKiBcbiAgICogQHJldHVybiB7UHJvbWlzZX0gam9pbnMgYWxsIHRhc2sgcHJvbWlzZXMgdW5kZXIgLmFsbCgpXG4gICAqL1xuICBzdGFydCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgdGhpcy50YXNrcyA9IHRhc2tzXG5cbiAgICAvLyBqdXN0IGFzeW5jIGZvciBub3dcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGFza3MubWFwKFxuICAgICAgdGFzayA9PiB0YXNrVHJlZVt0YXNrXS5zdGFydChgJHtuYW1lfToke3Rhc2t9YCwgZGlyZWN0b3J5KVxuICAgICkpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2tzIHRvIEpTT04uXG4gICAqIEp1c3QgY29udmVydHMgdGhlbSBpbnRvIGFuIGFycmF5IG9mXG4gICAqIEpTT04gb2JqZWN0cy5cbiAgICogXG4gICAqIEByZXR1cm4ge0FycmF5fSBcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFza3NcbiAgfVxufSkiXX0=