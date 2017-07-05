const hopp = require('hopp')

hopp.load(`${__dirname}/../`)

exports.default =
  hopp('src/*.less')
    .accord('less', {
      sourcemap: true
    })
    .dest('dist')
