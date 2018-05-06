const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should heal a player over the course of 3 turns', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  const energyDrink = getCard('energy-drink')
  player.hand.push(energyDrink)
  player.hp = 2
  game.play(player.id, [energyDrink])

  t.true(announceCallback.calledWith('card:energy-drink:contact'))
  t.false(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.is(player.hp, 3)
  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, 4)
  t.is(game.discardPile.length, 0)
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))

  announceCallback.reset()
  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, 5)
  t.is(player.beforeTurn.length, 0)
  t.is(game.discardPile.length, 1)
  t.truthy(game.discardPile.find(card => card === energyDrink))
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('should have no effect on a player at or above their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  const energyDrink = getCard('energy-drink')
  player.hand.push(energyDrink)
  player.hp = player.maxHp + 5
  game.play(player.id, [energyDrink])

  t.true(announceCallback.calledWith('card:energy-drink:contact'))
  t.false(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.is(player.hp, player.maxHp + 5)
  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, player.maxHp + 5)
  t.is(game.discardPile.length, 0)
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))

  announceCallback.reset()
  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, player.maxHp + 5)
  t.is(game.discardPile.length, 1)
  t.truthy(game.discardPile.find(card => card === energyDrink))
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('should return a weight proportional to the player health', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const energyDrink = getCard('energy-drink')
  player1.hand = [energyDrink]
  let plays = energyDrink.validPlays(player1, player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    // Only 1 when player has full health
    t.is(play.weight, 1)
  })

  player1.hp = player1.maxHp - 1
  plays = energyDrink.validPlays(player1, player1, game)
  plays.forEach((play) => {
    t.is(play.weight, 2)
  })

  player1.hp = player1.maxHp - 2
  plays = energyDrink.validPlays(player1, player1, game)
  plays.forEach((play) => {
    t.is(play.weight, 3)
  })
})

Ava.test('should return a weight affected by active conditions', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const energyDrink = getCard('energy-drink')
  const theBees = getCard('the-bees')
  const deflector = getCard('deflector')
  player1.conditionCards = [theBees, deflector]
  player1.hand = [energyDrink]
  let plays = energyDrink.validPlays(player1, player1, game)
  plays.forEach((play) => {
    t.true(play.weight < 0)
  })
  player1.conditionCards = [getCard('the-bees')]
  plays = energyDrink.validPlays(player1, player1, game)
  plays.forEach((play) => {
    t.is(play.weight, 1)
  })
})
