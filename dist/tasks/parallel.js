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
exports.default = (tasks, taskTree) => ({
  /**
   * Starts all tasks concurrently.
   * 
   * @return {Promise} joins all task promises under .all()
   */
  start(name, directory) {
    this.tasks = tasks;

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
    return this.tasks;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrcyIsInRhc2tUcmVlIiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZSxDQUFDQSxLQUFELEVBQVFDLFFBQVIsTUFBc0I7QUFDbkM7Ozs7O0FBS0FDLFFBQU9DLElBQVAsRUFBYUMsU0FBYixFQUF3QjtBQUN0QixTQUFLSixLQUFMLEdBQWFBLEtBQWI7O0FBRUE7QUFDQSxXQUFPSyxRQUFRQyxHQUFSLENBQVlOLE1BQU1PLEdBQU4sQ0FDakJDLFFBQVFQLFNBQVNPLElBQVQsRUFBZU4sS0FBZixDQUFzQixHQUFFQyxJQUFLLElBQUdLLElBQUssRUFBckMsRUFBd0NKLFNBQXhDLENBRFMsQ0FBWixDQUFQO0FBR0QsR0Fia0M7O0FBZW5DOzs7Ozs7O0FBT0FLLFdBQVU7QUFDUixXQUFPLEtBQUtULEtBQVo7QUFDRDtBQXhCa0MsQ0FBdEIsQyIsImZpbGUiOiJwYXJhbGxlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3BsdWdpbnMvcGFyYWxsZWwuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgSG9wcC1pc2ggb2JqZWN0IHRoYXQgcnVuc1xuICogc3VidGFza3MgaW4gcGFyYWxsZWwuXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICh0YXNrcywgdGFza1RyZWUpID0+ICh7XG4gIC8qKlxuICAgKiBTdGFydHMgYWxsIHRhc2tzIGNvbmN1cnJlbnRseS5cbiAgICogXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IGpvaW5zIGFsbCB0YXNrIHByb21pc2VzIHVuZGVyIC5hbGwoKVxuICAgKi9cbiAgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIHRoaXMudGFza3MgPSB0YXNrc1xuXG4gICAgLy8ganVzdCBhc3luYyBmb3Igbm93XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHRhc2tzLm1hcChcbiAgICAgIHRhc2sgPT4gdGFza1RyZWVbdGFza10uc3RhcnQoYCR7bmFtZX06JHt0YXNrfWAsIGRpcmVjdG9yeSlcbiAgICApKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrcyB0byBKU09OLlxuICAgKiBKdXN0IGNvbnZlcnRzIHRoZW0gaW50byBhbiBhcnJheSBvZlxuICAgKiBKU09OIG9iamVjdHMuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtBcnJheX0gXG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB0aGlzLnRhc2tzXG4gIH1cbn0pIl19