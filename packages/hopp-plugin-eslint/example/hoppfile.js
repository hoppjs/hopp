const hopp = require('hopp')

hopp.load(`${__dirname}/..`)

exports.default =
  hopp('src/*.js')
    .eslint()
    .eslint.format()
    .eslint.failOnError()