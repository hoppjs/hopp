'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
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
              return dep.startsWith('hopp-plugin-');
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
//# sourceMappingURL=loadPlugins.js.map