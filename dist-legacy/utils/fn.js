"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * @file src/utils/fn.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Makes async functions deterministic.
 */
exports.default = function (fn) {
  var cache = {};

  return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var args,
        last,
        val,
        i,
        a,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            args = [].slice.call(_args);
            last = args.pop();
            val = cache;

            for (i = 0, a = args[0]; i < args.length; i += 1, a = args[i]) {
              val = val[a] = val[a] || {};
            }

            if (val.hasOwnProperty(last)) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return fn.apply(this, args.concat([last]));

          case 7:
            return _context.abrupt("return", val[last] = _context.sent);

          case 8:
            return _context.abrupt("return", val[last]);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9mbi5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImFyZ3MiLCJzbGljZSIsImNhbGwiLCJsYXN0IiwicG9wIiwidmFsIiwiaSIsImEiLCJsZW5ndGgiLCJoYXNPd25Qcm9wZXJ0eSIsImZuIiwiYXBwbHkiLCJjb25jYXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7OztBQU1BOzs7a0JBR2UsY0FBTTtBQUNuQixNQUFNQSxRQUFRLEVBQWQ7O0FBRUEsbURBQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNDQyxnQkFERCxHQUNRLEdBQUdDLEtBQUgsQ0FBU0MsSUFBVCxPQURSO0FBRUNDLGdCQUZELEdBRVFILEtBQUtJLEdBQUwsRUFGUjtBQUlEQyxlQUpDLEdBSUtOLEtBSkw7O0FBS0wsaUJBQVNPLENBQVQsR0FBYSxDQUFiLEVBQWdCQyxDQUFoQixHQUFvQlAsS0FBSyxDQUFMLENBQXBCLEVBQTZCTSxJQUFJTixLQUFLUSxNQUF0QyxFQUE4Q0YsS0FBSyxDQUFMLEVBQVFDLElBQUlQLEtBQUtNLENBQUwsQ0FBMUQsRUFBbUU7QUFDakVELG9CQUFNQSxJQUFJRSxDQUFKLElBQVNGLElBQUlFLENBQUosS0FBVSxFQUF6QjtBQUNEOztBQVBJLGdCQVNBRixJQUFJSSxjQUFKLENBQW1CTixJQUFuQixDQVRBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUJBVXNCTyxHQUFHQyxLQUFILENBQVMsSUFBVCxFQUFlWCxLQUFLWSxNQUFMLENBQVksQ0FBQ1QsSUFBRCxDQUFaLENBQWYsQ0FWdEI7O0FBQUE7QUFBQSw2Q0FVSUUsSUFBSUYsSUFBSixDQVZKOztBQUFBO0FBQUEsNkNBYUVFLElBQUlGLElBQUosQ0FiRjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFQO0FBZUQsQyIsImZpbGUiOiJmbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2ZuLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbi8qKlxuICogTWFrZXMgYXN5bmMgZnVuY3Rpb25zIGRldGVybWluaXN0aWMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZuID0+IHtcbiAgY29uc3QgY2FjaGUgPSB7fVxuXG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIGNvbnN0IGxhc3QgPSBhcmdzLnBvcCgpXG5cbiAgICBsZXQgdmFsID0gY2FjaGVcbiAgICBmb3IgKGxldCBpID0gMCwgYSA9IGFyZ3NbMF07IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxLCBhID0gYXJnc1tpXSkge1xuICAgICAgdmFsID0gdmFsW2FdID0gdmFsW2FdIHx8IHt9XG4gICAgfVxuXG4gICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkobGFzdCkpIHtcbiAgICAgIHJldHVybiB2YWxbbGFzdF0gPSBhd2FpdCBmbi5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChbbGFzdF0pKVxuICAgIH1cblxuICAgIHJldHVybiB2YWxbbGFzdF1cbiAgfVxufVxuIl19