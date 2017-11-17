const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should work with attacks - Gut Punch', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(gutPunch)
  game.play(player1.id, [sleep, gutPunch])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(game.turns, 1)
  t.is(player1.hp, 4)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, gutPunch))
})

Ava.test('should work with unstoppable attacks - Cheap Shot', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const cheapShot = Deck.getCard('cheap-shot')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(cheapShot)
  game.play(player1.id, [sleep, cheapShot])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(player1.hp, 3)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, cheapShot))
})

Ava.test('should work during a grab', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const sleep = Deck.getCard('sleep')
  const tireIron = Deck.getCard('tire-iron')
  player1.hp = 2
  player1.hand.push(grab)
  player1.hand.push(sleep)
  player1.hand.push(tireIron)
  game.play(player1.id, [grab, sleep, tireIron])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(game.turns, 1)
  t.is(player1.hp, 5)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 3)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, grab))
  t.truthy(find(game.discardPile, tireIron))
})

Ava.test('should not heal a player past their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const aGun = Deck.getCard('a-gun')
  player1.hand.push(sleep)
  player1.hand.push(aGun)
  game.play(player1.id, [sleep, aGun])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(player1.hp, player1.maxHp)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, aGun))
})

Ava.test('should not heal a player if the attack does no damage', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const tire = Deck.getCard('tire')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(tire)
  game.play(player1.id, [sleep, tire])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(player1.hp, 2)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, tire))
})

Ava.test('should warn when a player plays it wrong', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1] = game.players
  const sleep = Deck.getCard('sleep')
  const avalanche = Deck.getCard('avalanche')
  const soup = Deck.getCard('soup')
  const grab = Deck.getCard('grab')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(avalanche)
  player1.hand.push(soup)
  player1.hand.push(grab)

  game.play(player1.id, [sleep])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  game.play(player1.id, [sleep, avalanche])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  game.play(player1.id, [sleep, soup])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  game.play(player1.id, [sleep, grab])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  t.is(player1.hp, 2)
  t.is(player1.hand.length, player1.maxHand + 4)
  t.is(game.discardPile.length, 0)
})

Ava.test('should warn when a player plays it wrong with Grab', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1] = game.players
  const grab = Deck.getCard('grab')
  const sleep = Deck.getCard('sleep')
  const avalanche = Deck.getCard('avalanche')
  player1.hp = 2
  player1.hand.push(grab)
  player1.hand.push(sleep)
  player1.hand.push(avalanche)
  game.play(player1.id, [grab, sleep, avalanche])

  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  t.is(game.turns, 0)
  t.is(player1.hp, 2)
  t.is(player1.hand.length, player1.maxHand + 3)
  t.is(game.discardPile.length, 0)
})

Ava.test('should not heal a player above their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hp = player1.maxHp + 5
  player1.hand.push(sleep)
  player1.hand.push(gutPunch)
  game.play(player1.id, [sleep, gutPunch])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(game.turns, 1)
  t.is(player1.hp, player1.maxHp + 5)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, gutPunch))
})
