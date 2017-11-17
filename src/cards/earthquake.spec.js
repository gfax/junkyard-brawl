const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should hurt everybody', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('earthquake'))
  game.play(player1.id, Deck.getCard('earthquake'))

  t.true(announceCallback.calledWith('card:earthquake:disaster'))
  t.is(player1.hp, player1.maxHp - 1)
  t.is(player2.hp, player2.maxHp - 1)
})

Ava.test('should immediately discard', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hand.push(Deck.getCard('earthquake'))
  game.play(player.id, Deck.getCard('earthquake'))

  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, Deck.getCard('earthquake')))
})

Ava.test('should kill people', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hp = 1
  player.hand.push(Deck.getCard('earthquake'))
  game.play(player.id, Deck.getCard('earthquake'))

  t.truthy(game.stopped)
  t.is(game.discardPile.length, player.maxHand + 1)
})

Ava.test('should trigger a no-winner situation', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  player1.hp = 1
  player2.hp = 1
  player3.hp = 1
  player1.hand.push(Deck.getCard('earthquake'))
  game.play(player1, Deck.getCard('earthquake'))

  t.true(announceCallback.calledWith('game:no-survivors'))
  t.truthy(game.stopped)
})
