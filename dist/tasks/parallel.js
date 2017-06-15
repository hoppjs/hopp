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
exports.default = (name, tasks, taskTree) => ({
  /**
   * Starts all tasks concurrently.
   * 
   * @return {Promise} joins all task promises under .all()
   */
  start() {
    this.tasks = tasks;

    // just async for now
    return Promise.all(tasks.map(task => taskTree[task].start(`${name}:${task}`)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9wYXJhbGxlbC5qcyJdLCJuYW1lcyI6WyJuYW1lIiwidGFza3MiLCJ0YXNrVHJlZSIsInN0YXJ0IiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRhc2siLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7OztrQkFJZSxDQUFDQSxJQUFELEVBQU9DLEtBQVAsRUFBY0MsUUFBZCxNQUE0QjtBQUN6Qzs7Ozs7QUFLQUMsVUFBUztBQUNQLFNBQUtGLEtBQUwsR0FBYUEsS0FBYjs7QUFFQTtBQUNBLFdBQU9HLFFBQVFDLEdBQVIsQ0FBWUosTUFBTUssR0FBTixDQUNqQkMsUUFBUUwsU0FBU0ssSUFBVCxFQUFlSixLQUFmLENBQXNCLEdBQUVILElBQUssSUFBR08sSUFBSyxFQUFyQyxDQURTLENBQVosQ0FBUDtBQUdELEdBYndDOztBQWV6Qzs7Ozs7OztBQU9BQyxXQUFVO0FBQ1IsV0FBTyxLQUFLUCxLQUFaO0FBQ0Q7QUF4QndDLENBQTVCLEMiLCJmaWxlIjoicGFyYWxsZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9wbHVnaW5zL3BhcmFsbGVsLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIEhvcHAtaXNoIG9iamVjdCB0aGF0IHJ1bnNcbiAqIHN1YnRhc2tzIGluIHBhcmFsbGVsLlxuICovXG5leHBvcnQgZGVmYXVsdCAobmFtZSwgdGFza3MsIHRhc2tUcmVlKSA9PiAoe1xuICAvKipcbiAgICogU3RhcnRzIGFsbCB0YXNrcyBjb25jdXJyZW50bHkuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBqb2lucyBhbGwgdGFzayBwcm9taXNlcyB1bmRlciAuYWxsKClcbiAgICovXG4gIHN0YXJ0ICgpIHtcbiAgICB0aGlzLnRhc2tzID0gdGFza3NcblxuICAgIC8vIGp1c3QgYXN5bmMgZm9yIG5vd1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0YXNrcy5tYXAoXG4gICAgICB0YXNrID0+IHRhc2tUcmVlW3Rhc2tdLnN0YXJ0KGAke25hbWV9OiR7dGFza31gKVxuICAgICkpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2tzIHRvIEpTT04uXG4gICAqIEp1c3QgY29udmVydHMgdGhlbSBpbnRvIGFuIGFycmF5IG9mXG4gICAqIEpTT04gb2JqZWN0cy5cbiAgICogXG4gICAqIEByZXR1cm4ge0FycmF5fSBcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFza3NcbiAgfVxufSkiXX0=