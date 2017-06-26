'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
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
  var _ref = _asyncToGenerator(function* (directory) {
    const files = (yield (0, _fs.readdir)(directory)).filter(function (f) {
      return f === 'hoppfile.js';
    });

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