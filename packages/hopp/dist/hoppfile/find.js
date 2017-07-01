'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const { debug } = require('../utils/log')('hopp');

/**
 * Looks for hoppfile.js in {directory} and its parents.
 * @param {String} directory
 * @returns {String} the directory in which the file exists
 * @throws {Error} if file was not found
 */

exports.default = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (directory) {
    const files = (yield (0, _bluebird.resolve)((0, _fs.readdir)(directory))).filter(f => f === 'hoppfile.js');

    debug('found %s hoppfiles in %s', files.length, directory);

    if (files.length === 0 && directory === '/') {
      throw new Error('Failed to find hoppfile.js');
    }

    return files.length === 1 ? directory : find(_path2.default.dirname(directory));
  });

  function find(_x) {
    return _ref.apply(this, arguments);
  }

  return find;
})();

//# sourceMappingURL=find.js.map