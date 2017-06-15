'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _module = require('module');

var _module2 = _interopRequireDefault(_module);

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _hopp = require('./hopp');

var _hopp2 = _interopRequireDefault(_hopp);

var _tree = require('./tasks/tree');

var _tree2 = _interopRequireDefault(_tree);

var _hoppfile = require('./hoppfile');

var hoppfile = _interopRequireWildcard(_hoppfile);

var _log = require('./utils/log');

var _log2 = _interopRequireDefault(_log);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file index.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _createLogger = (0, _log2.default)('hopp'

/**
 * Parse args
 */
),
    log = _createLogger.log,
    debug = _createLogger.debug,
    error = _createLogger.error;

var argv = function (args) {
  var o = {
    _: []
  };

  for (var i = 2; i < args.length; i += 1) {
    var a = args[i];

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a[0] !== '-') o._.push(a);
  }

  return o;
}(process.argv

/**
 * Print help.
 */
);function help() {
  console.log('usage: hopp [OPTIONS] [TASKS]');
  console.log('');
  console.log('  -d, --directory [dir]\tpath to project directory');
  console.log('  -v, --verbose\tenable debug messages');
  console.log('  -V, --version\tget version info');
  console.log('  -h, --help\tdisplay this message');

  process.exit(1);
}

if (argv.version) {
  console.log(require('../package.json').version);
  process.exit(0);
}

/**
 * Currently the only way for help to be called.
 * Later, it should also happen on invalid args but we
 * don't have invalid arguments yet.
 * 
 * Invalid arguments is a flag misuse - never a missing
 * task. That error should be more minimal and separate.
 */
if (argv.help) {
  help();
}

/**
 * Set tasks.
 */
