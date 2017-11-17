const Ava = require('ava')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tireIron = Deck.getCard('tire-iron')
  player1.hand.push(tireIron)

  game.play(player1.id, [tireIron])
  t.is(player2.hp, player2.maxHp - 3)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, tireIron))
  t.is(player1.hand.length, player1.maxHand)
})
