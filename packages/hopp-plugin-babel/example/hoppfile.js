const hopp = require('hopp')

hopp.load(`${__dirname}/../`)

exports.default =
  hopp('src/*.js')
    .babel({
      babelrc: false,
      sourceMap: true,
      presets: ['env']
    })
    .dest('dist')
