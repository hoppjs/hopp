'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = find;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

var _require = require('../utils/log')('hopp'),
    debug = _require.debug;

/**
 * Looks for hoppfile.js in {directory} and its parents.
 * @param {String} directory
 * @returns {String} the directory in which the file exists
 * @throws {Error} if file was not found
 */


function find(directory) {
  var files = (0, _fs.readdirSync)(directory).filter(function (f) {
    return f === 'hoppfile.js';
  });

  debug('found %s hoppfiles in %s', files.length, directory);

  if (files.length === 0 && directory === '/') {
    throw new Error('Failed to find hoppfile.js');
  }

  return files.length === 1 ? directory : find(_path2.default.dirname(directory));
}

//# sourceMappingURL=find.js.map