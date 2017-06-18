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
exports.default = (tasks, taskTree) => ({
  /**
   * Starts all tasks concurrently.
   * 
   * @return {Promise} joins all task promises under .all()
   */
  start(name, directory) {
    // just async for now
    return Promise.all(tasks.map(task => taskTree[task].start(`${name}:${task}`, directory)));
  },

  /**
   * Converts tasks to JSON.
   * Just converts them into an array of
   * JSON objects.
   * 
   * @return {Array} 
   */
  toJSON() {
    return ['parallel', tasks];
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrcyIsInRhc2tUcmVlIiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZSxDQUFDQSxLQUFELEVBQVFDLFFBQVIsTUFBc0I7QUFDbkM7Ozs7O0FBS0FDLFFBQU9DLElBQVAsRUFBYUMsU0FBYixFQUF3QjtBQUN0QjtBQUNBLFdBQU9DLFFBQVFDLEdBQVIsQ0FBWU4sTUFBTU8sR0FBTixDQUNqQkMsUUFBUVAsU0FBU08sSUFBVCxFQUFlTixLQUFmLENBQXNCLEdBQUVDLElBQUssSUFBR0ssSUFBSyxFQUFyQyxFQUF3Q0osU0FBeEMsQ0FEUyxDQUFaLENBQVA7QUFHRCxHQVhrQzs7QUFhbkM7Ozs7Ozs7QUFPQUssV0FBVTtBQUNSLFdBQU8sQ0FBQyxVQUFELEVBQWFULEtBQWIsQ0FBUDtBQUNEO0FBdEJrQyxDQUF0QixDIiwiZmlsZSI6InBhcmFsbGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvcGx1Z2lucy9wYXJhbGxlbC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBIb3BwLWlzaCBvYmplY3QgdGhhdCBydW5zXG4gKiBzdWJ0YXNrcyBpbiBwYXJhbGxlbC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKHRhc2tzLCB0YXNrVHJlZSkgPT4gKHtcbiAgLyoqXG4gICAqIFN0YXJ0cyBhbGwgdGFza3MgY29uY3VycmVudGx5LlxuICAgKiBcbiAgICogQHJldHVybiB7UHJvbWlzZX0gam9pbnMgYWxsIHRhc2sgcHJvbWlzZXMgdW5kZXIgLmFsbCgpXG4gICAqL1xuICBzdGFydCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgLy8ganVzdCBhc3luYyBmb3Igbm93XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHRhc2tzLm1hcChcbiAgICAgIHRhc2sgPT4gdGFza1RyZWVbdGFza10uc3RhcnQoYCR7bmFtZX06JHt0YXNrfWAsIGRpcmVjdG9yeSlcbiAgICApKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrcyB0byBKU09OLlxuICAgKiBKdXN0IGNvbnZlcnRzIHRoZW0gaW50byBhbiBhcnJheSBvZlxuICAgKiBKU09OIG9iamVjdHMuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtBcnJheX0gXG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiBbJ3BhcmFsbGVsJywgdGFza3NdXG4gIH1cbn0pIl19