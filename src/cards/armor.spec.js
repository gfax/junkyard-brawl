const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should add 5 HP, even past the player\'s max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hand.push(Deck.getCard('armor'))
  game.play(player.id, [Deck.getCard('armor')])

  t.true(announceCallback.calledWith('card:armor:contact'))
  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 1)
  t.is(player.hp, player.maxHp + 5)
})
