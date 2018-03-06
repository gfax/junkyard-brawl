const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should attach to a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(getCard('deflector'))

  announceCallback.reset()
  game.play(player1.id, [getCard('deflector')])

  t.true(announceCallback.calledWith('card:deflector:play'))
  t.true(announceCallback.calledOnce)
  t.is(game.discardPile.length, 0, 'card should be with the player, not discarded yet')
  t.is(player1.beforeContact.length + player2.beforeContact.length, 1)
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('should deflect an attack to another random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const deflector = getCard('deflector')
  player1.hand.push(deflector)
  game.play(player1.id, [deflector])
  const gutPunch = getCard('gut-punch')

  if (player1.beforeContact.length) {
    game.incrementTurn()
    player2.hand.push(gutPunch)
    game.play(player2.id, [gutPunch])
    game.pass(player1.id)
    t.is(player1.hp, player1.maxHp)
    t.is(player2.hp, player2.maxHp - 2)
    t.is(game.turns, 2)
  } else {
    player1.hand.push(gutPunch)
    game.play(player1.id, [gutPunch])
    game.pass(player2.id)
    t.is(player2.hp, player2.maxHp)
    t.is(player1.hp, player1.maxHp - 2)
    t.is(game.turns, 1)
  }

  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.is(player1.beforeContact.length + player2.beforeContact.length, 0)
  t.truthy(find(game.discardPile, deflector))
})

Ava.test('should also deflect Avalanches', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const avalanche = getCard('avalanche')
  const deflector = getCard('deflector')
  player1.hand.push(deflector)
  player2.hand.push(avalanche)
  game.play(player1.id, [deflector])
  game.contact(player2, player1, [avalanche])
  t.is(player2.hp, player2.maxHp - 6)
  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.true(announceCallback.calledWith('card:avalanche:contact'))
  t.is(game.discardPile.length, 2)
})

Ava.test('should halt resolving further before-contact conditions', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const deflector = getCard('deflector')
  const gutPunch = getCard('gut-punch')
  player2.beforeContact.push(deflector.beforeContact)
  player2.beforeContact.push(deflector.beforeContact)
  player1.hand.push(gutPunch)
  game.play(player1.id, [gutPunch])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.is(game.turns, 1)
  t.is(player2.beforeContact.length, 1, 'player should have 1 unresolved beforeContact')
})

Ava.test('should resolve before-contact conditions across player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const deflector = getCard('deflector')
  const gutPunch = getCard('gut-punch')
  player1.beforeContact.push(deflector.beforeContact)
  player2.beforeContact.push(deflector.beforeContact)
  player1.hand.push(gutPunch)
  game.play(player1.id, [gutPunch])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.is(game.turns, 1)
  t.is(player2.hp, player2.maxHp - 2)
})

Ava.test('should discard if the player holding it is removed', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1] = game.players
  const deflector = getCard('deflector')
  player1.hand.push(deflector)
  game.play(player1.id, [deflector])
  game.removePlayer(player1.id)
  t.is(game.discardPile.length, player1.maxHand + 1)
  t.truthy(find(game.discardPile, deflector))
  t.is(game.turns, 0)
})

Ava.test('should have a positive weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const deflector = getCard('deflector')
  player1.hand = [deflector]
  const plays = deflector.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, player1.maxHp * 0.9)
  })
})
