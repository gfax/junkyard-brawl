const Ava = require('ava')
const Sinon = require('sinon')
const Deck = require('./deck')
const Junkyard = require('./junkyard')

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
      t.true(Array.isArray(card.type.match(/^(attack|counter|disaster|support)$/)))
      t.is(typeof card.play, 'function')
    })
})

Ava.test('Grab should work as a move', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:grab:play'))
  t.true(announceCallback.calledWith('card:gut-punch:contact'))
})

Ava.test('Grab should only work with an attack', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy().withArgs(Sinon.match.any, 'card:grab:invalid-card')
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player] = game.players
  game.play(player.id, [Deck.getCard('grab')])
  game.play(player.id, [Deck.getCard('grab'), Deck.getCard('grab')])

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.called)
  t.true(whisperCallback.calledTwice)
})

Ava.test('Grab should work as a counter', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('grab'))

  // game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.pass(player2.id)
  t.is(player1.hp, 8)
  t.is(player2.hp, 6)
  t.is(game.turns, 2)
})

Ava.test('Gut Punch should work', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player, target] = game.players
  const card = Deck.getCard('gut-punch')
  player.hand.push(card)
  game.play(player.id, [card])
  game.pass(target.id)
  t.is(target.hp, 8)
})
