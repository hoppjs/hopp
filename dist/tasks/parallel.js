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
exports.default = tasks => ({
  /**
   * Starts all tasks concurrently.
   * 
   * @return {Promise} joins all task promises under .all()
   */
  start() {
    this.tasks = tasks;

    // just async for now
    return Promise.all(tasks.map(task => task.start()));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrcyIsInN0YXJ0IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZUEsVUFBVTtBQUN2Qjs7Ozs7QUFLQUMsVUFBUztBQUNQLFNBQUtELEtBQUwsR0FBYUEsS0FBYjs7QUFFQTtBQUNBLFdBQU9FLFFBQVFDLEdBQVIsQ0FBWUgsTUFBTUksR0FBTixDQUNqQkMsUUFBUUEsS0FBS0osS0FBTCxFQURTLENBQVosQ0FBUDtBQUdELEdBYnNCOztBQWV2Qjs7Ozs7OztBQU9BSyxXQUFVO0FBQ1IsV0FBTyxLQUFLTixLQUFaO0FBQ0Q7QUF4QnNCLENBQVYsQyIsImZpbGUiOiJwYXJhbGxlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3BsdWdpbnMvcGFyYWxsZWwuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgSG9wcC1pc2ggb2JqZWN0IHRoYXQgcnVuc1xuICogc3VidGFza3MgaW4gcGFyYWxsZWwuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IHRhc2tzID0+ICh7XG4gIC8qKlxuICAgKiBTdGFydHMgYWxsIHRhc2tzIGNvbmN1cnJlbnRseS5cbiAgICogXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IGpvaW5zIGFsbCB0YXNrIHByb21pc2VzIHVuZGVyIC5hbGwoKVxuICAgKi9cbiAgc3RhcnQgKCkge1xuICAgIHRoaXMudGFza3MgPSB0YXNrc1xuXG4gICAgLy8ganVzdCBhc3luYyBmb3Igbm93XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHRhc2tzLm1hcChcbiAgICAgIHRhc2sgPT4gdGFzay5zdGFydCgpXG4gICAgKSlcbiAgfSxcblxuICAvKipcbiAgICogQ29udmVydHMgdGFza3MgdG8gSlNPTi5cbiAgICogSnVzdCBjb252ZXJ0cyB0aGVtIGludG8gYW4gYXJyYXkgb2ZcbiAgICogSlNPTiBvYmplY3RzLlxuICAgKiBcbiAgICogQHJldHVybiB7QXJyYXl9IFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4gdGhpcy50YXNrc1xuICB9XG59KSJdfQ==