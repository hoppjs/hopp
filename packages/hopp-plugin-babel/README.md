# hopp-plugin-babel

Use babel with hopp.

[![NPM](https://nodei.co/npm/hopp-plugin-babel.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/hopp-plugin-babel/)

## Usage

Setup babel the way you usually do (create a .babelrc, install presets, blah blah).

This plugin exposes a single function, `.babel()` which takes an options object and passes
it forwards to babel.

Sample:

```javascript
import hopp from 'hopp'

export default
  hopp([ 'src/*.js' ])
    // the options object is optional and will
    // be passed directly to babel
    .babel({
      presets: [
        'env'
      ]
    })
    .dest('dist')
```

## License

Licensed under MIT license.

Copyright &copy; 2017 10244872 Canada Inc.