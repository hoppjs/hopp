'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

let taskTree;

/**
 * Creates a Hopp-ish object that runs
 * subtasks in parallel.
 */
const parallel = tasks => ({
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

parallel.defineTasks = defns => {
  taskTree = defns;
};

exports.default = parallel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrVHJlZSIsInBhcmFsbGVsIiwidGFza3MiLCJzdGFydCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayIsInRvSlNPTiIsImRlZmluZVRhc2tzIiwiZGVmbnMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7Ozs7OztBQU1BLElBQUlBLFFBQUo7O0FBRUE7Ozs7QUFJQSxNQUFNQyxXQUFXQyxVQUFVO0FBQ3pCOzs7OztBQUtBQyxRQUFPQyxJQUFQLEVBQWFDLFNBQWIsRUFBd0I7QUFDdEI7QUFDQSxXQUFPQyxRQUFRQyxHQUFSLENBQVlMLE1BQU1NLEdBQU4sQ0FDakJDLFFBQVFULFNBQVNTLElBQVQsRUFBZU4sS0FBZixDQUFzQixHQUFFQyxJQUFLLElBQUdLLElBQUssRUFBckMsRUFBd0NKLFNBQXhDLENBRFMsQ0FBWixDQUFQO0FBR0QsR0FYd0I7O0FBYXpCOzs7Ozs7O0FBT0FLLFdBQVU7QUFDUixXQUFPLENBQUMsVUFBRCxFQUFhUixLQUFiLENBQVA7QUFDRDtBQXRCd0IsQ0FBVixDQUFqQjs7QUF5QkFELFNBQVNVLFdBQVQsR0FBdUJDLFNBQVM7QUFDOUJaLGFBQVdZLEtBQVg7QUFDRCxDQUZEOztrQkFJZVgsUSIsImZpbGUiOiJwYXJhbGxlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3BsdWdpbnMvcGFyYWxsZWwuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxubGV0IHRhc2tUcmVlXG5cbi8qKlxuICogQ3JlYXRlcyBhIEhvcHAtaXNoIG9iamVjdCB0aGF0IHJ1bnNcbiAqIHN1YnRhc2tzIGluIHBhcmFsbGVsLlxuICovXG5jb25zdCBwYXJhbGxlbCA9IHRhc2tzID0+ICh7XG4gIC8qKlxuICAgKiBTdGFydHMgYWxsIHRhc2tzIGNvbmN1cnJlbnRseS5cbiAgICogXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IGpvaW5zIGFsbCB0YXNrIHByb21pc2VzIHVuZGVyIC5hbGwoKVxuICAgKi9cbiAgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIC8vIGp1c3QgYXN5bmMgZm9yIG5vd1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0YXNrcy5tYXAoXG4gICAgICB0YXNrID0+IHRhc2tUcmVlW3Rhc2tdLnN0YXJ0KGAke25hbWV9OiR7dGFza31gLCBkaXJlY3RvcnkpXG4gICAgKSlcbiAgfSxcblxuICAvKipcbiAgICogQ29udmVydHMgdGFza3MgdG8gSlNPTi5cbiAgICogSnVzdCBjb252ZXJ0cyB0aGVtIGludG8gYW4gYXJyYXkgb2ZcbiAgICogSlNPTiBvYmplY3RzLlxuICAgKiBcbiAgICogQHJldHVybiB7QXJyYXl9IFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4gWydwYXJhbGxlbCcsIHRhc2tzXVxuICB9XG59KVxuXG5wYXJhbGxlbC5kZWZpbmVUYXNrcyA9IGRlZm5zID0+IHtcbiAgdGFza1RyZWUgPSBkZWZuc1xufVxuXG5leHBvcnQgZGVmYXVsdCBwYXJhbGxlbCJdfQ==