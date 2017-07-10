const hopp = require('hopp')

hopp.load(`${__dirname}/../`)

exports.default =
  hopp('src/*.js')
    .concat({
      prefix:"@Rock"
    })
    .dest('dist.lock')
