'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

var _steps = require('./tasks/steps');

var _steps2 = _interopRequireDefault(_steps);

var _watch = require('./tasks/watch');

var _watch2 = _interopRequireDefault(_watch);

var _loadPlugins = require('./tasks/loadPlugins');

var _loadPlugins2 = _interopRequireDefault(_loadPlugins);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return (0, _bluebird.resolve)(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @file src/hopp.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @copyright 2017 10244872 Canada Inc..
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */

var _require = require('./utils/log')('hopp'),
    debug = _require.debug;

/**
 * Create hopp object based on plugins.
 */


exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    var init;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ;_context.next = 3;
            return (0, _loadPlugins2.default)(directory);

          case 3:
            _context.t0 = function (name) {
              var plugName = '';

              // convert plugin name to camelcase
              for (var i = 12; i < name.length; i += 1) {
                plugName += name[i] === '-' ? name[i++].toUpperCase() : name[i];
              }

              debug('adding plugin %s as %s', name, plugName);

              // add the plugin to the hopp prototype so it can be
              // used for the rest of the build process
              _mgr2.default.prototype[plugName] = function () {
                // instead of actually loading the plugin at this stage,
                // we will just pop its call into our internal call stack
                // for use later. this is useful when we are stepping through
                // an entire hoppfile but might only be running a single task

                this.d.stack.push([name, [].slice.call(arguments)]);

                return this;
              };
            };

            _context.sent.forEach(_context.t0);

            /**
             * Expose hopp class for task creation.
             */
            init = function init(src) {
              return new _mgr2.default(src);
            };

            init.all = _parallel2.default;
            init.steps = _steps2.default;
            init.watch = _watch2.default;

            return _context.abrupt('return', init);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

//# sourceMappingURL=hopp.js.map