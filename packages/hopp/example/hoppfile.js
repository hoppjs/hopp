import hopp from 'hopp'

export const css =
  hopp([ 'src/css/**/*.css' ])
    .dest('dist/css')

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