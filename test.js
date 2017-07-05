class Test {
  constructor (name) {
    this.name = name
  }
}

// ...

const plugin = {
  default: function () {
    console.log('default: %s', this.name)
  },

  who: function () {
    console.log('who: %s', this.name)
  }
}

plugin.who.ami = function () {
  this.who()
  console.log('ami: %s', this.name)
}

// ...
function createProxy(fn) {
  return fn.apply(this, arguments)
}

// ....

Test.prototype.plugin = plugin.default
Test.prototype.plugin_who = createProxy(plugin.who)
Test.prototype.plugin_who_ami = createProxy(plugin.who.ami)

Test.prototype.plugin.who = createProxy(function () { this.who() })
Test.prototype.plugin.who.ami = createProxy(function () { this.who_ami() })

// ...

new Test(1).who.ami()
new Test(2).who.ami()

/**

on add:

pluginCopy[who_ami] = who.ami

copy = Object.create(pluginCopy)

 */