var tasks = argv._.length === 0 ? ['default'] : argv._;_asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
  var projectDir, file, lock, hopp, _resolve, _ref2, _ref3, fromCache, taskDefns, _addDependencies, fullList, goal, name;

  return regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          /**
           * Pass verbosity through to the env.
           */
          process.env.HOPP_DEBUG = process.env.HOPP_DEBUG || !!argv.verbose;
          debug('Setting HOPP_DEBUG = %j', process.env.HOPP_DEBUG

          /**
           * If project directory not specified, do lookup for the
           * hoppfile.js
           */
          );
          _context3.t0 = function (directory) {
            // absolute paths don't need correcting
            if (directory[0] === '/') {
              return directory;
            }

            // sort-of relatives should be made into relative
            if (directory[0] !== '.') {
              directory = './' + directory;
            }

            // map to current directory
            return _path2.default.resolve(process.cwd(), directory);
          };

          _context3.t1 = argv.directory;

          if (_context3.t1) {
            _context3.next = 8;
            break;
          }

          _context3.next = 7;
          return hoppfile.find(_path2.default.dirname(__dirname));

        case 7:
          _context3.t1 = _context3.sent;

        case 8:
          _context3.t2 = _context3.t1;
          projectDir = (0, _context3.t0)(_context3.t2);
          file = projectDir + '/hoppfile.js';

          debug('Using hoppfile.js @ %s', file

          /**
           * Load cache.
           */
          );_context3.next = 14;
          return cache.load(projectDir

          /**
           * Create hopp instance creator.
           */
          );

        case 14:
          lock = _context3.sent;
          _context3.next = 17;
          return (0, _hopp2.default)(projectDir

          /**
           * Cache the hopp handler to make `require()` work
           * in the hoppfile.
           */
          );

        case 17:
          hopp = _context3.sent;
          _resolve = _module2.default._resolveFilename;

          _module2.default._resolveFilename = function (what, parent) {
            return what === 'hopp' ? what : _resolve(what, parent);
          };

          require.cache.hopp = {
            id: 'hopp',
            filename: 'hopp',
            loaded: true,
            exports: hopp

            /**
             * Load tasks from file.
             */
          };_context3.next = 23;
          return hoppfile.load(file

          /**
           * Parse from cache.
           */
          );

        case 23:
          _ref2 = _context3.sent;
          _ref3 = _slicedToArray(_ref2, 2);
          fromCache = _ref3[0];
          taskDefns = _ref3[1];
          if (fromCache) {
            _addDependencies = function _addDependencies(task) {
              if (taskDefns[task] instanceof Array) {
                fullList = fullList.concat(taskDefns[task]);
                taskDefns[task].forEach(function (sub) {
                  return _addDependencies(sub);
                });
              }
            };

            // start walking from top


            // create copy of tasks, we don't want to modify
            // the actual goal list
            fullList = [].slice.call(tasks

            // walk the full tree
            );
            fullList.forEach(function (task) {
              return _addDependencies(task);
            }

            // parse all tasks and their dependencies
            );(0, _tree2.default)(taskDefns, fullList);
          }

          /**
           * Run tasks.
           */
          goal = void 0;


          if (tasks.length === 1) {
            name = tasks[0];

            goal = taskDefns[tasks[0]];

            if (goal instanceof Array) {
              goal = (0, _parallel2.default)(goal, taskDefns);
            }

            goal = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return goal.start(name, projectDir);

                    case 3:
                      _context.next = 9;
                      break;

                    case 5:
                      _context.prev = 5;
                      _context.t0 = _context['catch'](0);

                      (0, _log2.default)('hopp:' + name).error(_context.t0.stack || _context.t0);
                      throw 'Build failed.';

                    case 9:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, undefined, [[0, 5]]);
            }))();
          } else {
            goal = Promise.all(tasks.map(function () {
              var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name) {
                var task;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        task = taskDefns[name];


                        if (task instanceof Array) {
                          task = (0, _parallel2.default)(task, taskDefns);
                        }

                        _context2.prev = 2;
                        _context2.next = 5;
                        return task.start(name, projectDir);

                      case 5:
                        _context2.next = 11;
                        break;

                      case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2['catch'](2);

                        (0, _log2.default)('hopp:' + name).error(_context2.t0.stack || _context2.t0);
                        throw 'Build failed.';

                      case 11:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, undefined, [[2, 7]]);
              }));

              return function (_x) {
                return _ref5.apply(this, arguments);
              };
            }()));
          }

          /**
           * Wait for task completion.
           */
          _context3.next = 32;
          return goal;

        case 32:
          _context3.next = 34;
          return cache.save(projectDir);

        case 34:
        case 'end':
          return _context3.stop();
      }
    }
  }, _callee3, undefined);
}))().catch(function (err) {
  error(err.stack || err);
  process.exit(-1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwibG9nIiwiZGVidWciLCJlcnJvciIsImFyZ3YiLCJvIiwiXyIsImkiLCJhcmdzIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImRpcmVjdG9yeSIsInB1c2giLCJwcm9jZXNzIiwiY29uc29sZSIsImV4aXQiLCJyZXF1aXJlIiwidGFza3MiLCJlbnYiLCJIT1BQX0RFQlVHIiwicmVzb2x2ZSIsImN3ZCIsImZpbmQiLCJkaXJuYW1lIiwiX19kaXJuYW1lIiwicHJvamVjdERpciIsImZpbGUiLCJsb2FkIiwibG9jayIsImhvcHAiLCJfcmVzb2x2ZSIsIl9yZXNvbHZlRmlsZW5hbWUiLCJ3aGF0IiwicGFyZW50IiwiaWQiLCJmaWxlbmFtZSIsImxvYWRlZCIsImV4cG9ydHMiLCJmcm9tQ2FjaGUiLCJ0YXNrRGVmbnMiLCJhZGREZXBlbmRlbmNpZXMiLCJ0YXNrIiwiQXJyYXkiLCJmdWxsTGlzdCIsImNvbmNhdCIsImZvckVhY2giLCJzdWIiLCJzbGljZSIsImNhbGwiLCJnb2FsIiwibmFtZSIsInN0YXJ0Iiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwic2F2ZSIsImNhdGNoIiwiZXJyIl0sIm1hcHBpbmdzIjoiOzs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0lBQVlDLFE7O0FBQ1o7Ozs7QUFDQTs7Ozs7Ozs7MmNBZkE7Ozs7OztvQkFpQjhCLG1CQUFhOztBQUUzQzs7O0FBRjhCLEM7SUFBdEJDLEcsaUJBQUFBLEc7SUFBS0MsSyxpQkFBQUEsSztJQUFPQyxLLGlCQUFBQSxLOztBQUtwQixJQUFNQyxPQUFRLGdCQUFRO0FBQ3BCLE1BQU1DLElBQUk7QUFDUkMsT0FBRztBQURLLEdBQVY7O0FBSUEsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlDLEtBQUtDLE1BQXpCLEVBQWlDRixLQUFLLENBQXRDLEVBQXlDO0FBQ3ZDLFFBQUlHLElBQUlGLEtBQUtELENBQUwsQ0FBUjs7QUFFQSxRQUFJRyxNQUFNLElBQU4sSUFBY0EsTUFBTSxRQUF4QixFQUFrQ0wsRUFBRU0sSUFBRixHQUFTLElBQVQsQ0FBbEMsS0FDSyxJQUFJRCxNQUFNLElBQU4sSUFBY0EsTUFBTSxXQUF4QixFQUFxQ0wsRUFBRU8sT0FBRixHQUFZLElBQVosQ0FBckMsS0FDQSxJQUFJRixNQUFNLElBQU4sSUFBY0EsTUFBTSxXQUF4QixFQUFxQ0wsRUFBRVEsT0FBRixHQUFZLElBQVosQ0FBckMsS0FDQSxJQUFJSCxNQUFNLElBQU4sSUFBY0EsTUFBTSxhQUF4QixFQUF1Q0wsRUFBRVMsU0FBRixHQUFjTixLQUFLLEVBQUVELENBQVAsQ0FBZCxDQUF2QyxLQUNBLElBQUlHLEVBQUUsQ0FBRixNQUFTLEdBQWIsRUFBa0JMLEVBQUVDLENBQUYsQ0FBSVMsSUFBSixDQUFTTCxDQUFUO0FBQ3hCOztBQUVELFNBQU9MLENBQVA7QUFDRCxDQWhCWSxDQWdCVlcsUUFBUVo7O0FBRVg7OztBQWxCYSxDQUFiLENBcUJBLFNBQVNPLElBQVQsR0FBZ0I7QUFDZE0sVUFBUWhCLEdBQVIsQ0FBWSwrQkFBWjtBQUNBZ0IsVUFBUWhCLEdBQVIsQ0FBWSxFQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLG9EQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLHdDQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLG1DQUFaO0FBQ0FnQixVQUFRaEIsR0FBUixDQUFZLG9DQUFaOztBQUVBZSxVQUFRRSxJQUFSLENBQWEsQ0FBYjtBQUNEOztBQUVELElBQUlkLEtBQUtRLE9BQVQsRUFBa0I7QUFDaEJLLFVBQVFoQixHQUFSLENBQVlrQixRQUFRLGlCQUFSLEVBQTJCUCxPQUF2QztBQUNBSSxVQUFRRSxJQUFSLENBQWEsQ0FBYjtBQUNEOztBQUVEOzs7Ozs7OztBQVFBLElBQUlkLEtBQUtPLElBQVQsRUFBZTtBQUNiQTtBQUNEOztBQUVEOzs7QUFHQSxJQUFNUyxRQUFRaEIsS0FBS0UsQ0FBTCxDQUFPRyxNQUFQLEtBQWtCLENBQWxCLEdBQXNCLENBQUMsU0FBRCxDQUF0QixHQUFvQ0wsS0FBS0UsQ0FBdkQsQ0FFQywwQ0FBQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7OztBQUdBVSxrQkFBUUssR0FBUixDQUFZQyxVQUFaLEdBQXlCTixRQUFRSyxHQUFSLENBQVlDLFVBQVosSUFBMEIsQ0FBQyxDQUFFbEIsS0FBS1MsT0FBM0Q7QUFDQVgsZ0JBQU0seUJBQU4sRUFBaUNjLFFBQVFLLEdBQVIsQ0FBWUM7O0FBRTdDOzs7O0FBRkE7QUFMQSx5QkFXb0IscUJBQWE7QUFDL0I7QUFDQSxnQkFBSVIsVUFBVSxDQUFWLE1BQWlCLEdBQXJCLEVBQTBCO0FBQ3hCLHFCQUFPQSxTQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxnQkFBSUEsVUFBVSxDQUFWLE1BQWlCLEdBQXJCLEVBQTBCO0FBQ3hCQSwwQkFBWSxPQUFPQSxTQUFuQjtBQUNEOztBQUVEO0FBQ0EsbUJBQU8sZUFBS1MsT0FBTCxDQUFhUCxRQUFRUSxHQUFSLEVBQWIsRUFBNEJWLFNBQTVCLENBQVA7QUFDRCxXQXhCRDs7QUFBQSx5QkF3QkdWLEtBQUtVLFNBeEJSOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsaUJBd0IyQmQsU0FBU3lCLElBQVQsQ0FBYyxlQUFLQyxPQUFMLENBQWFDLFNBQWIsQ0FBZCxDQXhCM0I7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBV01DLG9CQVhOO0FBa0NNQyxjQWxDTixHQWtDYUQsYUFBYSxjQWxDMUI7O0FBbUNBMUIsZ0JBQU0sd0JBQU4sRUFBZ0MyQjs7QUFFaEM7OztBQUZBLFlBbkNBO0FBQUEsaUJBd0NtQjlCLE1BQU0rQixJQUFOLENBQVdGOztBQUU5Qjs7O0FBRm1CLFdBeENuQjs7QUFBQTtBQXdDTUcsY0F4Q047QUFBQTtBQUFBLGlCQTZDbUIsb0JBQVdIOztBQUU5Qjs7OztBQUZtQixXQTdDbkI7O0FBQUE7QUE2Q01JLGNBN0NOO0FBbURNQyxrQkFuRE4sR0FtRGlCLGlCQUFPQyxnQkFuRHhCOztBQW9EQSwyQkFBT0EsZ0JBQVAsR0FBMEIsVUFBQ0MsSUFBRCxFQUFPQyxNQUFQLEVBQWtCO0FBQzFDLG1CQUFPRCxTQUFTLE1BQVQsR0FBa0JBLElBQWxCLEdBQXlCRixTQUFTRSxJQUFULEVBQWVDLE1BQWYsQ0FBaEM7QUFDRCxXQUZEOztBQUlBakIsa0JBQVFwQixLQUFSLENBQWNpQyxJQUFkLEdBQXFCO0FBQ25CSyxnQkFBSSxNQURlO0FBRW5CQyxzQkFBVSxNQUZTO0FBR25CQyxvQkFBUSxJQUhXO0FBSW5CQyxxQkFBU1I7O0FBR1g7OztBQVBxQixXQUFyQixDQXhEQTtBQUFBLGlCQWtFcUNoQyxTQUFTOEIsSUFBVCxDQUFjRDs7QUFFbkQ7OztBQUZxQyxXQWxFckM7O0FBQUE7QUFBQTtBQUFBO0FBa0VPWSxtQkFsRVA7QUFrRWtCQyxtQkFsRWxCO0FBdUVBLGNBQUlELFNBQUosRUFBZTtBQU1KRSw0QkFOSSxHQU1iLFNBQVNBLGdCQUFULENBQXlCQyxJQUF6QixFQUErQjtBQUM3QixrQkFBSUYsVUFBVUUsSUFBVixhQUEyQkMsS0FBL0IsRUFBc0M7QUFDcENDLDJCQUFXQSxTQUFTQyxNQUFULENBQWdCTCxVQUFVRSxJQUFWLENBQWhCLENBQVg7QUFDQUYsMEJBQVVFLElBQVYsRUFBZ0JJLE9BQWhCLENBQXdCO0FBQUEseUJBQU9MLGlCQUFnQk0sR0FBaEIsQ0FBUDtBQUFBLGlCQUF4QjtBQUNEO0FBQ0YsYUFYWTs7QUFhYjs7O0FBWkE7QUFDQTtBQUNJSCxvQkFIUyxHQUdFLEdBQUdJLEtBQUgsQ0FBU0MsSUFBVCxDQUFjL0I7O0FBRTdCO0FBRmUsYUFIRjtBQWNiMEIscUJBQVNFLE9BQVQsQ0FBaUI7QUFBQSxxQkFBUUwsaUJBQWdCQyxJQUFoQixDQUFSO0FBQUE7O0FBRWpCO0FBRkEsY0FHQSxvQkFBU0YsU0FBVCxFQUFvQkksUUFBcEI7QUFDRDs7QUFFRDs7O0FBR0lNLGNBOUZKOzs7QUFnR0EsY0FBSWhDLE1BQU1YLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDbEI0QyxnQkFEa0IsR0FDWGpDLE1BQU0sQ0FBTixDQURXOztBQUV0QmdDLG1CQUFPVixVQUFVdEIsTUFBTSxDQUFOLENBQVYsQ0FBUDs7QUFFQSxnQkFBSWdDLGdCQUFnQlAsS0FBcEIsRUFBMkI7QUFDekJPLHFCQUFPLHdCQUFlQSxJQUFmLEVBQXFCVixTQUFyQixDQUFQO0FBQ0Q7O0FBRURVLG1CQUFPLDBDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNkJBRUVBLEtBQUtFLEtBQUwsQ0FBV0QsSUFBWCxFQUFpQnpCLFVBQWpCLENBRkY7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFJSixtREFBcUJ5QixJQUFyQixFQUE2QmxELEtBQTdCLENBQW1DLFlBQUlvRCxLQUFKLGVBQW5DO0FBSkksNEJBS0csZUFMSDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUFELElBQVA7QUFRRCxXQWhCRCxNQWdCTztBQUNMSCxtQkFBT0ksUUFBUUMsR0FBUixDQUFZckMsTUFBTXNDLEdBQU47QUFBQSxvRUFBVSxrQkFBTUwsSUFBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDdkJULDRCQUR1QixHQUNoQkYsVUFBVVcsSUFBVixDQURnQjs7O0FBRzNCLDRCQUFJVCxnQkFBZ0JDLEtBQXBCLEVBQTJCO0FBQ3pCRCxpQ0FBTyx3QkFBZUEsSUFBZixFQUFxQkYsU0FBckIsQ0FBUDtBQUNEOztBQUwwQjtBQUFBO0FBQUEsK0JBUW5CRSxLQUFLVSxLQUFMLENBQVdELElBQVgsRUFBaUJ6QixVQUFqQixDQVJtQjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQVV6QixxREFBcUJ5QixJQUFyQixFQUE2QmxELEtBQTdCLENBQW1DLGFBQUlvRCxLQUFKLGdCQUFuQztBQVZ5Qiw4QkFXbEIsZUFYa0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBVjs7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFBWixDQUFQO0FBY0Q7O0FBRUQ7OztBQWpJQTtBQUFBLGlCQW9JTUgsSUFwSU47O0FBQUE7QUFBQTtBQUFBLGlCQXlJTXJELE1BQU00RCxJQUFOLENBQVcvQixVQUFYLENBeklOOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQsS0EwSUlnQyxLQTFJSixDQTBJVSxlQUFPO0FBQ2hCekQsUUFBTTBELElBQUlOLEtBQUosSUFBYU0sR0FBbkI7QUFDQTdDLFVBQVFFLElBQVIsQ0FBYSxDQUFDLENBQWQ7QUFDRCxDQTdJQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgaW5kZXguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWlcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBNb2R1bGUgZnJvbSAnbW9kdWxlJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVIb3BwIGZyb20gJy4vaG9wcCdcbmltcG9ydCBmcm9tVHJlZSBmcm9tICcuL3Rhc2tzL3RyZWUnXG5pbXBvcnQgKiBhcyBob3BwZmlsZSBmcm9tICcuL2hvcHBmaWxlJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuL3V0aWxzL2xvZydcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3Rhc2tzL3BhcmFsbGVsJ1xuXG5jb25zdCB7IGxvZywgZGVidWcsIGVycm9yIH0gPSBjcmVhdGVMb2dnZXIoJ2hvcHAnKVxuXG4vKipcbiAqIFBhcnNlIGFyZ3NcbiAqL1xuY29uc3QgYXJndiA9IChhcmdzID0+IHtcbiAgY29uc3QgbyA9IHtcbiAgICBfOiBbXVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbGV0IGEgPSBhcmdzW2ldXG5cbiAgICBpZiAoYSA9PT0gJy1oJyB8fCBhID09PSAnLS1oZWxwJykgby5oZWxwID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctVicgfHwgYSA9PT0gJy0tdmVyc2lvbicpIG8udmVyc2lvbiA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLXYnIHx8IGEgPT09ICctLXZlcmJvc2UnKSBvLnZlcmJvc2UgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIElmIHByb2plY3QgZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQsIGRvIGxvb2t1cCBmb3IgdGhlXG4gICAqIGhvcHBmaWxlLmpzXG4gICAqL1xuICBjb25zdCBwcm9qZWN0RGlyID0gKGRpcmVjdG9yeSA9PiB7XG4gICAgLy8gYWJzb2x1dGUgcGF0aHMgZG9uJ3QgbmVlZCBjb3JyZWN0aW5nXG4gICAgaWYgKGRpcmVjdG9yeVswXSA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5XG4gICAgfVxuXG4gICAgLy8gc29ydC1vZiByZWxhdGl2ZXMgc2hvdWxkIGJlIG1hZGUgaW50byByZWxhdGl2ZVxuICAgIGlmIChkaXJlY3RvcnlbMF0gIT09ICcuJykge1xuICAgICAgZGlyZWN0b3J5ID0gJy4vJyArIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIG1hcCB0byBjdXJyZW50IGRpcmVjdG9yeVxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgZGlyZWN0b3J5KVxuICB9KShhcmd2LmRpcmVjdG9yeSB8fCBhd2FpdCBob3BwZmlsZS5maW5kKHBhdGguZGlybmFtZShfX2Rpcm5hbWUpKSlcblxuICAvKipcbiAgICogU2V0IGhvcHBmaWxlIGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0LlxuICAgKiBcbiAgICogVGhpcyB3aWxsIGNhdXNlIGVycm9ycyBsYXRlciBpZiB0aGUgZGlyZWN0b3J5IHdhcyBzdXBwbGllZFxuICAgKiBtYW51YWxseSBidXQgY29udGFpbnMgbm8gaG9wcGZpbGUuIFdlIGRvbid0IHdhbnQgdG8gZG8gYSBtYWdpY1xuICAgKiBsb29rdXAgZm9yIHRoZSB1c2VyIGJlY2F1c2UgdGhleSBvdmVycm9kZSB0aGUgbWFnaWMgd2l0aCB0aGVcbiAgICogbWFudWFsIGZsYWcuXG4gICAqL1xuICBjb25zdCBmaWxlID0gcHJvamVjdERpciArICcvaG9wcGZpbGUuanMnXG4gIGRlYnVnKCdVc2luZyBob3BwZmlsZS5qcyBAICVzJywgZmlsZSlcblxuICAvKipcbiAgICogTG9hZCBjYWNoZS5cbiAgICovXG4gIGNvbnN0IGxvY2sgPSBhd2FpdCBjYWNoZS5sb2FkKHByb2plY3REaXIpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBob3BwIGluc3RhbmNlIGNyZWF0b3IuXG4gICAqL1xuICBjb25zdCBob3BwID0gYXdhaXQgY3JlYXRlSG9wcChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDYWNoZSB0aGUgaG9wcCBoYW5kbGVyIHRvIG1ha2UgYHJlcXVpcmUoKWAgd29ya1xuICAgKiBpbiB0aGUgaG9wcGZpbGUuXG4gICAqL1xuICBjb25zdCBfcmVzb2x2ZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lXG4gIE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lID0gKHdoYXQsIHBhcmVudCkgPT4ge1xuICAgIHJldHVybiB3aGF0ID09PSAnaG9wcCcgPyB3aGF0IDogX3Jlc29sdmUod2hhdCwgcGFyZW50KVxuICB9XG5cbiAgcmVxdWlyZS5jYWNoZS5ob3BwID0ge1xuICAgIGlkOiAnaG9wcCcsXG4gICAgZmlsZW5hbWU6ICdob3BwJyxcbiAgICBsb2FkZWQ6IHRydWUsXG4gICAgZXhwb3J0czogaG9wcFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGFza3MgZnJvbSBmaWxlLlxuICAgKi9cbiAgY29uc3QgW2Zyb21DYWNoZSwgdGFza0RlZm5zXSA9IGF3YWl0IGhvcHBmaWxlLmxvYWQoZmlsZSlcblxuICAvKipcbiAgICogUGFyc2UgZnJvbSBjYWNoZS5cbiAgICovXG4gIGlmIChmcm9tQ2FjaGUpIHtcbiAgICAvLyBjcmVhdGUgY29weSBvZiB0YXNrcywgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnlcbiAgICAvLyB0aGUgYWN0dWFsIGdvYWwgbGlzdFxuICAgIGxldCBmdWxsTGlzdCA9IFtdLnNsaWNlLmNhbGwodGFza3MpXG5cbiAgICAvLyB3YWxrIHRoZSBmdWxsIHRyZWVcbiAgICBmdW5jdGlvbiBhZGREZXBlbmRlbmNpZXModGFzaykge1xuICAgICAgaWYgKHRhc2tEZWZuc1t0YXNrXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZ1bGxMaXN0ID0gZnVsbExpc3QuY29uY2F0KHRhc2tEZWZuc1t0YXNrXSlcbiAgICAgICAgdGFza0RlZm5zW3Rhc2tdLmZvckVhY2goc3ViID0+IGFkZERlcGVuZGVuY2llcyhzdWIpKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN0YXJ0IHdhbGtpbmcgZnJvbSB0b3BcbiAgICBmdWxsTGlzdC5mb3JFYWNoKHRhc2sgPT4gYWRkRGVwZW5kZW5jaWVzKHRhc2spKVxuXG4gICAgLy8gcGFyc2UgYWxsIHRhc2tzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXNcbiAgICBmcm9tVHJlZSh0YXNrRGVmbnMsIGZ1bGxMaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrcy5cbiAgICovXG4gIGxldCBnb2FsXG5cbiAgaWYgKHRhc2tzLmxlbmd0aCA9PT0gMSkge1xuICAgIGxldCBuYW1lID0gdGFza3NbMF1cbiAgICBnb2FsID0gdGFza0RlZm5zW3Rhc2tzWzBdXVxuICAgIFxuICAgIGlmIChnb2FsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGdvYWwgPSBjcmVhdGVQYXJhbGxlbChnb2FsLCB0YXNrRGVmbnMpXG4gICAgfVxuXG4gICAgZ29hbCA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnb2FsLnN0YXJ0KG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgbGV0IHRhc2sgPSB0YXNrRGVmbnNbbmFtZV1cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gY3JlYXRlUGFyYWxsZWwodGFzaywgdGFza0RlZm5zKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0YXNrLnN0YXJ0KG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRhc2sgY29tcGxldGlvbi5cbiAgICovXG4gIGF3YWl0IGdvYWxcblxuICAvKipcbiAgICogU3RvcmUgY2FjaGUgZm9yIGxhdGVyLlxuICAgKi9cbiAgYXdhaXQgY2FjaGUuc2F2ZShwcm9qZWN0RGlyKVxufSkoKS5jYXRjaChlcnIgPT4ge1xuICBlcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICBwcm9jZXNzLmV4aXQoLTEpXG59KVxuIl19