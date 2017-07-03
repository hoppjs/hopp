'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @file src/plugins/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
exports.default = function () {
  var _ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(directory) {
    var pkgFile, pkg, pkgStat, _ref2, _ref3, savedStat, list, _arr, _i, key, dep, start;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pkgFile = directory + '/package.json';
            pkg = require(pkgFile);
            _context.next = 4;
            return (0, _bluebird.resolve)((0, _fs.stat)(pkgFile));

          case 4:
            pkgStat = +_context.sent.mtime;
            _ref2 = cache.val('pl') || [0, {}], _ref3 = _slicedToArray(_ref2, 2), savedStat = _ref3[0], list = _ref3[1];

            /**
             * Return cached result if unmodified.
             */

            if (!(savedStat === pkgStat)) {
              _context.next = 8;
              break;
            }

            return _context.abrupt('return', list);

          case 8:

            /**
             * Filter for appropriate dependencies.
             */
            list = {};
            _arr = ['dependencies', 'devDependencies', 'peerDependencies'];
            for (_i = 0; _i < _arr.length; _i++) {
              key = _arr[_i];

              if (pkg.hasOwnProperty(key)) {
                for (dep in pkg[key]) {
                  if (pkg[key].hasOwnProperty(dep)) {
                    start = dep.substr(0, 12);


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
            return _context.abrupt('return', list);

          case 13:
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