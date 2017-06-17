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
const exists = {};

exports.default = async (directory, cwd) => {
  // explode into separate
  directory = directory.split(_path2.default.sep

  // walk
  );for (let dir of directory) {
    if (dir && !exists[cwd + _path2.default.sep + dir]) {
      try {
        debug('mkdir %s', cwd + _path2.default.sep + dir);
        await (0, _fs.mkdir)(cwd + _path2.default.sep + dir);
      } catch (err) {
        if (String(err).indexOf('EEXIST') === -1) {
          throw err;
        }
      }

      exists[cwd + _path2.default.sep + dir] = true;
      cwd += _path2.default.sep + dir;
    }
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ta2RpcnAuanMiXSwibmFtZXMiOlsiZGVidWciLCJyZXF1aXJlIiwiZXhpc3RzIiwiZGlyZWN0b3J5IiwiY3dkIiwic3BsaXQiLCJzZXAiLCJkaXIiLCJlcnIiLCJTdHJpbmciLCJpbmRleE9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBUEE7Ozs7OztBQVNBLE1BQU0sRUFBRUEsS0FBRixLQUFZQyxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQ0FBbEI7QUFDQSxNQUFNQyxTQUFTLEVBQWY7O2tCQUVlLE9BQU9DLFNBQVAsRUFBa0JDLEdBQWxCLEtBQTBCO0FBQ3ZDO0FBQ0FELGNBQVlBLFVBQVVFLEtBQVYsQ0FBZ0IsZUFBS0M7O0FBRWpDO0FBRlksR0FBWixDQUdBLEtBQUssSUFBSUMsR0FBVCxJQUFnQkosU0FBaEIsRUFBMkI7QUFDekIsUUFBSUksT0FBTyxDQUFDTCxPQUFPRSxNQUFNLGVBQUtFLEdBQVgsR0FBaUJDLEdBQXhCLENBQVosRUFBMEM7QUFDeEMsVUFBSTtBQUNGUCxjQUFNLFVBQU4sRUFBa0JJLE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBbkM7QUFDQSxjQUFNLGVBQU1ILE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBdkIsQ0FBTjtBQUNELE9BSEQsQ0FHRSxPQUFPQyxHQUFQLEVBQVk7QUFDWixZQUFJQyxPQUFPRCxHQUFQLEVBQVlFLE9BQVosQ0FBb0IsUUFBcEIsTUFBa0MsQ0FBQyxDQUF2QyxFQUEwQztBQUN4QyxnQkFBTUYsR0FBTjtBQUNEO0FBQ0Y7O0FBRUROLGFBQU9FLE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBeEIsSUFBK0IsSUFBL0I7QUFDQUgsYUFBTyxlQUFLRSxHQUFMLEdBQVdDLEdBQWxCO0FBQ0Q7QUFDRjtBQUNGLEMiLCJmaWxlIjoibWtkaXJwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvbWtkaXJwLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBta2RpciB9IGZyb20gJy4vZnMnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuY29uc3QgZXhpc3RzID0ge31cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKGRpcmVjdG9yeSwgY3dkKSA9PiB7XG4gIC8vIGV4cGxvZGUgaW50byBzZXBhcmF0ZVxuICBkaXJlY3RvcnkgPSBkaXJlY3Rvcnkuc3BsaXQocGF0aC5zZXApXG5cbiAgLy8gd2Fsa1xuICBmb3IgKGxldCBkaXIgb2YgZGlyZWN0b3J5KSB7XG4gICAgaWYgKGRpciAmJiAhZXhpc3RzW2N3ZCArIHBhdGguc2VwICsgZGlyXSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVidWcoJ21rZGlyICVzJywgY3dkICsgcGF0aC5zZXAgKyBkaXIpXG4gICAgICAgIGF3YWl0IG1rZGlyKGN3ZCArIHBhdGguc2VwICsgZGlyKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmIChTdHJpbmcoZXJyKS5pbmRleE9mKCdFRVhJU1QnKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBleGlzdHNbY3dkICsgcGF0aC5zZXAgKyBkaXJdID0gdHJ1ZVxuICAgICAgY3dkICs9IHBhdGguc2VwICsgZGlyXG4gICAgfVxuICB9XG59Il19