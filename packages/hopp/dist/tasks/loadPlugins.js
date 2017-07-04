'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

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

exports.default = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (directory) {
    const pkgFile = directory + '/package.json';

    // ignore if there is no package.json file
    if (!(yield (0, _bluebird.resolve)((0, _fs.exists)(pkgFile)))) {
      return;
    }

    const pkg = require(pkgFile);
    const pkgStat = +(yield (0, _bluebird.resolve)((0, _fs.stat)(pkgFile))).mtime;

    let [savedStat, list] = cache.val('pl') || [0, {}];

    /**
     * Return cached result if unmodified.
     */
    if (savedStat === pkgStat) {
      return list;
    }

    /**
     * Filter for appropriate dependencies.
     */
    list = {};
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (pkg.hasOwnProperty(key)) {
        for (const dep in pkg[key]) {
          if (pkg[key].hasOwnProperty(dep)) {
            const start = dep.substr(0, 12);

            if (start === 'hopp-plugin-' || start === 'hopp-preset-') {
              list[dep] = Object.keys(require(`${directory}/node_modules/${dep}`));
            }
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
    return list;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

//# sourceMappingURL=loadPlugins.js.map