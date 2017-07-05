'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @file src/plugins/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _fs = require('fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
exports.default = function (directory) {
  var pkgFile = directory + '/package.json';

  // ignore if there is no package.json file
  if (!(0, _fs.existsSync)(pkgFile)) {
    return [false, []];
  }

  var pkg = require(pkgFile);
  var pkgStat = +(0, _fs.statSync)(pkgFile).mtime;

  var _ref = cache.val('pl') || [],
      _ref2 = _slicedToArray(_ref, 2),
      savedStat = _ref2[0],
      list = _ref2[1];

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
  var _arr = ['dependencies', 'devDependencies', 'peerDependencies'];
  for (var _i = 0; _i < _arr.length; _i++) {
    var key = _arr[_i];
    if (pkg.hasOwnProperty(key)) {
      for (var dep in pkg[key]) {
        var start = dep.substr(0, 12);

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