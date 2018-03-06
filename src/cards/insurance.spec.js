const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should restore a player to half HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(getCard('gut-punch'))
  player2.hand.push(getCard('insurance'))
  player2.hp = 2
  game.play(player1.id, getCard('gut-punch'))
  game.play(player2.id, getCard('insurance'))

  t.is(player2.hp, Math.floor(player2.maxHp / 2))
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.true(announceCallback.calledWith('card:insurance:success'))
  t.truthy(find(game.discardPile, { id: 'insurance' }))
  t.true(!game.stopped)
  t.is(game.turns, 1)
})

Ava.test('should work with grabs', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = getCard('grab')
  const uppercut = getCard('uppercut')
  const insurance = getCard('insurance')
  player1.hand.push(uppercut)
  player1.hand.push(grab)
  player2.hand.push(insurance)
  player2.hp = 5
  game.play(player1.id, [grab, uppercut])
  game.play(player2.id, insurance)

  t.is(player2.hp, Math.floor(player2.maxHp / 2))
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.true(announceCallback.calledWith('card:insurance:success'))
  t.truthy(find(game.discardPile, { id: 'insurance' }))
  t.true(!game.stopped)
  t.is(game.turns, 1)
})

Ava.test('should work against unstoppable attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(getCard('grab'))
  player1.hand.push(getCard('a-gun'))
  player2.hand.push(getCard('insurance'))
  player2.hp = 1
  game.play(player1.id, [getCard('grab'), getCard('a-gun')])
  game.play(player2.id, getCard('insurance'))

  t.is(player2.hp, Math.floor(player2.maxHp / 2))
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.true(announceCallback.calledWith('card:insurance:success'))
  t.true(!game.stopped)
  t.is(game.turns, 1)
})

Ava.test('should do nothing when a player lives', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(getCard('gut-punch'))
  player2.hand.push(getCard('insurance'))
  game.play(player1.id, getCard('gut-punch'))
  game.play(player2.id, getCard('insurance'))

  t.is(player2.hp, player2.maxHp - 2)
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.false(announceCallback.calledWith('card:insurance:success'))
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const insurance = getCard('insurance')
  const gutPunch = getCard('gut-punch')

  let plays = insurance.validCounters(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 0)
  })

  player1.hand = [gutPunch]
  player2.hand = [insurance]
  player2.hp = 3
  game.play(player1, gutPunch)
  plays = insurance.validCounters(player2, player1, game)
  plays.forEach((play) => {
    t.is(play.weight, 0)
  })

  player2.hp = 2
  plays = insurance.validCounters(player2, player1, game)
  plays.forEach((play) => {
    t.is(play.weight, player2.maxHp)
  })
})
