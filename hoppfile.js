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
exports['hopp:latest'] =
  hopp('./packages/hopp/src/**/**.js')
    .babel({
      babelrc: false,
      sourceMaps: true,
      presets: [
        ['env', {
          targets: {
            node: '7'
          }
        }]
      ]
    })
    .dest('./packages/hopp/dist')

exports['hopp:legacy'] =
  hopp('./packages/hopp/src/**/**.js')
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
    .dest('./packages/hopp/dist-legacy')

exports['hopp'] =
  hopp.all([
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