'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _goal = require('./goal');

var Goal = _interopRequireWildcard(_goal);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Creates a Hopp-ish object that runs
 * subtasks in watch mode.
 */
exports.default = function (tasks) {
  return {
    /**
     * Starts all tasks in watch mode.
     * 
     * @return {Promise} joins all watch promises under .all()
     */
    start: function start(name, directory) {
      return Goal.create(tasks, directory, 'watch');
    },


    /**
     * Converts tasks to JSON.
     * Just converts them into an array of
     * JSON objects.
     * 
     * @return {Array} 
     */
    toJSON: function toJSON() {
      return tasks;
    }
  };
}; /**
    * @file src/plugins/watch.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy93YXRjaC5qcyJdLCJuYW1lcyI6WyJHb2FsIiwic3RhcnQiLCJuYW1lIiwiZGlyZWN0b3J5IiwiY3JlYXRlIiwidGFza3MiLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztJQUFZQSxJOzs7O0FBRVo7Ozs7a0JBSWU7QUFBQSxTQUFVO0FBQ3ZCOzs7OztBQUtBQyxTQU51QixpQkFNaEJDLElBTmdCLEVBTVZDLFNBTlUsRUFNQztBQUN0QixhQUFPSCxLQUFLSSxNQUFMLENBQVlDLEtBQVosRUFBbUJGLFNBQW5CLEVBQThCLE9BQTlCLENBQVA7QUFDRCxLQVJzQjs7O0FBVXZCOzs7Ozs7O0FBT0FHLFVBakJ1QixvQkFpQmI7QUFDUixhQUFPRCxLQUFQO0FBQ0Q7QUFuQnNCLEdBQVY7QUFBQSxDLEVBWmYiLCJmaWxlIjoid2F0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9wbHVnaW5zL3dhdGNoLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCAqIGFzIEdvYWwgZnJvbSAnLi9nb2FsJ1xuXG4vKipcbiAqIENyZWF0ZXMgYSBIb3BwLWlzaCBvYmplY3QgdGhhdCBydW5zXG4gKiBzdWJ0YXNrcyBpbiB3YXRjaCBtb2RlLlxuICovXG5leHBvcnQgZGVmYXVsdCB0YXNrcyA9PiAoe1xuICAvKipcbiAgICogU3RhcnRzIGFsbCB0YXNrcyBpbiB3YXRjaCBtb2RlLlxuICAgKiBcbiAgICogQHJldHVybiB7UHJvbWlzZX0gam9pbnMgYWxsIHdhdGNoIHByb21pc2VzIHVuZGVyIC5hbGwoKVxuICAgKi9cbiAgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIHJldHVybiBHb2FsLmNyZWF0ZSh0YXNrcywgZGlyZWN0b3J5LCAnd2F0Y2gnKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrcyB0byBKU09OLlxuICAgKiBKdXN0IGNvbnZlcnRzIHRoZW0gaW50byBhbiBhcnJheSBvZlxuICAgKiBKU09OIG9iamVjdHMuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtBcnJheX0gXG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB0YXNrc1xuICB9XG59KSJdfQ==