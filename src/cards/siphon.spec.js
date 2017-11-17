const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should steal health from a player and give to another', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const siphon = Deck.getCard('siphon')
  player1.hp = 5
  player1.hand.push(siphon)
  game.play(player1, siphon)
  game.pass(player2)

  t.is(player1.hp, 6)
  t.is(player2.hp, player2.maxHp - 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, siphon))
})

Ava.test('should not give a player more than their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const siphon = Deck.getCard('siphon')
  player1.hp = player1.maxHp + 5
  player1.hand.push(siphon)
  game.play(player1, siphon)
  game.pass(player2)

  t.is(player1.hp, player1.maxHp + 5)
  t.is(player2.hp, player2.maxHp - 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, siphon))
})
