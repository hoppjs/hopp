'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('./fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/mkdirp.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const { debug } = require('./utils/log')('hopp');

exports.default = async (directory, cwd) => {
  // explode into separate
  directory = directory.split(_path2.default.sep

  // walk
  );for (let dir of directory) {
    if (dir) {
      try {
        debug('mkdir %s', cwd + _path2.default.sep + dir);
        await (0, _fs.mkdir)(cwd + _path2.default.sep + dir);
      } catch (_) {}

      cwd += _path2.default.sep + dir;
    }
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ta2RpcnAuanMiXSwibmFtZXMiOlsiZGVidWciLCJyZXF1aXJlIiwiZGlyZWN0b3J5IiwiY3dkIiwic3BsaXQiLCJzZXAiLCJkaXIiLCJfIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBUEE7Ozs7OztBQVNBLE1BQU0sRUFBRUEsS0FBRixLQUFZQyxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQ0FBbEI7O2tCQUVlLE9BQU9DLFNBQVAsRUFBa0JDLEdBQWxCLEtBQTBCO0FBQ3ZDO0FBQ0FELGNBQVlBLFVBQVVFLEtBQVYsQ0FBZ0IsZUFBS0M7O0FBRWpDO0FBRlksR0FBWixDQUdBLEtBQUssSUFBSUMsR0FBVCxJQUFnQkosU0FBaEIsRUFBMkI7QUFDekIsUUFBSUksR0FBSixFQUFTO0FBQ1AsVUFBSTtBQUNGTixjQUFNLFVBQU4sRUFBa0JHLE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBbkM7QUFDQSxjQUFNLGVBQU1ILE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBdkIsQ0FBTjtBQUNELE9BSEQsQ0FHRSxPQUFPQyxDQUFQLEVBQVUsQ0FBRTs7QUFFZEosYUFBTyxlQUFLRSxHQUFMLEdBQVdDLEdBQWxCO0FBQ0Q7QUFDRjtBQUNGLEMiLCJmaWxlIjoibWtkaXJwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvbWtkaXJwLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBta2RpciB9IGZyb20gJy4vZnMnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoZGlyZWN0b3J5LCBjd2QpID0+IHtcbiAgLy8gZXhwbG9kZSBpbnRvIHNlcGFyYXRlXG4gIGRpcmVjdG9yeSA9IGRpcmVjdG9yeS5zcGxpdChwYXRoLnNlcClcblxuICAvLyB3YWxrXG4gIGZvciAobGV0IGRpciBvZiBkaXJlY3RvcnkpIHtcbiAgICBpZiAoZGlyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWJ1ZygnbWtkaXIgJXMnLCBjd2QgKyBwYXRoLnNlcCArIGRpcilcbiAgICAgICAgYXdhaXQgbWtkaXIoY3dkICsgcGF0aC5zZXAgKyBkaXIpXG4gICAgICB9IGNhdGNoIChfKSB7fVxuXG4gICAgICBjd2QgKz0gcGF0aC5zZXAgKyBkaXJcbiAgICB9XG4gIH1cbn0iXX0=