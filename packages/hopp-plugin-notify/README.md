# hopp-plugin-notify

![There was a demo here.](https://raw.githubusercontent.com/hoppjs/hopp/master/packages/hopp-plugin-notify/.github/demo.gif)

Shows push notifications on build completion. Useful for watch tasks.

## Usage

Simple:

```javascript
export default
  hopp('src/*.js')
    .notify()
    .dest('dist')

export const watch =
  hopp.watch([
    'default'
  ])
```

All [node-notifier](https://www.npmjs.com/package/node-notifier) options are valid.

## License

Licensed under MIT license.

Copyright (C) 2017 10244872 Canada Inc.
