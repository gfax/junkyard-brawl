const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should attack a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [, player] = game.players
  const avalanche = getCard('avalanche')
  player.hand.push(avalanche)
  game.play(player, avalanche)

  t.is(
    game.players.reduce((acc, plyr) => acc + plyr.hp, 0),
    game.players.reduce((acc, plyr) => acc + plyr.maxHp, 0) - 6
  )
  t.is(game.discardPile.length, 1)
  t.truthy(game.discardPile.find(card => card === avalanche))
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
  const avalanche = getCard('avalanche')
  player2.hand = [avalanche]
  game.play(player2, avalanche)

  t.true(announceCallback.calledWith('player:died'))
  t.is(game.players.length, 2)
  t.is(game.dropouts.length, 1)
})

Ava.test('should have a weight proportional to the number of players', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'player')
  game.addPlayer('player3', 'player')
  game.addPlayer('player4', 'player')
  game.start()
  const [player1] = game.players
  const avalanche = getCard('avalanche')
  player1.hand = [avalanche]
  let plays = avalanche.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 4)
  })
  game.addPlayer('player5', 'player')
  game.addPlayer('player6', 'player')
  game.addPlayer('player7', 'player')
  game.addPlayer('player8', 'player')
  plays = avalanche.validDisasters(player1, game)
  plays.forEach((play) => {
    t.is(play.weight, 7)
  })
})

Ava.test('should have less weight if the player could die from this', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'player')
  game.addPlayer('player3', 'player')
  game.addPlayer('player4', 'player')
  game.start()
  const [player1] = game.players
  const avalanche = getCard('avalanche')
  player1.hand = [avalanche]
  player1.hp = avalanche.damage
  let plays = avalanche.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 3)
  })
  game.addPlayer('player5', 'player')
  game.addPlayer('player6', 'player')
  game.addPlayer('player7', 'player')
  game.addPlayer('player8', 'player')
  plays = avalanche.validDisasters(player1, game)
  plays.forEach((play) => {
    t.is(play.weight, 6)
  })
})
