const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should attack a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [, player] = game.players
  const avalanche = Deck.getCard('avalanche')
  player.hand.push(avalanche)
  game.play(player.id, [avalanche])

  t.is(
    game.players.reduce((acc, plyr) => acc + plyr.hp, 0),
    game.players.reduce((acc, plyr) => acc + plyr.maxHp, 0) - 6
  )
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, avalanche))
  t.is(player.hand.length, player.maxHand)
})

Ava.test('should be able to kill a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  player1.hp = 6
  player2.hp = 6
  player3.hp = 6
  player2.hand.push(Deck.getCard('avalanche'))
  game.play(player2.id, Deck.getCard('avalanche'))

  t.true(announceCallback.calledWith('player:died'))
  t.is(game.players.length, 2)
  t.is(game.dropouts.length, 1)
})
