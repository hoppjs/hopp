const hopp = require('hopp')

hopp.load(`${__dirname}/../../../packages/hopp-plugin-concat`)

exports.default =
  hopp('src/*.js')
    .concat()
    .dest('dist/bundle.js')