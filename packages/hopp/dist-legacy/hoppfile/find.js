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

var _require = require('../utils/log')('hopp'),
    debug = _require.debug;

/**
 * Looks for hoppfile.js in {directory} and its parents.
 * @param {String} directory
 * @returns {String} the directory in which the file exists
 * @throws {Error} if file was not found
 */


exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    var files;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _fs.readdir)(directory);

          case 2:
            _context.t0 = function (f) {
              return f === 'hoppfile.js';
            };

            files = _context.sent.filter(_context.t0);


            debug('found %s hoppfiles in %s', files.length, directory);

            if (!(files.length === 0 && directory === '/')) {
              _context.next = 7;
              break;
            }

            throw new Error('Failed to find hoppfile.js');

          case 7:
            return _context.abrupt('return', files.length === 1 ? directory : find(_path2.default.dirname(directory)));

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function find(_x) {
    return _ref.apply(this, arguments);
  }

  return find;
}();
//# sourceMappingURL=find.js.map