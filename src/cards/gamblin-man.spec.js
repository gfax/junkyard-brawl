const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should do some random damage between 1 and 6', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gamblin-man'))
  game.play(player1.id, Deck.getCard('gamblin-man'))
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:gamblin-man:contact'))
  t.true(player2.hp <= player2.maxHp - 1)
  t.true(player2.hp >= player2.maxHp - 6)
  t.is(game.turns, 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
})
