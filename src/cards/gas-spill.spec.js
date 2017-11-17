const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should cause a player to miss 2 turns.', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gas-spill'))

  game.play(player1.id, [Deck.getCard('gas-spill')])
  t.true(announceCallback.calledWith('card:gas-spill:contact'))
  t.is(player1.beforeTurn.length + player2.beforeTurn.length, 1)
  t.is(player1.missTurns + player2.missTurns, 2)
})

Ava.test('should delay discarding', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gasSpill = Deck.getCard('gas-spill')
  player1.hand.push(gasSpill)
  game.play(player1.id, [gasSpill])
  t.is(player1.hand.length, player1.maxHand)

  t.is(game.discardPile.length, 0)
  if (player1.beforeTurn.length) {
    t.is(player1.missTurns, 2)
    game.incrementTurn()
    game.incrementTurn()
    t.is(player1.missTurns, 1)
    t.is(game.discardPile.length, 0)
    game.incrementTurn()
  } else if (player2.beforeTurn.length) {
    game.incrementTurn()
    t.is(game.discardPile.length, 0)
    game.incrementTurn()
  } else {
    t.fail()
  }
  t.is(game.discardPile.length, 1)
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('should discard when the affected player is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const gasSpill = Deck.getCard('gas-spill')
  game.players[0].hand.push(gasSpill)
  game.play(game.players[0].id, [gasSpill])

  t.is(game.discardPile.length, 0)
  const player = find(game.players, plyr => plyr.beforeTurn.length === 1)
  game.removePlayer(player.id)
  t.is(game.discardPile.length, player.maxHand + 1)
  t.truthy(find(game.discardPile, gasSpill))
})
