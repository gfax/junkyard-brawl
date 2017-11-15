const Ava = require('ava')
const Player = require('./player')

Ava.test('Should instantiate an object', (t) => {
  t.is(typeof new Player('user123', 'Kevin', 10), 'object')
})

Ava.test('Should require a player ID', (t) => {
  t.throws(() => {
    new Player(null, 'Kevin', 10)
  })
})

Ava.test('Should require the player name to be a string', (t) => {
  t.throws(() => new Player('user123'))
  t.throws(() => new Player('user123', 2, 10))
})
