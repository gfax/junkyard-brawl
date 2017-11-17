const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should steal multiple cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  const soup = Deck.getCard('soup')
  const sub = Deck.getCard('sub')
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
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  const soup = Deck.getCard('soup')
  const sub = Deck.getCard('sub')
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
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  const sub = Deck.getCard('sub')
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
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
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
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hp = 1
  player1.hand.push(mealSteal)
  player2.hand = [gutPunch]

  game.play(player1, mealSteal)

  t.is(player1.hp, 1)
})
