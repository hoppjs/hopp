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
exports.default = (() => {
  var _ref = _asyncToGenerator(function* (directory) {
    const pkg = function () {
      try {
        return require(directory + '/package.json');
      } catch (_) {
        return {};
      }
    }();

    /**
     * Filter for appropriate dependencies.
     */
    return [].concat(Object.keys(pkg.dependencies || {}), Object.keys(pkg.devDependencies || {}), Object.keys(pkg.peerDependencies || {})).filter(function (dep) {
      return dep.startsWith('hopp-plugin-');
    });
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();