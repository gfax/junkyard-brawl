const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should heal a player and discard', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(getCard('neck-punch'))
  player2.hand.push(getCard('sub'))

  game.play(player1.id, [getCard('neck-punch')])
  game.pass(player2.id)
  game.play(player2.id, [getCard('sub')])

  t.true(announceCallback.calledWith('card:sub:contact'))
  t.is(player2.hp, player2.maxHp - 1)
  t.is(player2.hand.length, player2.maxHand)
  t.truthy(find(game.discardPile, getCard('sub')))
  t.is(game.discardPile.length, 2)
})

Ava.test('should not heal a player above max health', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const sub = getCard('sub')
  player1.hand.push(sub)
  player2.hand.push(sub)
  player2.hp = player2.maxHp + 5

  game.play(player1, sub)
  t.true(announceCallback.calledWith('card:sub:contact'))
  t.is(player1.hp, player1.maxHp, 'They should still have max health.')
  announceCallback.reset()

  game.play(player2, sub)
  t.true(announceCallback.calledWith('card:sub:contact'))
  t.is(player2.hp, player2.maxHp + 5, 'They should retain their surplus health.')
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const sub = getCard('sub')
  player1.hand = [sub]
  let plays = sub.validPlays(player1, player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, sub.hp)
  })
  player1.conditionCards = [getCard('deflector')]
  plays = sub.validPlays(player1, player1, game)
  plays.forEach((play) => {
    t.is(play.weight, -sub.hp)
  })
  player1.hp = player1.maxHp - 2
  player1.conditionCards = [getCard('the-bees')]
  plays = sub.validPlays(player1, player1, game)
  plays.forEach((play) => {
    t.is(play.weight, sub.hp + 2)
  })
})
