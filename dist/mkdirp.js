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
    }

    cwd += _path2.default.sep + dir;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ta2RpcnAuanMiXSwibmFtZXMiOlsiZGVidWciLCJyZXF1aXJlIiwiZXhpc3RzIiwiZGlyZWN0b3J5IiwiY3dkIiwic3BsaXQiLCJzZXAiLCJkaXIiLCJlcnIiLCJTdHJpbmciLCJpbmRleE9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBUEE7Ozs7OztBQVNBLE1BQU0sRUFBRUEsS0FBRixLQUFZQyxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQ0FBbEI7QUFDQSxNQUFNQyxTQUFTLEVBQWY7O2tCQUVlLE9BQU9DLFNBQVAsRUFBa0JDLEdBQWxCLEtBQTBCO0FBQ3ZDO0FBQ0FELGNBQVlBLFVBQVVFLEtBQVYsQ0FBZ0IsZUFBS0M7O0FBRWpDO0FBRlksR0FBWixDQUdBLEtBQUssSUFBSUMsR0FBVCxJQUFnQkosU0FBaEIsRUFBMkI7QUFDekIsUUFBSUksT0FBTyxDQUFDTCxPQUFPRSxNQUFNLGVBQUtFLEdBQVgsR0FBaUJDLEdBQXhCLENBQVosRUFBMEM7QUFDeEMsVUFBSTtBQUNGUCxjQUFNLFVBQU4sRUFBa0JJLE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBbkM7QUFDQSxjQUFNLGVBQU1ILE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBdkIsQ0FBTjtBQUNELE9BSEQsQ0FHRSxPQUFPQyxHQUFQLEVBQVk7QUFDWixZQUFJQyxPQUFPRCxHQUFQLEVBQVlFLE9BQVosQ0FBb0IsUUFBcEIsTUFBa0MsQ0FBQyxDQUF2QyxFQUEwQztBQUN4QyxnQkFBTUYsR0FBTjtBQUNEO0FBQ0Y7O0FBRUROLGFBQU9FLE1BQU0sZUFBS0UsR0FBWCxHQUFpQkMsR0FBeEIsSUFBK0IsSUFBL0I7QUFDRDs7QUFFREgsV0FBTyxlQUFLRSxHQUFMLEdBQVdDLEdBQWxCO0FBQ0Q7QUFDRixDIiwiZmlsZSI6Im1rZGlycC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL21rZGlycC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgbWtkaXIgfSBmcm9tICcuL2ZzJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcbmNvbnN0IGV4aXN0cyA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChkaXJlY3RvcnksIGN3ZCkgPT4ge1xuICAvLyBleHBsb2RlIGludG8gc2VwYXJhdGVcbiAgZGlyZWN0b3J5ID0gZGlyZWN0b3J5LnNwbGl0KHBhdGguc2VwKVxuXG4gIC8vIHdhbGtcbiAgZm9yIChsZXQgZGlyIG9mIGRpcmVjdG9yeSkge1xuICAgIGlmIChkaXIgJiYgIWV4aXN0c1tjd2QgKyBwYXRoLnNlcCArIGRpcl0pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRlYnVnKCdta2RpciAlcycsIGN3ZCArIHBhdGguc2VwICsgZGlyKVxuICAgICAgICBhd2FpdCBta2Rpcihjd2QgKyBwYXRoLnNlcCArIGRpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoU3RyaW5nKGVycikuaW5kZXhPZignRUVYSVNUJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZXhpc3RzW2N3ZCArIHBhdGguc2VwICsgZGlyXSA9IHRydWVcbiAgICB9XG5cbiAgICBjd2QgKz0gcGF0aC5zZXAgKyBkaXJcbiAgfVxufSJdfQ==