const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should deal a player up to 8 cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const toolbox = Deck.getCard('toolbox')
  player.hand.push(toolbox)

  game.play(player, toolbox)
  t.true(announceCallback.calledWith('card:toolbox:disaster'))
  t.is(player.hand.length, 8)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, toolbox))
})
