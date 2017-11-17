const Ava = require('ava')

const Deck = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = player1.hand.concat([Deck.getCard('guard-dog')])
  player2.hand = player2.hand.concat([Deck.getCard('guard-dog')])

  game.play(player1.id, [Deck.getCard('guard-dog')])
  game.pass(player2.id)
  t.is(player2.hp, 6)
  game.play(player2.id, [Deck.getCard('guard-dog')])
  game.pass(player1.id)
  t.is(player1.hp, 6)
})
