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
exports.default = function (tasks) {
  return {
    /**
     * Starts all tasks concurrently.
     * 
     * @return {Promise} joins all task promises under .all()
     */
    start: function start() {
      this.tasks = tasks;

      // just async for now
      return Promise.all(tasks.map(function (task) {
        return task.start();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJzdGFydCIsInRhc2tzIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZTtBQUFBLFNBQVU7QUFDdkI7Ozs7O0FBS0FBLFNBTnVCLG1CQU1kO0FBQ1AsV0FBS0MsS0FBTCxHQUFhQSxLQUFiOztBQUVBO0FBQ0EsYUFBT0MsUUFBUUMsR0FBUixDQUFZRixNQUFNRyxHQUFOLENBQ2pCO0FBQUEsZUFBUUMsS0FBS0wsS0FBTCxFQUFSO0FBQUEsT0FEaUIsQ0FBWixDQUFQO0FBR0QsS0Fic0I7OztBQWV2Qjs7Ozs7OztBQU9BTSxVQXRCdUIsb0JBc0JiO0FBQ1IsYUFBTyxLQUFLTCxLQUFaO0FBQ0Q7QUF4QnNCLEdBQVY7QUFBQSxDIiwiZmlsZSI6InBhcmFsbGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvcGx1Z2lucy9wYXJhbGxlbC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBIb3BwLWlzaCBvYmplY3QgdGhhdCBydW5zXG4gKiBzdWJ0YXNrcyBpbiBwYXJhbGxlbC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgdGFza3MgPT4gKHtcbiAgLyoqXG4gICAqIFN0YXJ0cyBhbGwgdGFza3MgY29uY3VycmVudGx5LlxuICAgKiBcbiAgICogQHJldHVybiB7UHJvbWlzZX0gam9pbnMgYWxsIHRhc2sgcHJvbWlzZXMgdW5kZXIgLmFsbCgpXG4gICAqL1xuICBzdGFydCAoKSB7XG4gICAgdGhpcy50YXNrcyA9IHRhc2tzXG5cbiAgICAvLyBqdXN0IGFzeW5jIGZvciBub3dcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGFza3MubWFwKFxuICAgICAgdGFzayA9PiB0YXNrLnN0YXJ0KClcbiAgICApKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrcyB0byBKU09OLlxuICAgKiBKdXN0IGNvbnZlcnRzIHRoZW0gaW50byBhbiBhcnJheSBvZlxuICAgKiBKU09OIG9iamVjdHMuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtBcnJheX0gXG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB0aGlzLnRhc2tzXG4gIH1cbn0pIl19