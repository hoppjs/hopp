'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _load = require('./plugins/load');

var _load2 = _interopRequireDefault(_load);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { debug } = require('./utils/log')('hopp'

/**
 * Create hopp object based on plugins.
 */
); /**
    * @file src/hopp.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */

exports.default = async directory => {
  ;(await (0, _load2.default)(directory)).forEach(name => {
    let plugName = '';

    for (let i = 5; i < name.length; i += 1) {
      plugName += name[i] === '-' ? name[i++].toUpperCase() : name[i];
    }

    debug('adding plugin %s', name

    // add the plugin to the hopp prototype so it can be
    // used for the rest of the build process
    );_mgr2.default.prototype[plugName] = function () {
      // instead of actually loading the plugin at this stage,
      // we will just pop its call into our internal call stack
      // for use later. this is useful when we are stepping through
      // an entire hoppfile but might only be running a single task

      this.callStack.push([name, arguments]);

      return this;
    };
  }

  /**
   * Expose hopp class for task creation.
   */
  );return src => new _mgr2.default(src);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwicmVxdWlyZSIsImRpcmVjdG9yeSIsImZvckVhY2giLCJuYW1lIiwicGx1Z05hbWUiLCJpIiwibGVuZ3RoIiwidG9VcHBlckNhc2UiLCJwcm90b3R5cGUiLCJjYWxsU3RhY2siLCJwdXNoIiwiYXJndW1lbnRzIiwic3JjIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU0sRUFBRUEsS0FBRixLQUFZQyxRQUFRLGFBQVIsRUFBdUI7O0FBRXpDOzs7QUFGa0IsQ0FBbEIsQyxDQVZBOzs7Ozs7a0JBZWUsTUFBTUMsU0FBTixJQUFtQjtBQUNoQyxHQUFDLENBQUMsTUFBTSxvQkFBWUEsU0FBWixDQUFQLEVBQStCQyxPQUEvQixDQUF1Q0MsUUFBUTtBQUM5QyxRQUFJQyxXQUFXLEVBQWY7O0FBRUEsU0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLEtBQUtHLE1BQXpCLEVBQWlDRCxLQUFLLENBQXRDLEVBQXlDO0FBQ3ZDRCxrQkFBWUQsS0FBS0UsQ0FBTCxNQUFZLEdBQVosR0FBa0JGLEtBQUtFLEdBQUwsRUFBVUUsV0FBVixFQUFsQixHQUE0Q0osS0FBS0UsQ0FBTCxDQUF4RDtBQUNEOztBQUVETixVQUFNLGtCQUFOLEVBQTBCSTs7QUFFMUI7QUFDQTtBQUhBLE1BSUEsY0FBS0ssU0FBTCxDQUFlSixRQUFmLElBQTJCLFlBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBS0ssU0FBTCxDQUFlQyxJQUFmLENBQW9CLENBQ2xCUCxJQURrQixFQUVsQlEsU0FGa0IsQ0FBcEI7O0FBS0EsYUFBTyxJQUFQO0FBQ0QsS0FaRDtBQWFEOztBQUVEOzs7QUExQkMsSUE2QkQsT0FBT0MsT0FBTyxrQkFBU0EsR0FBVCxDQUFkO0FBQ0QsQyIsImZpbGUiOiJob3BwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvaG9wcC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGxvYWRQbHVnaW5zIGZyb20gJy4vcGx1Z2lucy9sb2FkJ1xuaW1wb3J0IEhvcHAgZnJvbSAnLi90YXNrcy9tZ3InXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG4vKipcbiAqIENyZWF0ZSBob3BwIG9iamVjdCBiYXNlZCBvbiBwbHVnaW5zLlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICA7KGF3YWl0IGxvYWRQbHVnaW5zKGRpcmVjdG9yeSkpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgbGV0IHBsdWdOYW1lID0gJydcblxuICAgIGZvciAobGV0IGkgPSA1OyBpIDwgbmFtZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgcGx1Z05hbWUgKz0gbmFtZVtpXSA9PT0gJy0nID8gbmFtZVtpKytdLnRvVXBwZXJDYXNlKCkgOiBuYW1lW2ldXG4gICAgfVxuXG4gICAgZGVidWcoJ2FkZGluZyBwbHVnaW4gJXMnLCBuYW1lKVxuICAgIFxuICAgIC8vIGFkZCB0aGUgcGx1Z2luIHRvIHRoZSBob3BwIHByb3RvdHlwZSBzbyBpdCBjYW4gYmVcbiAgICAvLyB1c2VkIGZvciB0aGUgcmVzdCBvZiB0aGUgYnVpbGQgcHJvY2Vzc1xuICAgIEhvcHAucHJvdG90eXBlW3BsdWdOYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGluc3RlYWQgb2YgYWN0dWFsbHkgbG9hZGluZyB0aGUgcGx1Z2luIGF0IHRoaXMgc3RhZ2UsXG4gICAgICAvLyB3ZSB3aWxsIGp1c3QgcG9wIGl0cyBjYWxsIGludG8gb3VyIGludGVybmFsIGNhbGwgc3RhY2tcbiAgICAgIC8vIGZvciB1c2UgbGF0ZXIuIHRoaXMgaXMgdXNlZnVsIHdoZW4gd2UgYXJlIHN0ZXBwaW5nIHRocm91Z2hcbiAgICAgIC8vIGFuIGVudGlyZSBob3BwZmlsZSBidXQgbWlnaHQgb25seSBiZSBydW5uaW5nIGEgc2luZ2xlIHRhc2tcblxuICAgICAgdGhpcy5jYWxsU3RhY2sucHVzaChbXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGFyZ3VtZW50c1xuICAgICAgXSlcblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH0pXG5cbiAgLyoqXG4gICAqIEV4cG9zZSBob3BwIGNsYXNzIGZvciB0YXNrIGNyZWF0aW9uLlxuICAgKi9cbiAgcmV0dXJuIHNyYyA9PiBuZXcgSG9wcChzcmMpXG59Il19