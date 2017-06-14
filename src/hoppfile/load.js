/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import { stat, readFile } from '../fs'
import env from 'babel-preset-env'
import * as cache from '../cache'
import { dirname } from 'path'
import req from 'require-like'
import { Script } from 'vm'
import * as UN from '../utils/uninum'

const babel = require('babel-core')

export default async file => {
  // if bad args die
  if ( typeof file !== 'string' ) {
    throw new Error('Unknown arguments')
  }

  // get file contents
  const lmod = +(await stat(file)).mtime
  const data = await readFile(file, 'utf8')

  // try to load from cache
  const state = {}
  ;[state.lmod, state.tasks] = cache.val('_') || []

  // unpack time
  state.lmod = UN.toNumber(state.lmod)

  if (state.lmod === lmod) {
    return [true, state.tasks]
  }

  // compile with babel
  const { code } = babel.transform(data, {
    babelrc: false,
    presets: [
      [env, {
        targets: {
          node: 'current'
        }
      }]
    ]
  })

  // setup virtual script
  const script = new Script(
    `(function (exports, require, module, __filename, __dirname) {
      ${code}
     }(scope.exports, scope.require, scope.module, scope.__filename, scope.__dirname))`
  , {
    filename: file,
    displayErrors: true
  })

  // setup mock scope
  const scopeExports = {}
      , scope = {
          exports: scopeExports,
          require: req(file),
          module: {
            exports: scopeExports
          },

          __dirname: dirname(file),
          __filename: file
        }

  // expose to script
  global.scope = scope

  // run script
  script.runInThisContext({
    filename: file
  })

  // clean global scope
  delete global.scope

  // cache exports
  cache.val('_', [
    UN.toString(lmod),
    scope.module.exports
  ])

  // return exports
  return [false, scope.module.exports]
}