const hopp = require('hopp')

exports.default =
  hopp('src/*.less')
    .accord('less', {
      sourcemap: true
    })
    .dest('dist')
