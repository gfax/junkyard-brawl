const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should give a player an extra turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const spareBolts = Deck.getCard('spare-bolts')
  player.hand.push(spareBolts)

  game.play(player.id, spareBolts)
  game.incrementTurn()

  t.true(announceCallback.calledWith('card:spare-bolts:disaster'))
  t.is(game.players[0], player)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, spareBolts))
})

Ava.test('should discard if the play is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [, player] = game.players
  const spareBolts = Deck.getCard('spare-bolts')
  player.hand.push(spareBolts)
  game.play(player.id, spareBolts)
  game.removePlayer(player.id)

  t.is(game.discardPile.length, player.maxHand + 1)
  t.truthy(find(game.discardPile, spareBolts))
})
