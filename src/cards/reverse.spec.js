const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should reverse order of play', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.addPlayer('player4', 'Dark')
  game.start()

  const [player1, player2, player3, player4] = game.players
  const reverse = Deck.getCard('reverse')
  player2.hand.push(reverse)
  game.play(player2, reverse)

  t.true(announceCallback.calledWith('card:reverse:disaster'))
  t.deepEqual(game.players, [player4, player3, player2, player1])
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, reverse))
})
