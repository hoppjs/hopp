'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

var _watch = require('./tasks/watch');

var _watch2 = _interopRequireDefault(_watch);

var _load = require('./plugins/load');

var _load2 = _interopRequireDefault(_load);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

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

    for (let tmp = _path2.default.basename(name), i = 5; i < tmp.length; i += 1) {
      plugName += tmp[i] === '-' ? tmp[i++].toUpperCase() : tmp[i];
    }

    debug('adding plugin %s from %s', plugName, name

    // add the plugin to the hopp prototype so it can be
    // used for the rest of the build process
    );_mgr2.default.prototype[plugName] = function () {
      // instead of actually loading the plugin at this stage,
      // we will just pop its call into our internal call stack
      // for use later. this is useful when we are stepping through
      // an entire hoppfile but might only be running a single task

      this.d.stack.push([name, [].slice.call(arguments)]);

      return this;
    };
  }

  /**
   * Expose hopp class for task creation.
   */
  );const init = src => new _mgr2.default(src);

  init.all = _parallel2.default;
  init.watch = _watch2.default;

  return init;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwicmVxdWlyZSIsImRpcmVjdG9yeSIsImZvckVhY2giLCJuYW1lIiwicGx1Z05hbWUiLCJ0bXAiLCJiYXNlbmFtZSIsImkiLCJsZW5ndGgiLCJ0b1VwcGVyQ2FzZSIsInByb3RvdHlwZSIsImQiLCJzdGFjayIsInB1c2giLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJpbml0Iiwic3JjIiwiYWxsIiwid2F0Y2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU0sRUFBRUEsS0FBRixLQUFZQyxRQUFRLGFBQVIsRUFBdUI7O0FBRXpDOzs7QUFGa0IsQ0FBbEIsQyxDQVpBOzs7Ozs7a0JBaUJlLE1BQU1DLFNBQU4sSUFBbUI7QUFDaEMsR0FBQyxDQUFDLE1BQU0sb0JBQVlBLFNBQVosQ0FBUCxFQUErQkMsT0FBL0IsQ0FBdUNDLFFBQVE7QUFDOUMsUUFBSUMsV0FBVyxFQUFmOztBQUVBLFNBQUssSUFBSUMsTUFBTSxlQUFLQyxRQUFMLENBQWNILElBQWQsQ0FBVixFQUErQkksSUFBSSxDQUF4QyxFQUEyQ0EsSUFBSUYsSUFBSUcsTUFBbkQsRUFBMkRELEtBQUssQ0FBaEUsRUFBbUU7QUFDakVILGtCQUFZQyxJQUFJRSxDQUFKLE1BQVcsR0FBWCxHQUFpQkYsSUFBSUUsR0FBSixFQUFTRSxXQUFULEVBQWpCLEdBQTBDSixJQUFJRSxDQUFKLENBQXREO0FBQ0Q7O0FBRURSLFVBQU0sMEJBQU4sRUFBa0NLLFFBQWxDLEVBQTRDRDs7QUFFNUM7QUFDQTtBQUhBLE1BSUEsY0FBS08sU0FBTCxDQUFlTixRQUFmLElBQTJCLFlBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBS08sQ0FBTCxDQUFPQyxLQUFQLENBQWFDLElBQWIsQ0FBa0IsQ0FDaEJWLElBRGdCLEVBRWhCLEdBQUdXLEtBQUgsQ0FBU0MsSUFBVCxDQUFjQyxTQUFkLENBRmdCLENBQWxCOztBQUtBLGFBQU8sSUFBUDtBQUNELEtBWkQ7QUFhRDs7QUFFRDs7O0FBMUJDLElBNkJELE1BQU1DLE9BQU9DLE9BQU8sa0JBQVNBLEdBQVQsQ0FBcEI7O0FBRUFELE9BQUtFLEdBQUw7QUFDQUYsT0FBS0csS0FBTDs7QUFFQSxTQUFPSCxJQUFQO0FBQ0QsQyIsImZpbGUiOiJob3BwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvaG9wcC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IEhvcHAgZnJvbSAnLi90YXNrcy9tZ3InXG5pbXBvcnQgY3JlYXRlV2F0Y2ggZnJvbSAnLi90YXNrcy93YXRjaCdcbmltcG9ydCBsb2FkUGx1Z2lucyBmcm9tICcuL3BsdWdpbnMvbG9hZCdcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3Rhc2tzL3BhcmFsbGVsJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBDcmVhdGUgaG9wcCBvYmplY3QgYmFzZWQgb24gcGx1Z2lucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgOyhhd2FpdCBsb2FkUGx1Z2lucyhkaXJlY3RvcnkpKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGxldCBwbHVnTmFtZSA9ICcnXG5cbiAgICBmb3IgKGxldCB0bXAgPSBwYXRoLmJhc2VuYW1lKG5hbWUpLCBpID0gNTsgaSA8IHRtcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgcGx1Z05hbWUgKz0gdG1wW2ldID09PSAnLScgPyB0bXBbaSsrXS50b1VwcGVyQ2FzZSgpIDogdG1wW2ldXG4gICAgfVxuXG4gICAgZGVidWcoJ2FkZGluZyBwbHVnaW4gJXMgZnJvbSAlcycsIHBsdWdOYW1lLCBuYW1lKVxuICAgIFxuICAgIC8vIGFkZCB0aGUgcGx1Z2luIHRvIHRoZSBob3BwIHByb3RvdHlwZSBzbyBpdCBjYW4gYmVcbiAgICAvLyB1c2VkIGZvciB0aGUgcmVzdCBvZiB0aGUgYnVpbGQgcHJvY2Vzc1xuICAgIEhvcHAucHJvdG90eXBlW3BsdWdOYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGluc3RlYWQgb2YgYWN0dWFsbHkgbG9hZGluZyB0aGUgcGx1Z2luIGF0IHRoaXMgc3RhZ2UsXG4gICAgICAvLyB3ZSB3aWxsIGp1c3QgcG9wIGl0cyBjYWxsIGludG8gb3VyIGludGVybmFsIGNhbGwgc3RhY2tcbiAgICAgIC8vIGZvciB1c2UgbGF0ZXIuIHRoaXMgaXMgdXNlZnVsIHdoZW4gd2UgYXJlIHN0ZXBwaW5nIHRocm91Z2hcbiAgICAgIC8vIGFuIGVudGlyZSBob3BwZmlsZSBidXQgbWlnaHQgb25seSBiZSBydW5uaW5nIGEgc2luZ2xlIHRhc2tcblxuICAgICAgdGhpcy5kLnN0YWNrLnB1c2goW1xuICAgICAgICBuYW1lLFxuICAgICAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgIF0pXG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9KVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgaG9wcCBjbGFzcyBmb3IgdGFzayBjcmVhdGlvbi5cbiAgICovXG4gIGNvbnN0IGluaXQgPSBzcmMgPT4gbmV3IEhvcHAoc3JjKVxuICBcbiAgaW5pdC5hbGwgPSBjcmVhdGVQYXJhbGxlbFxuICBpbml0LndhdGNoID0gY3JlYXRlV2F0Y2hcblxuICByZXR1cm4gaW5pdFxufSJdfQ==