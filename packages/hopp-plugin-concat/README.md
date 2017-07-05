# hopp-plugin-concat

Concatenate files together with hopp.

[![NPM](https://nodei.co/npm/hopp-plugin-concat.png)](https://nodei.co/npm/hopp-plugin-concat/)

## Usage

This plugin exposes a single function that takes no parameters (currently).

Since this function will bundle all the source files together, please ensure that you
specify a filename with `.dest()` and not a folder.

Sample:

```javascript
const hopp = require('hopp')

export default
  hopp([ 'src/js/*.js' ])
    .concat()
    .dest('dist/js/bundle.js')
```

## License

Licensed under MIT license.

Copyright (C) 2017 10244872 Canada Inc.