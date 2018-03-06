const Ava = require('ava')
const Sinon = require('sinon')

const { getCard }= require('../deck')
const Junkyard = require('../junkyard')
const { clone } = require('../util')

Ava.test('should steal cards from another player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const aGun = getCard('a-gun')
  const crazyHand = [aGun, aGun, aGun, aGun, aGun]
  player1.hand.push(getCard('magnet'))
  player2.hand = clone(crazyHand)
  game.play(player1.id, [...player1.hand.reverse()])

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:magnet:contact'))
  t.deepEqual(player1.hand, crazyHand)
})

Ava.test('shouldn\'t try to steal more than the player has', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const aGun = getCard('a-gun')
  const crazyHand = [aGun]
  player1.hand.push(getCard('magnet'))
  player2.hand = clone(crazyHand)
  game.play(player1.id, [...player1.hand.reverse()])

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:magnet:contact'))
  t.deepEqual(player1.hand, crazyHand)
})

Ava.test('should have a weight proportional to the opponent\'s hand', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const magnet = getCard('magnet')
  player1.hand = [magnet]
  player2.hand = [getCard('gut-punch'), getCard('neck-punch')]
  const plays = magnet.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 2.5)
  })
})

Ava.test('should avoid infinite recursion when accessing weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const magnet = getCard('magnet')
  player1.hand = [magnet]
  player2.hand = [
    magnet,
    getCard('bulldozer'),
    getCard('gut-punch'),
    getCard('neck-punch')
  ]
  const plays = magnet.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 2.5)
  })
})
