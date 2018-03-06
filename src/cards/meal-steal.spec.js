const Ava = require('ava')
const Sinon = require('sinon')

const { getCard }= require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should steal multiple cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = getCard('meal-steal')
  const gutPunch = getCard('gut-punch')
  const soup = getCard('soup')
  const sub = getCard('sub')
  player1.hand.push(mealSteal)
  player2.hand = [soup, sub, gutPunch, sub]

  game.play(player1, mealSteal)

  t.true(announceCallback.calledWith('card:meal-steal:steal-multiple'))
  t.is(player1.hp, player1.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.truthy(find(player2.hand, gutPunch))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 4)
})

Ava.test('should heal with multiple stolen cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = getCard('meal-steal')
  const gutPunch = getCard('gut-punch')
  const soup = getCard('soup')
  const sub = getCard('sub')
  player1.hp = 1
  player1.hand.push(mealSteal)
  player2.hand = [soup, sub, gutPunch, sub]

  game.play(player1, mealSteal)

  t.is(player1.hp, 6)
})

Ava.test('should steal one card', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = getCard('meal-steal')
  const gutPunch = getCard('gut-punch')
  const sub = getCard('sub')
  player1.hand.push(mealSteal)
  player2.hand = [gutPunch, sub]

  game.play(player1, mealSteal)

  t.true(announceCallback.calledWith('card:meal-steal:steal-one'))
  t.is(player1.hp, player1.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.truthy(find(player2.hand, gutPunch))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('should steal zero cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = getCard('meal-steal')
  const gutPunch = getCard('gut-punch')
  player1.hand.push(mealSteal)
  player2.hand = [gutPunch]

  game.play(player1, mealSteal)

  t.true(announceCallback.calledWith('card:meal-steal:steal-zero'))
  t.is(player1.hp, player1.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.truthy(find(player2.hand, gutPunch))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
})

Ava.test('should have no effect with no stolen cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = getCard('meal-steal')
  const gutPunch = getCard('gut-punch')
  player1.hp = 1
  player1.hand.push(mealSteal)
  player2.hand = [gutPunch]

  game.play(player1, mealSteal)

  t.is(player1.hp, 1)
})

Ava.test('should have a weight proportional to the player\'s health', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const mealSteal = getCard('meal-steal')
  player1.hand = [mealSteal]
  player1.hp = 4

  const plays = mealSteal.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 6)
  })
})

Ava.test('should double weight if a player has THE BEES', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const mealSteal = getCard('meal-steal')
  player1.conditionCards.push(getCard('the-bees'))
  player1.hand = [mealSteal]
  player1.hp = 4

  const plays = mealSteal.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 12)
  })
})
