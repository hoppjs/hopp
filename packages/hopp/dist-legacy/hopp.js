'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @file src/hopp.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright 2017 10244872 Canada Inc..
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

var _require = require('./utils/log')('hopp'),
    debug = _require.debug;

/**
 * Normalizes a plugin/preset name to be added to
 * the prototype.
 */


function normalize(name) {
  var normalized = '';

  for (var i = 12; i < name.length; i += 1) {
    normalized += name[i] === '-' ? name[i++].toUpperCase() : name[i];
  }

  return normalized;
}

/**
 * Generates a proxy method that allows all the plugin calls to be
 * cached.
 * 
 * Instead of actually loading the plugin at this stage, we will just
 * pop its call into our internal call stack for use later. this is
 * useful when we are stepping through an entire hoppfile but might
 * only be running a single task.
 */
function createMethod(type, name, plugName, method, directory) {
  return function () {
    var _this = this;

    if (type === 'plugin') {
      this.d.stack.push([name, [].slice.call(arguments), method]);
    } else {
      var preset = require(_path2.default.resolve(directory, 'node_modules', name));
      var substack = preset.apply(null, arguments);

      substack.forEach(function (row) {
        var _row = _slicedToArray(row, 1),
            name = _row[0];

        if (name[0] === '/') {
          _this.d.stack.push(row);
        } else {
          _this[name].apply(_this, row[1]);
        }
      });
    }

    return this;
  };
}

/**
 * Create hopp object based on plugins.
 */

exports.default = function () {
  var _ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(directory) {
    var plugins, name, type, plugName, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, method, init;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _bluebird.resolve)((0, _loadPlugins2.default)(directory));

          case 2:
            plugins = _context.sent;
            _context.t0 = regeneratorRuntime.keys(plugins);

          case 4:
            if ((_context.t1 = _context.t0()).done) {
              _context.next = 34;
              break;
            }

            name = _context.t1.value;

            if (!plugins.hasOwnProperty(name)) {
              _context.next = 32;
              break;
            }

            type = name.indexOf('plugin') !== -1 ? 'plugin' : 'preset';
            plugName = normalize(name);


            debug('adding %s %s as %s', type, name, plugName);

            // check for conflicts

            if (!_mgr2.default.prototype.hasOwnProperty(plugName)) {
              _context.next = 12;
              break;
            }

            throw new Error(`Conflicting ${type}: ${name} (${plugName} already exists)`);

          case 12:

            // add the plugin to the hopp prototype so it can be
            // used for the rest of the build process
            // this function is the proxy of the 'default' function
            _mgr2.default.prototype[plugName] = createMethod(type, name, plugName, 'default', directory);

            // add any other methods
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 16;
            for (_iterator = plugins[name][Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              method = _step.value;

              if (method !== '__esModule' && method !== 'config' && method !== 'default') {
                _mgr2.default.prototype[plugName][method] = createMethod(type, name, plugName, method, directory);
              }
            }
            _context.next = 24;
            break;

          case 20:
            _context.prev = 20;
            _context.t2 = _context['catch'](16);
            _didIteratorError = true;
            _iteratorError = _context.t2;

          case 24:
            _context.prev = 24;
            _context.prev = 25;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 27:
            _context.prev = 27;

            if (!_didIteratorError) {
              _context.next = 30;
              break;
            }

            throw _iteratorError;

          case 30:
            return _context.finish(27);

          case 31:
            return _context.finish(24);

          case 32:
            _context.next = 4;
            break;

          case 34:

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

          case 39:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[16, 20, 24, 32], [25,, 27, 31]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

//# sourceMappingURL=hopp.js.map