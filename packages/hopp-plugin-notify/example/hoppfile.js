import hopp from 'hopp'

export const test =
  hopp('src/*.js')
    .notify()
    .dest('dist')

export default hopp.watch([
  'test'
])
