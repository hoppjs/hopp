import hopp from 'hopp'

export default
  hopp('src/*.less')
    .accord('less', {
      sourcemap: true
    })
    .dest('dist')