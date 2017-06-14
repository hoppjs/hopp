'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/plugins/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    var pkg;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pkg = function () {
              try {
                return require(directory + '/package.json');
              } catch (_) {
                return {};
              }
            }

            /**
             * Filter for appropriate dependencies.
             */
            ();

            return _context.abrupt('return', [].concat(Object.keys(pkg.dependencies || {}), Object.keys(pkg.devDependencies || {}), Object.keys(pkg.peerDependencies || {})).filter(function (dep) {
              return dep.startsWith('hopp-');
            }).map(function (dep) {
              return directory + '/node_modules/' + dep;
            }));

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2xvYWQuanMiXSwibmFtZXMiOlsiZGlyZWN0b3J5IiwicGtnIiwicmVxdWlyZSIsIl8iLCJjb25jYXQiLCJPYmplY3QiLCJrZXlzIiwiZGVwZW5kZW5jaWVzIiwiZGV2RGVwZW5kZW5jaWVzIiwicGVlckRlcGVuZGVuY2llcyIsImZpbHRlciIsImRlcCIsInN0YXJ0c1dpdGgiLCJtYXAiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7Ozs7MmNBTkE7Ozs7OztBQVFBOzs7Ozs7dURBS2UsaUJBQU1BLFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1BDLGVBRE8sR0FDQSxZQUFNO0FBQ2pCLGtCQUFJO0FBQ0YsdUJBQU9DLFFBQVFGLFlBQVksZUFBcEIsQ0FBUDtBQUNELGVBRkQsQ0FFRSxPQUFPRyxDQUFQLEVBQVU7QUFDVix1QkFBTyxFQUFQO0FBQ0Q7QUFDRjs7QUFFRDs7O0FBUlksY0FEQzs7QUFBQSw2Q0FZTixHQUFHQyxNQUFILENBQ0xDLE9BQU9DLElBQVAsQ0FBWUwsSUFBSU0sWUFBSixJQUFvQixFQUFoQyxDQURLLEVBRUxGLE9BQU9DLElBQVAsQ0FBWUwsSUFBSU8sZUFBSixJQUF1QixFQUFuQyxDQUZLLEVBR0xILE9BQU9DLElBQVAsQ0FBWUwsSUFBSVEsZ0JBQUosSUFBd0IsRUFBcEMsQ0FISyxFQUlMQyxNQUpLLENBSUU7QUFBQSxxQkFBT0MsSUFBSUMsVUFBSixDQUFlLE9BQWYsQ0FBUDtBQUFBLGFBSkYsRUFLTEMsR0FMSyxDQUtEO0FBQUEscUJBQVViLFNBQVYsc0JBQW9DVyxHQUFwQztBQUFBLGFBTEMsQ0FaTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9wbHVnaW5zL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuLyoqXG4gKiBMb2FkcyB0aGUgbGlzdCBvZiBwbHVnaW5zIGRlZmluZWQgaW4gdGhlIHBhY2thZ2UuanNvbi5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIHRvIGRpcmVjdG9yeSB3aXRoIHBhY2thZ2UuanNvblxuICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2l0aCBhcnJheSBvZiBwYXRocyB0byBwbHVnaW5zXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIGNvbnN0IHBrZyA9ICgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiByZXF1aXJlKGRpcmVjdG9yeSArICcvcGFja2FnZS5qc29uJylcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gIH0pKClcblxuICAvKipcbiAgICogRmlsdGVyIGZvciBhcHByb3ByaWF0ZSBkZXBlbmRlbmNpZXMuXG4gICAqL1xuICByZXR1cm4gW10uY29uY2F0KFxuICAgIE9iamVjdC5rZXlzKHBrZy5kZXBlbmRlbmNpZXMgfHwge30pLFxuICAgIE9iamVjdC5rZXlzKHBrZy5kZXZEZXBlbmRlbmNpZXMgfHwge30pLFxuICAgIE9iamVjdC5rZXlzKHBrZy5wZWVyRGVwZW5kZW5jaWVzIHx8IHt9KVxuICApLmZpbHRlcihkZXAgPT4gZGVwLnN0YXJ0c1dpdGgoJ2hvcHAtJykpXG4gICAubWFwKGRlcCA9PiBgJHtkaXJlY3Rvcnl9L25vZGVfbW9kdWxlcy8ke2RlcH1gKVxufSJdfQ==