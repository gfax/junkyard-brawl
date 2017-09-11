const Ava = require('ava')
const Junkyard = require('./junkyard')

Ava.test('Should allow instantiation', (t) => {
  const instance = new Junkyard('player123')
  t.is(typeof instance.printManager, 'function')
})
