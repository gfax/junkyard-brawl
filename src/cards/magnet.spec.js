const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { clone } = require('../util')

Ava.test('should steal cards from another player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const aGun = Deck.getCard('a-gun')
  const crazyHand = [aGun, aGun, aGun, aGun, aGun]
  player1.hand.push(Deck.getCard('magnet'))
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
  const aGun = Deck.getCard('a-gun')
  const crazyHand = [aGun]
  player1.hand.push(Deck.getCard('magnet'))
  player2.hand = clone(crazyHand)
  game.play(player1.id, [...player1.hand.reverse()])

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:magnet:contact'))
  t.deepEqual(player1.hand, crazyHand)
})
