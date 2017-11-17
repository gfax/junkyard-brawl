const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should leave a target with no cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, , player3] = game.players
  player1.hand.push(Deck.getCard('bulldozer'))
  game.play(player1.id, Deck.getCard('bulldozer'), player3.id)

  t.true(announceCallback.calledWith('card:bulldozer:contact'))
  t.is(player3.hand.length, 0)
  t.is(game.turns, 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, player3.maxHand + 1)
})
