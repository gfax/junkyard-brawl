const Ava = require('ava')

const Deck = require('./deck')
const Player = require('./player')

Ava.test('Should return an object', (t) => {
  t.is(typeof Deck, 'object')
})

Ava.test('generate() should generate a deck', (t) => {
  t.true(Array.isArray(Deck.generate()))
})

Ava.test('generate() should not contain invalid cards in a deck', (t) => {
  const validTypes = /^(attack|counter|disaster|support|unstoppable)$/
  Deck.generate()
    .forEach((card) => {
      t.is(typeof card, 'object')
      t.is(typeof card.id, 'string')
      t.true(
        Array.isArray(card.type.match(validTypes)),
        `Card ${card.id} has an invalid type: ${card.type}`
      )
      if (card.type === 'counter') {
        t.is(
          typeof card.counter,
          'function',
          `Counter card ${card.id} should have a counter function. Got: ${card.counter}`
        )
      }
      if (card.filter) {
        t.deepEqual(
          card.filter([]),
          [],
          `Card filters should return empty arrays for empty requests. Got ${card.filter([])}`
        )
      }
    })
})

Ava.test('getCard() should return a card object', (t) => {
  const card = Deck.getCard('gut-punch')
  t.is(card.id, 'gut-punch')
  t.is(card.type, 'attack')
})

Ava.test('getCard() should throw an error when requesting an invalid card', (t) => {
  t.throws(() => Deck.getCard('fakecard'))
})

Ava.test('parseCards() should throw an error when not given a player', (t) => {
  t.throws(() => {
    Deck.parseCards(null, Deck.getCard('gut-punch'))
  }, /expected first param/i)
})

Ava.test('parseCards() should throw an error when not passed a request', (t) => {
  t.throws(() => Deck.parseCards(new Player('user1', 'Jay', 10)))
})

Ava.test('parseCards() should throw an error when passed invalid cards', (t) => {
  t.throws(() => Deck.parseCards(
    new Player('user1', 'Jay', 10),
    [{ id: 'gut-punch' }]
  ))
})

Ava.test('parseCards() should return an empty array when a player has no cards', (t) => {
  t.deepEqual(
    Deck.parseCards(new Player('user1', 'Jay', 10), '1 2 3'),
    []
  )
})

Ava.test('parseCards() should return an empty array when passed an empty array', (t) => {
  t.deepEqual(Deck.parseCards(new Player('user1', 'Jay', 10), []), [])
})

Ava.test('parseCards() should parse a card object', (t) => {
  t.deepEqual(
    Deck.parseCards(new Player('user1', 'Jay', 10), Deck.getCard('gut-punch')),
    [Deck.getCard('gut-punch')]
  )
})

Ava.test('parseCards() should parse a string of numbers', (t) => {
  const player = new Player('user1', 'Jay', 10)
  player.hand = [
    Deck.getCard('gut-punch'),
    Deck.getCard('neck-punch'),
    Deck.getCard('guard-dog')
  ]
  t.deepEqual(
    Deck.parseCards(player, ' 2 1'),
    [Deck.getCard('neck-punch')]
  )
})
