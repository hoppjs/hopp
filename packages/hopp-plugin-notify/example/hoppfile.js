const hopp = require('hopp')

exports.test =
  hopp('src/*.js')
    .notify()
    .dest('dist')

exports.default =
  hopp.watch([
    'test'
  ])
