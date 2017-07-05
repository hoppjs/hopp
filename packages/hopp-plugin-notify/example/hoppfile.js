const hopp = require('hopp')

hopp.load(`${__dirname}/../`)

exports.test =
  hopp('src/*.js')
    .notify()
    .dest('dist')

exports.default =
  hopp.watch([
    'test'
  ])
