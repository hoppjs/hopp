'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _uninum = require('./utils/uninum');

var _uninum2 = _interopRequireDefault(_uninum);

var _fs = require('./fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let statCache; /**
                * @file src/modified.js
                * @license MIT
                * @copyright 2017 Karim Alibhai.
                */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RpZmllZC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsInN0YXRDYWNoZSIsImZpbGVzIiwibW9kIiwidW5kZWZpbmVkIiwidmFsIiwiZmlsZSIsImxtb2QiLCJtdGltZSIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7OztBQUVBLElBQUlDLFNBQUosQyxDQVZBOzs7Ozs7a0JBWWUsTUFBTUMsS0FBTixJQUFlO0FBQzVCLFFBQU1DLE1BQU0sRUFBWjs7QUFFQTs7O0FBR0EsTUFBSUYsY0FBY0csU0FBbEIsRUFBNkI7QUFDM0JILGdCQUFZRCxNQUFNSyxHQUFOLENBQVUsSUFBVixLQUFtQixFQUEvQjtBQUNEOztBQUVEOzs7QUFHQSxPQUFLLElBQUlDLElBQVQsSUFBaUJKLEtBQWpCLEVBQXdCO0FBQ3RCLFVBQU1LLE9BQU8sQ0FBQyxDQUFDLE1BQU0sY0FBS0QsSUFBTCxDQUFQLEVBQW1CRSxLQUFqQzs7QUFFQSxRQUFJRCxTQUFTTixVQUFVSyxJQUFWLENBQWIsRUFBOEI7QUFDNUJMLGdCQUFVSyxJQUFWLElBQWtCQyxJQUFsQjtBQUNBSixVQUFJTSxJQUFKLENBQVNILElBQVQ7QUFDRDtBQUNGOztBQUVETixRQUFNSyxHQUFOLENBQVUsSUFBVixFQUFnQko7O0FBRWhCO0FBRkEsSUFHQSxPQUFPRSxHQUFQO0FBQ0QsQyIsImZpbGUiOiJtb2RpZmllZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL21vZGlmaWVkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4vY2FjaGUnXG5pbXBvcnQgVU4gZnJvbSAnLi91dGlscy91bmludW0nXG5pbXBvcnQgeyBzdGF0IH0gZnJvbSAnLi9mcydcblxubGV0IHN0YXRDYWNoZVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlcyA9PiB7XG4gIGNvbnN0IG1vZCA9IFtdXG5cbiAgLyoqXG4gICAqIExvYWQgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChzdGF0Q2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXRDYWNoZSA9IGNhY2hlLnZhbCgnc2MnKSB8fCB7fVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjYWNoZS5cbiAgICovXG4gIGZvciAobGV0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuXG4gICAgaWYgKGxtb2QgIT09IHN0YXRDYWNoZVtmaWxlXSkge1xuICAgICAgc3RhdENhY2hlW2ZpbGVdID0gbG1vZFxuICAgICAgbW9kLnB1c2goZmlsZSlcbiAgICB9XG4gIH1cblxuICBjYWNoZS52YWwoJ3NjJywgc3RhdENhY2hlKVxuXG4gIC8vIGVuZFxuICByZXR1cm4gbW9kXG59Il19