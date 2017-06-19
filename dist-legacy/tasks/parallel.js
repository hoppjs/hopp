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
var bustedTasks = void 0;

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
        return taskTree[task].start(name + ':' + task, directory, !!bustedTasks[task]);
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

parallel.defineTasks = function (defns, busted) {
  taskTree = defns;
  bustedTasks = busted;
};

exports.default = parallel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrVHJlZSIsImJ1c3RlZFRhc2tzIiwicGFyYWxsZWwiLCJzdGFydCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJQcm9taXNlIiwiYWxsIiwidGFza3MiLCJtYXAiLCJ0YXNrIiwidG9KU09OIiwiZGVmaW5lVGFza3MiLCJkZWZucyIsImJ1c3RlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Ozs7O0FBTUEsSUFBSUEsaUJBQUo7QUFDQSxJQUFJQyxvQkFBSjs7QUFFQTs7OztBQUlBLElBQU1DLFdBQVcsU0FBWEEsUUFBVztBQUFBLFNBQVU7QUFDekI7Ozs7O0FBS0FDLFNBTnlCLGlCQU1sQkMsSUFOa0IsRUFNWkMsU0FOWSxFQU1EO0FBQ3RCO0FBQ0EsYUFBT0MsUUFBUUMsR0FBUixDQUFZQyxNQUFNQyxHQUFOLENBQ2pCO0FBQUEsZUFBUVQsU0FBU1UsSUFBVCxFQUFlUCxLQUFmLENBQXdCQyxJQUF4QixTQUFnQ00sSUFBaEMsRUFBd0NMLFNBQXhDLEVBQW1ELENBQUMsQ0FBQ0osWUFBWVMsSUFBWixDQUFyRCxDQUFSO0FBQUEsT0FEaUIsQ0FBWixDQUFQO0FBR0QsS0FYd0I7OztBQWF6Qjs7Ozs7OztBQU9BQyxVQXBCeUIsb0JBb0JmO0FBQ1IsYUFBTyxDQUFDLFVBQUQsRUFBYUgsS0FBYixDQUFQO0FBQ0Q7QUF0QndCLEdBQVY7QUFBQSxDQUFqQjs7QUF5QkFOLFNBQVNVLFdBQVQsR0FBdUIsVUFBQ0MsS0FBRCxFQUFRQyxNQUFSLEVBQW1CO0FBQ3hDZCxhQUFXYSxLQUFYO0FBQ0FaLGdCQUFjYSxNQUFkO0FBQ0QsQ0FIRDs7a0JBS2VaLFEiLCJmaWxlIjoicGFyYWxsZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9wbHVnaW5zL3BhcmFsbGVsLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmxldCB0YXNrVHJlZVxubGV0IGJ1c3RlZFRhc2tzXG5cbi8qKlxuICogQ3JlYXRlcyBhIEhvcHAtaXNoIG9iamVjdCB0aGF0IHJ1bnNcbiAqIHN1YnRhc2tzIGluIHBhcmFsbGVsLlxuICovXG5jb25zdCBwYXJhbGxlbCA9IHRhc2tzID0+ICh7XG4gIC8qKlxuICAgKiBTdGFydHMgYWxsIHRhc2tzIGNvbmN1cnJlbnRseS5cbiAgICogXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IGpvaW5zIGFsbCB0YXNrIHByb21pc2VzIHVuZGVyIC5hbGwoKVxuICAgKi9cbiAgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIC8vIGp1c3QgYXN5bmMgZm9yIG5vd1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0YXNrcy5tYXAoXG4gICAgICB0YXNrID0+IHRhc2tUcmVlW3Rhc2tdLnN0YXJ0KGAke25hbWV9OiR7dGFza31gLCBkaXJlY3RvcnksICEhYnVzdGVkVGFza3NbdGFza10pXG4gICAgKSlcbiAgfSxcblxuICAvKipcbiAgICogQ29udmVydHMgdGFza3MgdG8gSlNPTi5cbiAgICogSnVzdCBjb252ZXJ0cyB0aGVtIGludG8gYW4gYXJyYXkgb2ZcbiAgICogSlNPTiBvYmplY3RzLlxuICAgKiBcbiAgICogQHJldHVybiB7QXJyYXl9IFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4gWydwYXJhbGxlbCcsIHRhc2tzXVxuICB9XG59KVxuXG5wYXJhbGxlbC5kZWZpbmVUYXNrcyA9IChkZWZucywgYnVzdGVkKSA9PiB7XG4gIHRhc2tUcmVlID0gZGVmbnNcbiAgYnVzdGVkVGFza3MgPSBidXN0ZWRcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyYWxsZWwiXX0=