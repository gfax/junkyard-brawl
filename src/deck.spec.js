const Ava = require('ava')
const Sinon = require('sinon')
const Deck = require('./deck')
const Junkyard = require('./junkyard')

Ava.test('Should return an object', (t) => {
  t.is(typeof Deck, 'object')
})

Ava.test('generate() should generate a deck', (t) => {
  t.true(Array.isArray(Deck.generate()))
})

Ava.test('generate() should not contain invalid cards in a deck', (t) => {
  Deck.generate()
    .forEach((card) => {
      t.is(typeof card, 'object')
      t.true(Array.isArray(card.type.match(/^(attack|counter|disaster|support|unstoppable)$/)))
      if (card.type === 'counter') {
        t.is(typeof card.counter, 'function')
      } else {
        t.is(typeof card.play, 'function')
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

Ava.test('Grab should be playable', (t) => {
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

Ava.test('Grab should only play with an attack', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy().withArgs(Sinon.match.any, 'card:grab:invalid-card')
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player] = game.players
  game.play(player.id, [Deck.getCard('grab')])
  game.play(player.id, [Deck.getCard('grab'), Deck.getCard('grab')])

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.calledTwice)
})

Ava.test('Grab should only counter with an attack', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy().withArgs(Sinon.match.any, 'card:grab:invalid-card')
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  game.play(player1.id, [Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('grab')])
  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('grab')])

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.called)
  t.true(whisperCallback.calledThrice)
})

Ava.test('Grab should counter', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('grab'))

  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.pass(player2.id)
  t.is(player1.hp, 8)
  t.is(player2.hp, 6)
  t.is(game.turns, 1)
})

Ava.test('Gut Punch should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player, target] = game.players
  game.play(player.id, [Deck.getCard('gut-punch')])
  game.pass(target.id)
  t.is(target.hp, 8)
})

Ava.test('A Gun should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  game.play(player1.id, [Deck.getCard('a-gun')])
  t.is(player2.hp, 8)
  t.is(game.turns, 1)
})

Ava.test('A hidden A Gun should thwart counters', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('a-gun')])
  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  t.true(announceCallback.calledWith('player:counter-failed'))
  t.is(player2.hp, 8)
  t.is(game.turns, 1)
  t.is(game.players[0], player2)
})

Ava.test('Block should counter', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  game.play(player1.id, [Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('block')])
  t.is(player2.hp, 10)
  t.true(announceCallback.calledWith('card:block:counter'))
  t.is(game.turns, 1)
  t.is(game.discard.length, 2)
})

Ava.test('Guard Dog should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  game.play(player1.id, [Deck.getCard('guard-dog')])
  game.pass(player2.id)
  t.is(player2.hp, 6)
  game.play(player2.id, [Deck.getCard('guard-dog')])
  game.pass(player1.id)
  t.is(player1.hp, 6)
})

Ava.test('Neck Punch should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  game.play(player1.id, [Deck.getCard('neck-punch')])
  game.pass(player2.id)
  t.is(player2.hp, 7)
  game.play(player2.id, [Deck.getCard('neck-punch')])
  game.pass(player1.id)
  t.is(player1.hp, 7)
})
