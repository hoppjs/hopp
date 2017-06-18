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
  );const init = src => new _mgr2.default(src);

  init.all = _parallel2.default;
  init.watch = _watch2.default;

  return init;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwicmVxdWlyZSIsImRpcmVjdG9yeSIsImZvckVhY2giLCJuYW1lIiwicGx1Z05hbWUiLCJpIiwibGVuZ3RoIiwidG9VcHBlckNhc2UiLCJwcm90b3R5cGUiLCJjYWxsU3RhY2siLCJwdXNoIiwiYXJndW1lbnRzIiwiaW5pdCIsInNyYyIsImFsbCIsIndhdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNLEVBQUVBLEtBQUYsS0FBWUMsUUFBUSxhQUFSLEVBQXVCOztBQUV6Qzs7O0FBRmtCLENBQWxCLEMsQ0FaQTs7Ozs7O2tCQWlCZSxNQUFNQyxTQUFOLElBQW1CO0FBQ2hDLEdBQUMsQ0FBQyxNQUFNLG9CQUFZQSxTQUFaLENBQVAsRUFBK0JDLE9BQS9CLENBQXVDQyxRQUFRO0FBQzlDLFFBQUlDLFdBQVcsRUFBZjs7QUFFQSxTQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsS0FBS0csTUFBekIsRUFBaUNELEtBQUssQ0FBdEMsRUFBeUM7QUFDdkNELGtCQUFZRCxLQUFLRSxDQUFMLE1BQVksR0FBWixHQUFrQkYsS0FBS0UsR0FBTCxFQUFVRSxXQUFWLEVBQWxCLEdBQTRDSixLQUFLRSxDQUFMLENBQXhEO0FBQ0Q7O0FBRUROLFVBQU0sa0JBQU4sRUFBMEJJOztBQUUxQjtBQUNBO0FBSEEsTUFJQSxjQUFLSyxTQUFMLENBQWVKLFFBQWYsSUFBMkIsWUFBWTtBQUNyQztBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFLSyxTQUFMLENBQWVDLElBQWYsQ0FBb0IsQ0FDbEJQLElBRGtCLEVBRWxCUSxTQUZrQixDQUFwQjs7QUFLQSxhQUFPLElBQVA7QUFDRCxLQVpEO0FBYUQ7O0FBRUQ7OztBQTFCQyxJQTZCRCxNQUFNQyxPQUFPQyxPQUFPLGtCQUFTQSxHQUFULENBQXBCOztBQUVBRCxPQUFLRSxHQUFMO0FBQ0FGLE9BQUtHLEtBQUw7O0FBRUEsU0FBT0gsSUFBUDtBQUNELEMiLCJmaWxlIjoiaG9wcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2hvcHAuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBIb3BwIGZyb20gJy4vdGFza3MvbWdyJ1xuaW1wb3J0IGNyZWF0ZVdhdGNoIGZyb20gJy4vdGFza3Mvd2F0Y2gnXG5pbXBvcnQgbG9hZFBsdWdpbnMgZnJvbSAnLi9wbHVnaW5zL2xvYWQnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi90YXNrcy9wYXJhbGxlbCdcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5cbi8qKlxuICogQ3JlYXRlIGhvcHAgb2JqZWN0IGJhc2VkIG9uIHBsdWdpbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIDsoYXdhaXQgbG9hZFBsdWdpbnMoZGlyZWN0b3J5KSkuZm9yRWFjaChuYW1lID0+IHtcbiAgICBsZXQgcGx1Z05hbWUgPSAnJ1xuXG4gICAgZm9yIChsZXQgaSA9IDU7IGkgPCBuYW1lLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBwbHVnTmFtZSArPSBuYW1lW2ldID09PSAnLScgPyBuYW1lW2krK10udG9VcHBlckNhc2UoKSA6IG5hbWVbaV1cbiAgICB9XG5cbiAgICBkZWJ1ZygnYWRkaW5nIHBsdWdpbiAlcycsIG5hbWUpXG4gICAgXG4gICAgLy8gYWRkIHRoZSBwbHVnaW4gdG8gdGhlIGhvcHAgcHJvdG90eXBlIHNvIGl0IGNhbiBiZVxuICAgIC8vIHVzZWQgZm9yIHRoZSByZXN0IG9mIHRoZSBidWlsZCBwcm9jZXNzXG4gICAgSG9wcC5wcm90b3R5cGVbcGx1Z05hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gaW5zdGVhZCBvZiBhY3R1YWxseSBsb2FkaW5nIHRoZSBwbHVnaW4gYXQgdGhpcyBzdGFnZSxcbiAgICAgIC8vIHdlIHdpbGwganVzdCBwb3AgaXRzIGNhbGwgaW50byBvdXIgaW50ZXJuYWwgY2FsbCBzdGFja1xuICAgICAgLy8gZm9yIHVzZSBsYXRlci4gdGhpcyBpcyB1c2VmdWwgd2hlbiB3ZSBhcmUgc3RlcHBpbmcgdGhyb3VnaFxuICAgICAgLy8gYW4gZW50aXJlIGhvcHBmaWxlIGJ1dCBtaWdodCBvbmx5IGJlIHJ1bm5pbmcgYSBzaW5nbGUgdGFza1xuXG4gICAgICB0aGlzLmNhbGxTdGFjay5wdXNoKFtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgYXJndW1lbnRzXG4gICAgICBdKVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICAvKipcbiAgICogRXhwb3NlIGhvcHAgY2xhc3MgZm9yIHRhc2sgY3JlYXRpb24uXG4gICAqL1xuICBjb25zdCBpbml0ID0gc3JjID0+IG5ldyBIb3BwKHNyYylcbiAgXG4gIGluaXQuYWxsID0gY3JlYXRlUGFyYWxsZWxcbiAgaW5pdC53YXRjaCA9IGNyZWF0ZVdhdGNoXG5cbiAgcmV0dXJuIGluaXRcbn0iXX0=