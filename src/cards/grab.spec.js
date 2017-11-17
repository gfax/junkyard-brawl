const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should be playable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  const aGun = Deck.getCard('a-gun')
  player1.hand.push(grab)
  player1.hand.push(gutPunch)
  player2.hand.push(grab)
  player2.hand.push(aGun)

  game.play(player1.id, [grab, gutPunch])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:grab:play'))
  t.true(announceCallback.calledWith('card:gut-punch:contact'))

  game.play(player2.id, [grab, aGun])
  game.pass(player1.id)

  t.true(announceCallback.calledWith('card:grab:play'))
  t.true(announceCallback.calledWith('card:a-gun:contact'))

  t.truthy(find(game.discardPile, grab))
  t.is(game.discardPile.length, 4)
})

Ava.test('should only play with an attack', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy().withArgs(Sinon.match.any, 'card:grab:invalid-card')
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()
  whisperCallback.reset()

  const [player] = game.players
  player.hand = player.hand.concat([
    Deck.getCard('grab'),
    Deck.getCard('grab')
  ])

  game.play(player.id, [Deck.getCard('grab')])
  game.play(player.id, [Deck.getCard('grab'), Deck.getCard('grab')])

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.called)
})

Ava.test('should only counter with an attack', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
    .withArgs(Sinon.match.any, 'card:grab:invalid-card')
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  const grab = Deck.getCard('grab')
  player1.hand.push(gutPunch)
  player2.hand.push(grab)
  player2.hand.push(grab)

  game.play(player1.id, gutPunch)
  whisperCallback.reset()
  game.play(player2.id, grab)
  game.play(player2.id, grab, grab)

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.calledWith(player2.id, 'card:grab:invalid-card'))
  t.true(whisperCallback.calledTwice)
})

Ava.test('should counter', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hand = [grab, grab, gutPunch, gutPunch]
  player2.hand = [grab, gutPunch]

  game.play(player1.id, [grab, gutPunch])
  game.play(player2.id, [grab, gutPunch])
  game.play(player1.id, [grab, gutPunch])
  game.pass(player2.id)
  t.is(player1.hp, 8)
  t.is(player2.hp, 6)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 6)
})

Ava.test('counter should allow another counter', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  const block = Deck.getCard('block')
  player1.hand = [block, grab, gutPunch]
  player2.hand = [grab, gutPunch]
  game.play(player1, [grab, gutPunch])
  game.play(player2, [grab, gutPunch])
  game.play(player1, block)

  t.true(announceCallback.calledWith('card:block:counter'))
  t.is(game.turns, 1)
})

Ava.test('should whisper a target their status when playing and countering', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hand = [grab, gutPunch]
  player2.hand = [grab, gutPunch]

  whisperCallback.reset()
  game.play(player1, [grab, gutPunch])
  t.true(whisperCallback.calledWith(player2.id, 'player:status'))

  whisperCallback.reset()
  game.play(player2, [grab, gutPunch])
  t.true(whisperCallback.calledWith(player1.id, 'player:status'))
})
