import hopp from 'hopp'

export const css =
  hopp([ 'src/js/**/*.js' ])
    .dest('dist/js')

export const js =
  hopp([ 'src/js/**/*.js' ])
    .concat()
    .dest('dist/js/bundle.js')

export const watch = hopp.watch([
  'js',
  'css'
])

export default hopp.all([
  'js',
  'css'
])
