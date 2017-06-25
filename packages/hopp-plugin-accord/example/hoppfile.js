import hopp from 'hopp'

export default
  hopp('src/*.less')
    .accord('less')
    .dest('dist')