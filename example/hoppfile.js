import hopp from 'hopp'

export const css =
  hopp([ 'src/css/*.css' ])
    .dest('dist/css')

export const js =
  hopp([ 'src/js/*.js' ]) // create fs streams
    // .babel()              // pipe to (create babel stream)
    .dest('dist/js')         // pipe to (create dest stream)

export default [
  'js',
  'css'
]