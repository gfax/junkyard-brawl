const Ava = require('ava')
const Deck = require('./deck')

Ava.test('Should return an object', (t) => {
  t.is(typeof Deck, 'object')
})
