const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should heal a player over the course of 3 turns', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  const energyDrink = Deck.getCard('energy-drink')
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
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, energyDrink))
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('should have no effect on a player at or above their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  const energyDrink = Deck.getCard('energy-drink')
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
  t.truthy(find(game.discardPile, energyDrink))
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.true(announceCallback.calledWith('player:discard'))
})
