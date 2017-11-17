const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should cause a player to miss a turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tire = Deck.getCard('tire')

  game.play(player1.id, tire)
  t.is(game.turns, 2)
  t.is(game.discardPile.length, 1)
  t.is(player1.hand.length, player1.maxHand)
  t.true(announceCallback.calledWith('card:tire:contact'))
  t.is(player2.conditionCards.length, 0)
  t.truthy(find(game.discardPile, tire))
})

Ava.test('should discard if the affected player is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, , player3] = game.players
  const tire = Deck.getCard('tire')
  player1.hand.push(tire)

  game.play(player1.id, tire, player3.id)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 0)
  t.is(player1.hand.length, player1.maxHand)

  game.removePlayer(player3.id)
  t.is(game.discardPile.length, player3.maxHand + 1)
  t.truthy(find(game.discardPile, tire))
})
