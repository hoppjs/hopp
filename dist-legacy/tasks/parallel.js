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
exports.default = function (name, tasks, taskTree) {
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
        return taskTree[task].start(name + ":" + task);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJuYW1lIiwidGFza3MiLCJ0YXNrVHJlZSIsInN0YXJ0IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZSxVQUFDQSxJQUFELEVBQU9DLEtBQVAsRUFBY0MsUUFBZDtBQUFBLFNBQTRCO0FBQ3pDOzs7OztBQUtBQyxTQU55QyxtQkFNaEM7QUFDUCxXQUFLRixLQUFMLEdBQWFBLEtBQWI7O0FBRUE7QUFDQSxhQUFPRyxRQUFRQyxHQUFSLENBQVlKLE1BQU1LLEdBQU4sQ0FDakI7QUFBQSxlQUFRSixTQUFTSyxJQUFULEVBQWVKLEtBQWYsQ0FBd0JILElBQXhCLFNBQWdDTyxJQUFoQyxDQUFSO0FBQUEsT0FEaUIsQ0FBWixDQUFQO0FBR0QsS0Fid0M7OztBQWV6Qzs7Ozs7OztBQU9BQyxVQXRCeUMsb0JBc0IvQjtBQUNSLGFBQU8sS0FBS1AsS0FBWjtBQUNEO0FBeEJ3QyxHQUE1QjtBQUFBLEMiLCJmaWxlIjoicGFyYWxsZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9wbHVnaW5zL3BhcmFsbGVsLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIEhvcHAtaXNoIG9iamVjdCB0aGF0IHJ1bnNcbiAqIHN1YnRhc2tzIGluIHBhcmFsbGVsLlxuICovXG5leHBvcnQgZGVmYXVsdCAobmFtZSwgdGFza3MsIHRhc2tUcmVlKSA9PiAoe1xuICAvKipcbiAgICogU3RhcnRzIGFsbCB0YXNrcyBjb25jdXJyZW50bHkuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBqb2lucyBhbGwgdGFzayBwcm9taXNlcyB1bmRlciAuYWxsKClcbiAgICovXG4gIHN0YXJ0ICgpIHtcbiAgICB0aGlzLnRhc2tzID0gdGFza3NcblxuICAgIC8vIGp1c3QgYXN5bmMgZm9yIG5vd1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0YXNrcy5tYXAoXG4gICAgICB0YXNrID0+IHRhc2tUcmVlW3Rhc2tdLnN0YXJ0KGAke25hbWV9OiR7dGFza31gKVxuICAgICkpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2tzIHRvIEpTT04uXG4gICAqIEp1c3QgY29udmVydHMgdGhlbSBpbnRvIGFuIGFycmF5IG9mXG4gICAqIEpTT04gb2JqZWN0cy5cbiAgICogXG4gICAqIEByZXR1cm4ge0FycmF5fSBcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFza3NcbiAgfVxufSkiXX0=