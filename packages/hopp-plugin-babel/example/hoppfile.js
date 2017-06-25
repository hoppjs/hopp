import hopp from 'hopp'

export default
  hopp('src/*.js')
    .babel({
      babelrc: false,
      sourceMap: true,
      presets: ['env']
    })
    .dest('dist')