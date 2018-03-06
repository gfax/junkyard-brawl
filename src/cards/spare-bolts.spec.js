const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should give a player an extra turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const spareBolts = getCard('spare-bolts')
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
  const spareBolts = getCard('spare-bolts')
  player.hand.push(spareBolts)
  game.play(player.id, spareBolts)
  game.removePlayer(player.id)

  t.is(game.discardPile.length, player.maxHand + 1)
  t.truthy(find(game.discardPile, spareBolts))
})

Ava.test('should have a static weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const spareBolts = getCard('spare-bolts')
  player1.hand = [spareBolts]
  const plays = spareBolts.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, player1.maxHp - 1)
  })
})
