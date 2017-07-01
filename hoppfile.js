/**
 * @file hoppfile.js
 * @license MIT
 * @copyright 10244872 Canada Inc.
 */

const hopp = require('hopp')

/**
 * Set of plugins.
 */
const plugins = [
  'hopp-sample-plugin',
  'hopp-plugin-accord',
  'hopp-plugin-babel',
  'hopp-plugin-concat',
]

/**
 * Setup plugins.
 */
plugins.forEach(name => {
  exports[name] =
    hopp(`./packages/${name}/lib/**/**.js`)
      .babel({
        babelrc: false,
        sourceMaps: true,
        presets: [
          ['env', {
            targets: {
              node: '4'
            }
          }]
        ]
      })
      .dest(`./packages/${name}/dist`)
})

/**
 * Handle hopp building.
 */
function buildHopp(opts, dest) {
  opts.presets = opts.presets || []
  opts.presets.push('bluebird')

  return hopp('./packages/hopp/src/**/**.js')
    .rename((file, dir, src) => {
      return dir + src.substr(src.indexOf('hopp/src') + 'hopp/src'.length)
    })
    .babel(Object.assign({
      babelrc: false,
      sourceMaps: true
    }, opts))
    .dest('./packages/hopp/' + dest)
}

exports['hopp:latest'] =
  buildHopp({
    plugins: ['transform-es2015-modules-commonjs']
  }, 'dist')

exports['hopp:legacy'] =
  buildHopp({
    presets: [
      ['env', {
        targets: {
          node: '4'
        }
      }]
    ]
  }, 'dist-legacy')

exports['hopp'] =
  hopp.steps([
    'hopp:latest',
    'hopp:legacy'
  ])

/**
 * Do all.
 */
exports.default = hopp.all(plugins.concat([ 'hopp' ]))

/**
 * Watch all.
 */
exports.watch = hopp.watch(plugins.concat([ 'hopp' ]))