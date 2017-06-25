import hopp from 'hopp'

export default
  hopp('src/*.js')
    .plugin()
    .dest('dist')