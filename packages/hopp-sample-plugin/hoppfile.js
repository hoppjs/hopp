import hopp from 'hopp'

export default
hopp('lib/*.js')
  .babel()
  .dest('dist')
