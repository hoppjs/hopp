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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
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
            }();

            /**
             * Filter for appropriate dependencies.
             */


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9sb2FkUGx1Z2lucy5qcyJdLCJuYW1lcyI6WyJkaXJlY3RvcnkiLCJwa2ciLCJyZXF1aXJlIiwiXyIsImNvbmNhdCIsIk9iamVjdCIsImtleXMiLCJkZXBlbmRlbmNpZXMiLCJkZXZEZXBlbmRlbmNpZXMiLCJwZWVyRGVwZW5kZW5jaWVzIiwiZmlsdGVyIiwiZGVwIiwic3RhcnRzV2l0aCIsIm1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7OzsyY0FOQTs7Ozs7O0FBUUE7Ozs7Ozt1REFLZSxpQkFBTUEsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUEMsZUFETyxHQUNBLFlBQU07QUFDakIsa0JBQUk7QUFDRix1QkFBT0MsUUFBUUYsWUFBWSxlQUFwQixDQUFQO0FBQ0QsZUFGRCxDQUVFLE9BQU9HLENBQVAsRUFBVTtBQUNWLHVCQUFPLEVBQVA7QUFDRDtBQUNGLGFBTlcsRUFEQzs7QUFTYjs7Ozs7QUFUYSw2Q0FZTixHQUFHQyxNQUFILENBQ0xDLE9BQU9DLElBQVAsQ0FBWUwsSUFBSU0sWUFBSixJQUFvQixFQUFoQyxDQURLLEVBRUxGLE9BQU9DLElBQVAsQ0FBWUwsSUFBSU8sZUFBSixJQUF1QixFQUFuQyxDQUZLLEVBR0xILE9BQU9DLElBQVAsQ0FBWUwsSUFBSVEsZ0JBQUosSUFBd0IsRUFBcEMsQ0FISyxFQUlMQyxNQUpLLENBSUU7QUFBQSxxQkFBT0MsSUFBSUMsVUFBSixDQUFlLE9BQWYsQ0FBUDtBQUFBLGFBSkYsRUFLTEMsR0FMSyxDQUtEO0FBQUEscUJBQVViLFNBQVYsc0JBQW9DVyxHQUFwQztBQUFBLGFBTEMsQ0FaTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWRQbHVnaW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvcGx1Z2lucy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbi8qKlxuICogTG9hZHMgdGhlIGxpc3Qgb2YgcGx1Z2lucyBkZWZpbmVkIGluIHRoZSBwYWNrYWdlLmpzb24uXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCB0byBkaXJlY3Rvcnkgd2l0aCBwYWNrYWdlLmpzb25cbiAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdpdGggYXJyYXkgb2YgcGF0aHMgdG8gcGx1Z2luc1xuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICBjb25zdCBwa2cgPSAoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gcmVxdWlyZShkaXJlY3RvcnkgKyAnL3BhY2thZ2UuanNvbicpXG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgcmV0dXJuIHt9XG4gICAgfVxuICB9KSgpXG5cbiAgLyoqXG4gICAqIEZpbHRlciBmb3IgYXBwcm9wcmlhdGUgZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgcmV0dXJuIFtdLmNvbmNhdChcbiAgICBPYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IHt9KSxcbiAgICBPYmplY3Qua2V5cyhwa2cuZGV2RGVwZW5kZW5jaWVzIHx8IHt9KSxcbiAgICBPYmplY3Qua2V5cyhwa2cucGVlckRlcGVuZGVuY2llcyB8fCB7fSlcbiAgKS5maWx0ZXIoZGVwID0+IGRlcC5zdGFydHNXaXRoKCdob3BwLScpKVxuICAgLm1hcChkZXAgPT4gYCR7ZGlyZWN0b3J5fS9ub2RlX21vZHVsZXMvJHtkZXB9YClcbn1cbiJdfQ==