# hopp-plugin-notify

Shows push notifications whens builds complete. Useful for watch tasks.

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
