'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

let taskTree;
let bustedTasks;

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
    return Promise.all(tasks.map(task => taskTree[task].start(`${name}:${task}`, directory, !!bustedTasks[task])));
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

parallel.defineTasks = (defns, busted) => {
  taskTree = defns;
  bustedTasks = busted;
};

exports.default = parallel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJ0YXNrVHJlZSIsImJ1c3RlZFRhc2tzIiwicGFyYWxsZWwiLCJ0YXNrcyIsInN0YXJ0IiwibmFtZSIsImRpcmVjdG9yeSIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0YXNrIiwidG9KU09OIiwiZGVmaW5lVGFza3MiLCJkZWZucyIsImJ1c3RlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Ozs7O0FBTUEsSUFBSUEsUUFBSjtBQUNBLElBQUlDLFdBQUo7O0FBRUE7Ozs7QUFJQSxNQUFNQyxXQUFXQyxVQUFVO0FBQ3pCOzs7OztBQUtBQyxRQUFPQyxJQUFQLEVBQWFDLFNBQWIsRUFBd0I7QUFDdEI7QUFDQSxXQUFPQyxRQUFRQyxHQUFSLENBQVlMLE1BQU1NLEdBQU4sQ0FDakJDLFFBQVFWLFNBQVNVLElBQVQsRUFBZU4sS0FBZixDQUFzQixHQUFFQyxJQUFLLElBQUdLLElBQUssRUFBckMsRUFBd0NKLFNBQXhDLEVBQW1ELENBQUMsQ0FBQ0wsWUFBWVMsSUFBWixDQUFyRCxDQURTLENBQVosQ0FBUDtBQUdELEdBWHdCOztBQWF6Qjs7Ozs7OztBQU9BQyxXQUFVO0FBQ1IsV0FBTyxDQUFDLFVBQUQsRUFBYVIsS0FBYixDQUFQO0FBQ0Q7QUF0QndCLENBQVYsQ0FBakI7O0FBeUJBRCxTQUFTVSxXQUFULEdBQXVCLENBQUNDLEtBQUQsRUFBUUMsTUFBUixLQUFtQjtBQUN4Q2QsYUFBV2EsS0FBWDtBQUNBWixnQkFBY2EsTUFBZDtBQUNELENBSEQ7O2tCQUtlWixRIiwiZmlsZSI6InBhcmFsbGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvcGx1Z2lucy9wYXJhbGxlbC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5sZXQgdGFza1RyZWVcbmxldCBidXN0ZWRUYXNrc1xuXG4vKipcbiAqIENyZWF0ZXMgYSBIb3BwLWlzaCBvYmplY3QgdGhhdCBydW5zXG4gKiBzdWJ0YXNrcyBpbiBwYXJhbGxlbC5cbiAqL1xuY29uc3QgcGFyYWxsZWwgPSB0YXNrcyA9PiAoe1xuICAvKipcbiAgICogU3RhcnRzIGFsbCB0YXNrcyBjb25jdXJyZW50bHkuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBqb2lucyBhbGwgdGFzayBwcm9taXNlcyB1bmRlciAuYWxsKClcbiAgICovXG4gIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnkpIHtcbiAgICAvLyBqdXN0IGFzeW5jIGZvciBub3dcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGFza3MubWFwKFxuICAgICAgdGFzayA9PiB0YXNrVHJlZVt0YXNrXS5zdGFydChgJHtuYW1lfToke3Rhc2t9YCwgZGlyZWN0b3J5LCAhIWJ1c3RlZFRhc2tzW3Rhc2tdKVxuICAgICkpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2tzIHRvIEpTT04uXG4gICAqIEp1c3QgY29udmVydHMgdGhlbSBpbnRvIGFuIGFycmF5IG9mXG4gICAqIEpTT04gb2JqZWN0cy5cbiAgICogXG4gICAqIEByZXR1cm4ge0FycmF5fSBcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIFsncGFyYWxsZWwnLCB0YXNrc11cbiAgfVxufSlcblxucGFyYWxsZWwuZGVmaW5lVGFza3MgPSAoZGVmbnMsIGJ1c3RlZCkgPT4ge1xuICB0YXNrVHJlZSA9IGRlZm5zXG4gIGJ1c3RlZFRhc2tzID0gYnVzdGVkXG59XG5cbmV4cG9ydCBkZWZhdWx0IHBhcmFsbGVsXG4iXX0=