'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkdirp = exports.tmpFileSync = exports.tmpFile = exports.writeFile = exports.readFile = exports.readdir = exports.openFile = exports.mkdir = exports.stat = exports.exists = exports.disableFSCache = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/fs.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

const { debug } = require('../utils/log')('hopp:fs');

let useCache = true;

/**
 * Similar to bluebird's Promise.promisify.
 * @param {Function} fn the async-callback function to transform
 * @return {Function} a new promise-based function
 */
function promisify(fn, name) {
  /**
   * Create function call wrapper.
   */
  const fnCall = function () {
    const args = [].slice.call(arguments);
    debug('%s(%j)', name, args);
    return new Promise((resolve, reject) => {
      fn.apply(this, args.concat([function (err) {
        if (err) reject(err);else resolve.apply(null, [].slice.call(arguments, 1));
      }]));
    });
  };

  /**
   * Create deterministic wrapper.
   */
  const cacheCall = (0, _utils.fn)(fnCall);

  /**
   * Return conditional cache.
   */
  return function () {
    if (useCache) return cacheCall.apply(this, arguments);
    return fnCall.apply(this, arguments);
  };
}

/**
 * Allow disabling of cache.
 */
const disableFSCache = exports.disableFSCache = () => {
  debug('Disabling fs cache');
  useCache = false;
};

/**
 * Transform only needed methods (instead of using mz
 * or doing a promisifyAll).
 */
const exists = exports.exists = (() => {
  var _ref = _asyncToGenerator(function* (dir) {
    try {
      yield stat(dir);
      return true;
    } catch (err) {
      if (String(err).indexOf('ENOENT') === -1) {
        throw err;
      }

      return false;
    }
  });

  return function exists(_x) {
    return _ref.apply(this, arguments);
  };
})();
const stat = exports.stat = promisify(_fs2.default.stat, 'stat');
const mkdir = exports.mkdir = promisify(_fs2.default.mkdir, 'mkdir');
const openFile = exports.openFile = promisify(_fs2.default.open, 'open');
const readdir = exports.readdir = promisify(_fs2.default.readdir, 'readdir');
const readFile = exports.readFile = promisify(_fs2.default.readFile, 'readFile');
const writeFile = exports.writeFile = promisify(_fs2.default.writeFile, 'writeFile');

/**
 * Create temporary file.
 */
const tmpFile = exports.tmpFile = () => new Promise((resolve, reject) => {
  _tmp2.default.file((err, fdpath, fd) => {
    if (err) reject(err);else resolve([fd, fdpath]);
  });
});

/**
 * Create temporary file (sync).
 */
const tmpFileSync = exports.tmpFileSync = () => _tmp2.default.fileSync();

/**
 * mkdir -p
 */
const mkdirp = exports.mkdirp = (0, _utils.fn)((() => {
  var _ref2 = _asyncToGenerator(function* (directory, cwd) {
    // explode into separate
    directory = directory.split(_path2.default.sep);

    // walk
    for (let dir of directory) {
      if (dir) {
        try {
          yield mkdir(cwd + _path2.default.sep + dir);
        } catch (err) {
          if (String(err).indexOf('EEXIST') === -1) {
            throw err;
          }
        }
      }

      cwd += _path2.default.sep + dir;
    }
  });

  return function (_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})());