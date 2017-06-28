'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

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
  var _ref = (0, _bluebird.method)(function (directory) {
    const pkg = (() => {
      try {
        return require(directory + '/package.json');
      } catch (_) {
        return {};
      }
    })();

    /**
     * Filter for appropriate dependencies.
     */
    return [].concat(Object.keys(pkg.dependencies || {}), Object.keys(pkg.devDependencies || {}), Object.keys(pkg.peerDependencies || {})).filter(dep => dep.startsWith('hopp-plugin-'));
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

//# sourceMappingURL=loadPlugins.js.map