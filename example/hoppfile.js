import hopp from 'hopp'

export const css =
  hopp([ 'src/css/*.css' ])
    .dest('dist')

export const js =
  hopp([ 'src/js/*.js' ])
    .dest('dist')

export default [
  'js',
  'css'
]