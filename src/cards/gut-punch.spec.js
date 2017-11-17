const Ava = require('ava')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player, target] = game.players
  player.hand.push(Deck.getCard('gut-punch'))

  game.play(player.id, [Deck.getCard('gut-punch')])
  game.pass(target.id)
  t.is(target.hp, 8)
  t.truthy(find(game.discardPile, { id: 'gut-punch' }))
  t.is(game.discardPile.length, 1)
})
