'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const { debug } = require('../utils/log')('hopp');

/**
 * Looks for hoppfile.js in {directory} and its parents.
 * @param {String} directory
 * @returns {String} the directory in which the file exists
 * @throws {Error} if file was not found
 */

exports.default = async function find(directory) {
  const files = (await (0, _fs.readdir)(directory)).filter(f => f === 'hoppfile.js');

  debug('found %s hoppfiles in %s', files.length, directory);

  if (files.length === 0 && directory === '/') {
    throw new Error('Failed to find hoppfile.js');
  }

  return files.length === 1 ? directory : await find(_path2.default.dirname(directory));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9maW5kLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwicmVxdWlyZSIsImZpbmQiLCJkaXJlY3RvcnkiLCJmaWxlcyIsImZpbHRlciIsImYiLCJsZW5ndGgiLCJFcnJvciIsImRpcm5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFQQTs7Ozs7O0FBU0EsTUFBTSxFQUFFQSxLQUFGLEtBQVlDLFFBQVEsY0FBUixFQUF3QixNQUF4QixDQUFsQjs7QUFFQTs7Ozs7OztrQkFNZSxlQUFlQyxJQUFmLENBQXFCQyxTQUFyQixFQUFpQztBQUM5QyxRQUFNQyxRQUFRLENBQUMsTUFBTSxpQkFBUUQsU0FBUixDQUFQLEVBQTJCRSxNQUEzQixDQUFrQ0MsS0FBS0EsTUFBTSxhQUE3QyxDQUFkOztBQUVBTixRQUFNLDBCQUFOLEVBQWtDSSxNQUFNRyxNQUF4QyxFQUFnREosU0FBaEQ7O0FBRUEsTUFBSUMsTUFBTUcsTUFBTixLQUFpQixDQUFqQixJQUFzQkosY0FBYyxHQUF4QyxFQUE2QztBQUMzQyxVQUFNLElBQUlLLEtBQUosQ0FBVSw0QkFBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBT0osTUFBTUcsTUFBTixLQUFpQixDQUFqQixHQUFxQkosU0FBckIsR0FBaUMsTUFBTUQsS0FBSyxlQUFLTyxPQUFMLENBQWFOLFNBQWIsQ0FBTCxDQUE5QztBQUNELEMiLCJmaWxlIjoiZmluZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHJlYWRkaXIgfSBmcm9tICcuLi9mcydcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG4vKipcbiAqIExvb2tzIGZvciBob3BwZmlsZS5qcyBpbiB7ZGlyZWN0b3J5fSBhbmQgaXRzIHBhcmVudHMuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0b3J5XG4gKiBAcmV0dXJucyB7U3RyaW5nfSB0aGUgZGlyZWN0b3J5IGluIHdoaWNoIHRoZSBmaWxlIGV4aXN0c1xuICogQHRocm93cyB7RXJyb3J9IGlmIGZpbGUgd2FzIG5vdCBmb3VuZFxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBmaW5kKCBkaXJlY3RvcnkgKSB7XG4gIGNvbnN0IGZpbGVzID0gKGF3YWl0IHJlYWRkaXIoZGlyZWN0b3J5KSkuZmlsdGVyKGYgPT4gZiA9PT0gJ2hvcHBmaWxlLmpzJylcblxuICBkZWJ1ZygnZm91bmQgJXMgaG9wcGZpbGVzIGluICVzJywgZmlsZXMubGVuZ3RoLCBkaXJlY3RvcnkpXG5cbiAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCAmJiBkaXJlY3RvcnkgPT09ICcvJykge1xuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZpbmQgaG9wcGZpbGUuanMnKVxuICB9XG5cbiAgcmV0dXJuIGZpbGVzLmxlbmd0aCA9PT0gMSA/IGRpcmVjdG9yeSA6IGF3YWl0IGZpbmQocGF0aC5kaXJuYW1lKGRpcmVjdG9yeSkpXG59Il19