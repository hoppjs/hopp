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

    if (a === '-h' || a === '--help') o.help = true;else if (a === '-V' || a === '--version') o.version = true;else if (a === '-v' || a === '--verbose') o.verbose = true;else if (a === '-H' || a === '--harmony') o.harmony = true;else if (a === '-d' || a === '--directory') o.directory = args[++i];else if (a[0] !== '-') o._.push(a);
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
  console.log('  -H, --harmony\tauto-transpile hoppfile features');
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
           * Harmony flag for transpiling hoppfiles.
           */
          );process.env.HARMONY_FLAG = process.env.HARMONY_FLAG || !!argv.harmony;

          /**
           * If project directory not specified, do lookup for the
           * hoppfile.js
           */

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
            _context3.next = 9;
            break;
          }

          _context3.next = 8;
          return hoppfile.find(_path2.default.dirname(__dirname));

        case 8:
          _context3.t1 = _context3.sent;

        case 9:
          _context3.t2 = _context3.t1;
          projectDir = (0, _context3.t0)(_context3.t2);
          file = projectDir + '/hoppfile.js';

          debug('Using hoppfile.js @ %s', file

          /**
           * Load cache.
           */
          );_context3.next = 15;
          return cache.load(projectDir

          /**
           * Create hopp instance creator.
           */
          );

        case 15:
          lock = _context3.sent;
          _context3.next = 18;
          return (0, _hopp2.default)(projectDir

          /**
           * Cache the hopp handler to make `require()` work
           * in the hoppfile.
           */
          );

        case 18:
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
          };_context3.next = 24;
          return hoppfile.load(file

          /**
           * Parse from cache.
           */
          );

        case 24:
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
          _context3.next = 33;
          return goal;

        case 33:
          _context3.next = 35;
          return cache.save(projectDir);

        case 35:
        case 'end':
          return _context3.stop();
      }
    }
  }, _callee3, undefined);
}))().catch(function (err) {
  error(err.stack || err);
  process.exit(-1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjYWNoZSIsImhvcHBmaWxlIiwibG9nIiwiZGVidWciLCJlcnJvciIsImFyZ3YiLCJvIiwiXyIsImkiLCJhcmdzIiwibGVuZ3RoIiwiYSIsImhlbHAiLCJ2ZXJzaW9uIiwidmVyYm9zZSIsImhhcm1vbnkiLCJkaXJlY3RvcnkiLCJwdXNoIiwicHJvY2VzcyIsImNvbnNvbGUiLCJleGl0IiwicmVxdWlyZSIsInRhc2tzIiwiZW52IiwiSE9QUF9ERUJVRyIsIkhBUk1PTllfRkxBRyIsInJlc29sdmUiLCJjd2QiLCJmaW5kIiwiZGlybmFtZSIsIl9fZGlybmFtZSIsInByb2plY3REaXIiLCJmaWxlIiwibG9hZCIsImxvY2siLCJob3BwIiwiX3Jlc29sdmUiLCJfcmVzb2x2ZUZpbGVuYW1lIiwid2hhdCIsInBhcmVudCIsImlkIiwiZmlsZW5hbWUiLCJsb2FkZWQiLCJleHBvcnRzIiwiZnJvbUNhY2hlIiwidGFza0RlZm5zIiwiYWRkRGVwZW5kZW5jaWVzIiwidGFzayIsIkFycmF5IiwiZnVsbExpc3QiLCJjb25jYXQiLCJmb3JFYWNoIiwic3ViIiwic2xpY2UiLCJjYWxsIiwiZ29hbCIsIm5hbWUiLCJzdGFydCIsInN0YWNrIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInNhdmUiLCJjYXRjaCIsImVyciJdLCJtYXBwaW5ncyI6Ijs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztJQUFZQyxROztBQUNaOzs7O0FBQ0E7Ozs7Ozs7OzJjQWZBOzs7Ozs7b0JBaUI4QixtQkFBYTs7QUFFM0M7OztBQUY4QixDO0lBQXRCQyxHLGlCQUFBQSxHO0lBQUtDLEssaUJBQUFBLEs7SUFBT0MsSyxpQkFBQUEsSzs7QUFLcEIsSUFBTUMsT0FBUSxnQkFBUTtBQUNwQixNQUFNQyxJQUFJO0FBQ1JDLE9BQUc7QUFESyxHQUFWOztBQUlBLE9BQUssSUFB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QUFQO0FBQ0Q7O0FBTDBCO0FBQUE7QUFBQSwrQkFRbkJFLEtBQUtVLEtBQUwsQ0FBV0QsSUFBWCxFQUFpQnpCLFVBQWpCLENBUm1COztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBVXpCLHFEQUFxQnlCLElBQXJCLEVBQTZCcEQsS0FBN0IsQ0FBbUMsYUFBSXNELEtBQUosZ0JBQW5DO0FBVnlCLDhCQVdsQixlQVhrQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUFWOztBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQUFaLENBQVA7QUFjRDs7QUFFRDs7O0FBdElBO0FBQUEsaUJBeUlNSCxJQXpJTjs7QUFBQTtBQUFBO0FBQUEsaUJBOElNdkQsTUFBTThELElBQU4sQ0FBVy9CLFVBQVgsQ0E5SU47O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCxLQStJSWdDLEtBL0lKLENBK0lVLGVBQU87QUFDaEIzRCxRQUFNNEQsSUFBSU4sS0FBSixJQUFhTSxHQUFuQjtBQUNBOUMsVUFBUUUsSUFBUixDQUFhLENBQUMsQ0FBZDtBQUNELENBbEpBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBpbmRleC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaVxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IE1vZHVsZSBmcm9tICdtb2R1bGUnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IGNyZWF0ZUhvcHAgZnJvbSAnLi9ob3BwJ1xuaW1wb3J0IGZyb21UcmVlIGZyb20gJy4vdGFza3MvdHJlZSdcbmltcG9ydCAqIGFzIGhvcHBmaWxlIGZyb20gJy4vaG9wcGZpbGUnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4vdXRpbHMvbG9nJ1xuaW1wb3J0IGNyZWF0ZVBhcmFsbGVsIGZyb20gJy4vdGFza3MvcGFyYWxsZWwnXG5cbmNvbnN0IHsgbG9nLCBkZWJ1ZywgZXJyb3IgfSA9IGNyZWF0ZUxvZ2dlcignaG9wcCcpXG5cbi8qKlxuICogUGFyc2UgYXJnc1xuICovXG5jb25zdCBhcmd2ID0gKGFyZ3MgPT4ge1xuICBjb25zdCBvID0ge1xuICAgIF86IFtdXG4gIH1cblxuICBmb3IgKGxldCBpID0gMjsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBsZXQgYSA9IGFyZ3NbaV1cblxuICAgIGlmIChhID09PSAnLWgnIHx8IGEgPT09ICctLWhlbHAnKSBvLmhlbHAgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1WJyB8fCBhID09PSAnLS12ZXJzaW9uJykgby52ZXJzaW9uID0gdHJ1ZVxuICAgIGVsc2UgaWYgKGEgPT09ICctdicgfHwgYSA9PT0gJy0tdmVyYm9zZScpIG8udmVyYm9zZSA9IHRydWVcbiAgICBlbHNlIGlmIChhID09PSAnLUgnIHx8IGEgPT09ICctLWhhcm1vbnknKSBvLmhhcm1vbnkgPSB0cnVlXG4gICAgZWxzZSBpZiAoYSA9PT0gJy1kJyB8fCBhID09PSAnLS1kaXJlY3RvcnknKSBvLmRpcmVjdG9yeSA9IGFyZ3NbKytpXVxuICAgIGVsc2UgaWYgKGFbMF0gIT09ICctJykgby5fLnB1c2goYSlcbiAgfVxuXG4gIHJldHVybiBvXG59KShwcm9jZXNzLmFyZ3YpXG5cbi8qKlxuICogUHJpbnQgaGVscC5cbiAqL1xuZnVuY3Rpb24gaGVscCgpIHtcbiAgY29uc29sZS5sb2coJ3VzYWdlOiBob3BwIFtPUFRJT05TXSBbVEFTS1NdJylcbiAgY29uc29sZS5sb2coJycpXG4gIGNvbnNvbGUubG9nKCcgIC1kLCAtLWRpcmVjdG9yeSBbZGlyXVxcdHBhdGggdG8gcHJvamVjdCBkaXJlY3RvcnknKVxuICBjb25zb2xlLmxvZygnICAtdiwgLS12ZXJib3NlXFx0ZW5hYmxlIGRlYnVnIG1lc3NhZ2VzJylcbiAgY29uc29sZS5sb2coJyAgLUgsIC0taGFybW9ueVxcdGF1dG8tdHJhbnNwaWxlIGhvcHBmaWxlIGZlYXR1cmVzJylcbiAgY29uc29sZS5sb2coJyAgLVYsIC0tdmVyc2lvblxcdGdldCB2ZXJzaW9uIGluZm8nKVxuICBjb25zb2xlLmxvZygnICAtaCwgLS1oZWxwXFx0ZGlzcGxheSB0aGlzIG1lc3NhZ2UnKVxuXG4gIHByb2Nlc3MuZXhpdCgxKVxufVxuXG5pZiAoYXJndi52ZXJzaW9uKSB7XG4gIGNvbnNvbGUubG9nKHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24pXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB0aGUgb25seSB3YXkgZm9yIGhlbHAgdG8gYmUgY2FsbGVkLlxuICogTGF0ZXIsIGl0IHNob3VsZCBhbHNvIGhhcHBlbiBvbiBpbnZhbGlkIGFyZ3MgYnV0IHdlXG4gKiBkb24ndCBoYXZlIGludmFsaWQgYXJndW1lbnRzIHlldC5cbiAqIFxuICogSW52YWxpZCBhcmd1bWVudHMgaXMgYSBmbGFnIG1pc3VzZSAtIG5ldmVyIGEgbWlzc2luZ1xuICogdGFzay4gVGhhdCBlcnJvciBzaG91bGQgYmUgbW9yZSBtaW5pbWFsIGFuZCBzZXBhcmF0ZS5cbiAqL1xuaWYgKGFyZ3YuaGVscCkge1xuICBoZWxwKClcbn1cblxuLyoqXG4gKiBTZXQgdGFza3MuXG4gKi9cbmNvbnN0IHRhc2tzID0gYXJndi5fLmxlbmd0aCA9PT0gMCA/IFsnZGVmYXVsdCddIDogYXJndi5fXG5cbjsoYXN5bmMgKCkgPT4ge1xuICAvKipcbiAgICogUGFzcyB2ZXJib3NpdHkgdGhyb3VnaCB0byB0aGUgZW52LlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyA9IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgfHwgISEgYXJndi52ZXJib3NlXG4gIGRlYnVnKCdTZXR0aW5nIEhPUFBfREVCVUcgPSAlaicsIHByb2Nlc3MuZW52LkhPUFBfREVCVUcpXG5cbiAgLyoqXG4gICAqIEhhcm1vbnkgZmxhZyBmb3IgdHJhbnNwaWxpbmcgaG9wcGZpbGVzLlxuICAgKi9cbiAgcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID0gcHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHIHx8ICEhIGFyZ3YuaGFybW9ueVxuXG4gIC8qKlxuICAgKiBJZiBwcm9qZWN0IGRpcmVjdG9yeSBub3Qgc3BlY2lmaWVkLCBkbyBsb29rdXAgZm9yIHRoZVxuICAgKiBob3BwZmlsZS5qc1xuICAgKi9cbiAgY29uc3QgcHJvamVjdERpciA9IChkaXJlY3RvcnkgPT4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGRvbid0IG5lZWQgY29ycmVjdGluZ1xuICAgIGlmIChkaXJlY3RvcnlbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIGRpcmVjdG9yeVxuICAgIH1cblxuICAgIC8vIHNvcnQtb2YgcmVsYXRpdmVzIHNob3VsZCBiZSBtYWRlIGludG8gcmVsYXRpdmVcbiAgICBpZiAoZGlyZWN0b3J5WzBdICE9PSAnLicpIHtcbiAgICAgIGRpcmVjdG9yeSA9ICcuLycgKyBkaXJlY3RvcnlcbiAgICB9XG5cbiAgICAvLyBtYXAgdG8gY3VycmVudCBkaXJlY3RvcnlcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGRpcmVjdG9yeSlcbiAgfSkoYXJndi5kaXJlY3RvcnkgfHwgYXdhaXQgaG9wcGZpbGUuZmluZChwYXRoLmRpcm5hbWUoX19kaXJuYW1lKSkpXG5cbiAgLyoqXG4gICAqIFNldCBob3BwZmlsZSBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgcHJvamVjdC5cbiAgICogXG4gICAqIFRoaXMgd2lsbCBjYXVzZSBlcnJvcnMgbGF0ZXIgaWYgdGhlIGRpcmVjdG9yeSB3YXMgc3VwcGxpZWRcbiAgICogbWFudWFsbHkgYnV0IGNvbnRhaW5zIG5vIGhvcHBmaWxlLiBXZSBkb24ndCB3YW50IHRvIGRvIGEgbWFnaWNcbiAgICogbG9va3VwIGZvciB0aGUgdXNlciBiZWNhdXNlIHRoZXkgb3ZlcnJvZGUgdGhlIG1hZ2ljIHdpdGggdGhlXG4gICAqIG1hbnVhbCBmbGFnLlxuICAgKi9cbiAgY29uc3QgZmlsZSA9IHByb2plY3REaXIgKyAnL2hvcHBmaWxlLmpzJ1xuICBkZWJ1ZygnVXNpbmcgaG9wcGZpbGUuanMgQCAlcycsIGZpbGUpXG5cbiAgLyoqXG4gICAqIExvYWQgY2FjaGUuXG4gICAqL1xuICBjb25zdCBsb2NrID0gYXdhaXQgY2FjaGUubG9hZChwcm9qZWN0RGlyKVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgaG9wcCBpbnN0YW5jZSBjcmVhdG9yLlxuICAgKi9cbiAgY29uc3QgaG9wcCA9IGF3YWl0IGNyZWF0ZUhvcHAocHJvamVjdERpcilcblxuICAvKipcbiAgICogQ2FjaGUgdGhlIGhvcHAgaGFuZGxlciB0byBtYWtlIGByZXF1aXJlKClgIHdvcmtcbiAgICogaW4gdGhlIGhvcHBmaWxlLlxuICAgKi9cbiAgY29uc3QgX3Jlc29sdmUgPSBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZVxuICBNb2R1bGUuX3Jlc29sdmVGaWxlbmFtZSA9ICh3aGF0LCBwYXJlbnQpID0+IHtcbiAgICByZXR1cm4gd2hhdCA9PT0gJ2hvcHAnID8gd2hhdCA6IF9yZXNvbHZlKHdoYXQsIHBhcmVudClcbiAgfVxuXG4gIHJlcXVpcmUuY2FjaGUuaG9wcCA9IHtcbiAgICBpZDogJ2hvcHAnLFxuICAgIGZpbGVuYW1lOiAnaG9wcCcsXG4gICAgbG9hZGVkOiB0cnVlLFxuICAgIGV4cG9ydHM6IGhvcHBcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHRhc2tzIGZyb20gZmlsZS5cbiAgICovXG4gIGNvbnN0IFtmcm9tQ2FjaGUsIHRhc2tEZWZuc10gPSBhd2FpdCBob3BwZmlsZS5sb2FkKGZpbGUpXG5cbiAgLyoqXG4gICAqIFBhcnNlIGZyb20gY2FjaGUuXG4gICAqL1xuICBpZiAoZnJvbUNhY2hlKSB7XG4gICAgLy8gY3JlYXRlIGNvcHkgb2YgdGFza3MsIHdlIGRvbid0IHdhbnQgdG8gbW9kaWZ5XG4gICAgLy8gdGhlIGFjdHVhbCBnb2FsIGxpc3RcbiAgICBsZXQgZnVsbExpc3QgPSBbXS5zbGljZS5jYWxsKHRhc2tzKVxuXG4gICAgLy8gd2FsayB0aGUgZnVsbCB0cmVlXG4gICAgZnVuY3Rpb24gYWRkRGVwZW5kZW5jaWVzKHRhc2spIHtcbiAgICAgIGlmICh0YXNrRGVmbnNbdGFza10gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBmdWxsTGlzdCA9IGZ1bGxMaXN0LmNvbmNhdCh0YXNrRGVmbnNbdGFza10pXG4gICAgICAgIHRhc2tEZWZuc1t0YXNrXS5mb3JFYWNoKHN1YiA9PiBhZGREZXBlbmRlbmNpZXMoc3ViKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzdGFydCB3YWxraW5nIGZyb20gdG9wXG4gICAgZnVsbExpc3QuZm9yRWFjaCh0YXNrID0+IGFkZERlcGVuZGVuY2llcyh0YXNrKSlcblxuICAgIC8vIHBhcnNlIGFsbCB0YXNrcyBhbmQgdGhlaXIgZGVwZW5kZW5jaWVzXG4gICAgZnJvbVRyZWUodGFza0RlZm5zLCBmdWxsTGlzdClcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFza3MuXG4gICAqL1xuICBsZXQgZ29hbFxuXG4gIGlmICh0YXNrcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgbmFtZSA9IHRhc2tzWzBdXG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gY3JlYXRlUGFyYWxsZWwoZ29hbCwgdGFza0RlZm5zKVxuICAgIH1cblxuICAgIGdvYWwgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZ29hbC5zdGFydChuYW1lLCBwcm9qZWN0RGlyKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSgpXG4gIH0gZWxzZSB7XG4gICAgZ29hbCA9IFByb21pc2UuYWxsKHRhc2tzLm1hcChhc3luYyBuYW1lID0+IHtcbiAgICAgIGxldCB0YXNrID0gdGFza0RlZm5zW25hbWVdXG5cbiAgICAgIGlmICh0YXNrIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGFzayA9IGNyZWF0ZVBhcmFsbGVsKHRhc2ssIHRhc2tEZWZucylcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGFzay5zdGFydChuYW1lLCBwcm9qZWN0RGlyKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciB0YXNrIGNvbXBsZXRpb24uXG4gICAqL1xuICBhd2FpdCBnb2FsXG5cbiAgLyoqXG4gICAqIFN0b3JlIGNhY2hlIGZvciBsYXRlci5cbiAgICovXG4gIGF3YWl0IGNhY2hlLnNhdmUocHJvamVjdERpcilcbn0pKCkuY2F0Y2goZXJyID0+IHtcbiAgZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgcHJvY2Vzcy5leGl0KC0xKVxufSlcbiJdfQ==