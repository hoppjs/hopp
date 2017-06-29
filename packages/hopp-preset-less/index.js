/**
 * @file index.js
 * @description Preset to compile LESS.
 * @license MIT
 */

module.exports = opts => [
  [require.resolve('hopp-plugin-accord'), ['less', opts]],
  ['rename', [{ ext: 'css' }]]
]
