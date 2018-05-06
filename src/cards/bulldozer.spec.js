const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should leave a target with no cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, , player3] = game.players
  const bulldozer = getCard('bulldozer')
  player1.hand = [bulldozer]
  game.play(player1.id, player1.hand, player3.id)

  t.true(announceCallback.calledWith('card:bulldozer:contact'))
  t.is(player3.hand.length, 0)
  t.is(game.turns, 1)
  t.is(player1.hand.length, 0)
  t.is(game.discardPile.length, player3.maxHand + 1)
})

Ava.test('should have a weight proportional to the opponent\'s hand', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const bulldozer = getCard('bulldozer')
  player1.hand = [bulldozer]
  player2.hand = [getCard('gut-punch'), getCard('neck-punch')]
  const plays = bulldozer.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 0.5)
  })
})

Ava.test('should avoid infinite recursion when assessing weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const bulldozer = getCard('bulldozer')
  player1.hand = [bulldozer]
  player2.hand = [
    bulldozer,
    getCard('gut-punch'),
    getCard('magnet'),
    getCard('neck-punch')
  ]
  const plays = bulldozer.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 0.5)
  })
})
