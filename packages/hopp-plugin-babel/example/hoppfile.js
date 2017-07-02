const hopp = require('hopp')

exports.default =
  hopp('src/*.js')
    .babel({
      babelrc: false,
      sourceMap: true,
      presets: ['env']
    })
    .dest('dist')
