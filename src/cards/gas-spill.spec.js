const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should cause a player to miss 2 turns.', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gasSpill = getCard('gas-spill')
  player1.hand = [gasSpill]

  game.play(player1.id, player1.hand)
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
  const gasSpill = getCard('gas-spill')
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
  const [player1] = game.players
  const gasSpill = getCard('gas-spill')
  player1.hand.push(gasSpill)
  game.play(player1.id, [gasSpill])

  t.is(game.discardPile.length, 0)
  const player = game.players.find(plyr => plyr.beforeTurn.length === 1)
  game.removePlayer(player.id)
  t.is(game.discardPile.length, player.maxHand + 1)
  t.truthy(game.discardPile.find(card => card.uid === gasSpill.uid))
})

Ava.test('should have a weight proportional to the number of players', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const gasSpill = getCard('gas-spill')
  player1.hand = [gasSpill]
  const plays = gasSpill.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, game.players.length * 0.75)
  })
})
