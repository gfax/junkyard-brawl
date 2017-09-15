const Ava = require('ava')
const Deck = require('./deck')

Ava.test('Should return an object', (t) => {
  t.is(typeof Deck, 'object')
})

Ava.test('Should generate a deck', (t) => {
  t.true(Array.isArray(Deck.generate()))
})

Ava.test('Should not contain invalid cards in a deck', (t) => {
  Deck.generate()
    .forEach((card) => {
      t.is(typeof card, 'object')
      t.true(Array.isArray(card.type.match(/^(attack|support)$/)))
    })
})
