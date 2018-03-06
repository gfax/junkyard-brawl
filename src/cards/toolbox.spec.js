const Ava = require('ava')
const Sinon = require('sinon')

const { getCard }= require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should deal a player up to 8 cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const toolbox = getCard('toolbox')
  player.hand.push(toolbox)

  game.play(player, toolbox)
  t.true(announceCallback.calledWith('card:toolbox:disaster'))
  t.is(player.hand.length, 8)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, toolbox))
})

Ava.test('should have a weight proportional to the player hand size', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const toolbox = getCard('toolbox')
  player1.hand = [toolbox]
  const plays = toolbox.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, player1.maxHand + 1)
  })
})
