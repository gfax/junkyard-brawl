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
  const validUuid = /([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)/i
  Deck.generate()
    .forEach((card) => {
      t.is(typeof card, 'object', 'card should be an object')
      t.is(typeof card.id, 'string', 'card.id should be a string')
      t.truthy(card.uid.match(validUuid), 'card.uid should be a uuid')
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

Ava.test('generate() should not contain any duplicate cards in the deck', (t) => {
  const deck = Deck.generate()
  const uniq = (el, idx, arr) => {
    return arr.findIndex(el2 => el2.uid === el.uid) === idx
  }
  t.is(deck.length, deck.filter(uniq).length)
})

Ava.test('getCard() should return a card object', (t) => {
  const card = Deck.getCard('gut-punch')
  t.is(card.id, 'gut-punch')
  t.is(card.type, 'attack')
  t.true(typeof card.uid === 'string')
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
  const player = new Player('user1', 'Jay', 10)
  player.hand.push(Deck.getCard('gut-punch'))
  t.throws(() => Deck.parseCards(player))
})

Ava.test('parseCards() should throw an error when passed invalid cards', (t) => {
  const player = new Player('user1', 'Jay', 10)
  player.hand.push(Deck.getCard('gut-punch'))
  t.throws(() => Deck.parseCards(player, ''))
})

Ava.test('parseCards() should return an empty array when a player has no cards', (t) => {
  const player = new Player('user1', 'Jay', 10)
  t.deepEqual(Deck.parseCards(player, ''), [])
})

Ava.test('parseCards() should return an empty array when passed an empty array', (t) => {
  const player = new Player('user1', 'Jay', 10)
  t.deepEqual(Deck.parseCards(player, []), [])
})

Ava.test('parseCards() should parse card objects', (t) => {
  const player = new Player('user1', 'Jay', 10)
  const gutPunch = Deck.getCard('gut-punch')
  const neckPunch = Deck.getCard('neck-punch')
  player.hand = [gutPunch, neckPunch]
  t.deepEqual(Deck.parseCards(player, gutPunch), [gutPunch])
  t.deepEqual(Deck.parseCards(player, [gutPunch]), [gutPunch])
  t.deepEqual(
    Deck.parseCards(player, player.hand, true),
    [gutPunch, neckPunch]
  )
})

Ava.test('parseCards() should parse cards by uid', (t) => {
  const player = new Player('user1', 'Jay', 10)
  const gutPunch = Deck.getCard('gut-punch')
  const neckPunch = Deck.getCard('neck-punch')
  player.hand = [gutPunch, neckPunch]
  t.deepEqual(Deck.parseCards(player, gutPunch.uid), [gutPunch])
  t.deepEqual(Deck.parseCards(player, [gutPunch.uid]), [gutPunch])
  t.deepEqual(
    Deck.parseCards(player, [gutPunch.uid, neckPunch.uid], true),
    [gutPunch, neckPunch]
  )
})

Ava.test('parseCards() should parse cards by id', (t) => {
  const player = new Player('user1', 'Jay', 10)
  const gutPunch = Deck.getCard('gut-punch')
  const neckPunch = Deck.getCard('neck-punch')
  player.hand = [gutPunch, neckPunch]
  t.deepEqual(Deck.parseCards(player, gutPunch.id), [gutPunch])
  t.deepEqual(Deck.parseCards(player, [gutPunch.id]), [gutPunch])
  t.deepEqual(
    Deck.parseCards(player, [gutPunch.id, neckPunch.id], true),
    [gutPunch, neckPunch]
  )
})

Ava.test('parseCards() should filter card objects by default', (t) => {
  const player = new Player('user1', 'Jay', 10)
  const gutPunch = Deck.getCard('gut-punch')
  const neckPunch = Deck.getCard('neck-punch')
  player.hand = [gutPunch, neckPunch]
  t.deepEqual(
    Deck.parseCards(player, player.hand),
    [gutPunch]
  )
})
