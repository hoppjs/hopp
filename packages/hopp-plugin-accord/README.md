# hopp-plugin-accord

> A unified interface for compiled languages and templates in JavaScript.

[![NPM](https://nodei.co/npm/hopp-plugin-accord.png)](https://nodei.co/npm/hopp-plugin-accord/)

## Usage

The API is very simple. There's a single function available called `accord()`
and it takes two parameters:

 - **engine**: the engine name, passed as-is to `accord` in the background.
 - **options**: any options you'd like to pass to accord.

Sample:

```javascript
const hopp = require('hopp')

export default
  hopp([ 'src/less/*.less' ])
    .accord('less')
    .rename({ ext: '.css' })
    .dest('dist/css')
```

**Note:** Files are never renamed. You should handle this yourself. Also covered by the example.

## License

Licensed under MIT license.

Copyright (C) 2017 10244872 Canada Inc.