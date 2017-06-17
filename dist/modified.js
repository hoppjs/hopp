'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _fs = require('./fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * @file src/modified.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

let statCache;

exports.default = async files => {
  const mod = [];

  /**
   * Load from cache.
   */
  if (statCache === undefined) {
    statCache = cache.val('sc') || {};
  }

  /**
   * Update cache.
   */
  for (let file of files) {
    const lmod = +(await (0, _fs.stat)(file)).mtime;

    if (lmod !== statCache[file]) {
      statCache[file] = lmod;
      mod.push(file);
    }
  }

  cache.val('sc', statCache

  // end
  );return mod;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RpZmllZC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsInN0YXRDYWNoZSIsImZpbGVzIiwibW9kIiwidW5kZWZpbmVkIiwidmFsIiwiZmlsZSIsImxtb2QiLCJtdGltZSIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztJQUFZQSxLOztBQUNaOzs7O0FBUEE7Ozs7OztBQVNBLElBQUlDLFNBQUo7O2tCQUVlLE1BQU1DLEtBQU4sSUFBZTtBQUM1QixRQUFNQyxNQUFNLEVBQVo7O0FBRUE7OztBQUdBLE1BQUlGLGNBQWNHLFNBQWxCLEVBQTZCO0FBQzNCSCxnQkFBWUQsTUFBTUssR0FBTixDQUFVLElBQVYsS0FBbUIsRUFBL0I7QUFDRDs7QUFFRDs7O0FBR0EsT0FBSyxJQUFJQyxJQUFULElBQWlCSixLQUFqQixFQUF3QjtBQUN0QixVQUFNSyxPQUFPLENBQUMsQ0FBQyxNQUFNLGNBQUtELElBQUwsQ0FBUCxFQUFtQkUsS0FBakM7O0FBRUEsUUFBSUQsU0FBU04sVUFBVUssSUFBVixDQUFiLEVBQThCO0FBQzVCTCxnQkFBVUssSUFBVixJQUFrQkMsSUFBbEI7QUFDQUosVUFBSU0sSUFBSixDQUFTSCxJQUFUO0FBQ0Q7QUFDRjs7QUFFRE4sUUFBTUssR0FBTixDQUFVLElBQVYsRUFBZ0JKOztBQUVoQjtBQUZBLElBR0EsT0FBT0UsR0FBUDtBQUNELEMiLCJmaWxlIjoibW9kaWZpZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9tb2RpZmllZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IHsgc3RhdCB9IGZyb20gJy4vZnMnXG5cbmxldCBzdGF0Q2FjaGVcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZXMgPT4ge1xuICBjb25zdCBtb2QgPSBbXVxuXG4gIC8qKlxuICAgKiBMb2FkIGZyb20gY2FjaGUuXG4gICAqL1xuICBpZiAoc3RhdENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0Q2FjaGUgPSBjYWNoZS52YWwoJ3NjJykgfHwge31cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgY2FjaGUuXG4gICAqL1xuICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcblxuICAgIGlmIChsbW9kICE9PSBzdGF0Q2FjaGVbZmlsZV0pIHtcbiAgICAgIHN0YXRDYWNoZVtmaWxlXSA9IGxtb2RcbiAgICAgIG1vZC5wdXNoKGZpbGUpXG4gICAgfVxuICB9XG5cbiAgY2FjaGUudmFsKCdzYycsIHN0YXRDYWNoZSlcblxuICAvLyBlbmRcbiAgcmV0dXJuIG1vZFxufSJdfQ==