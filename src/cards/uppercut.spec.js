const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should hurt a player pretty good', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const uppercut = Deck.getCard('uppercut')
  player1.hand.push(uppercut)

  game.play(player1.id, uppercut)
  t.true(announceCallback.calledWith('player:played'))
  t.is(game.turns, 0)
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:uppercut:contact'))
  t.is(player2.hp, player2.maxHp - 5)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, uppercut))
})
