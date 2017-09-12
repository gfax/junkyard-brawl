const Ava = require('ava')
const Junkyard = require('./junkyard')

Ava.test('Should allow instantiation', (t) => {
  const game = new Junkyard('player123')
  t.is(typeof game.manager, 'object')
  t.is('player123', game.manager.id)
})
