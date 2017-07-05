'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _fs = require('fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
/**
 * @file src/plugins/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

exports.default = directory => {
  const pkgFile = directory + '/package.json';

  // ignore if there is no package.json file
  if (!(0, _fs.existsSync)(pkgFile)) {
    return [false, []];
  }

  const pkg = require(pkgFile);
  const pkgStat = +(0, _fs.statSync)(pkgFile).mtime;

  let [savedStat, list] = cache.val('pl') || [];

  /**
   * Return cached result if unmodified.
   */
  if (savedStat === pkgStat) {
    return [true, list];
  }

  /**
   * Filter for appropriate dependencies.
   */
  list = Object.create(null);
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg.hasOwnProperty(key)) {
      for (const dep in pkg[key]) {
        const start = dep.substr(0, 12);

        if (start === 'hopp-plugin-' || start === 'hopp-preset-') {
          list[dep] = Object.keys(require(`${directory}/node_modules/${dep}`));
        }
      }
    }
  }

  /**
   * Store in cache.
   */
  cache.val('pl', [pkgStat, list]);

  /**
   * Return saved list.
   */
  return [false, list];
};

//# sourceMappingURL=loadPlugins.js.map