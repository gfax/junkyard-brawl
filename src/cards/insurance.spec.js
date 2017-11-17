const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should restore a player to half HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('insurance'))
  player2.hp = 2
  game.play(player1.id, Deck.getCard('gut-punch'))
  game.play(player2.id, Deck.getCard('insurance'))

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
  const grab = Deck.getCard('grab')
  const uppercut = Deck.getCard('uppercut')
  const insurance = Deck.getCard('insurance')
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
  player1.hand.push(Deck.getCard('grab'))
  player1.hand.push(Deck.getCard('a-gun'))
  player2.hand.push(Deck.getCard('insurance'))
  player2.hp = 1
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('a-gun')])
  game.play(player2.id, Deck.getCard('insurance'))

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
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('insurance'))
  game.play(player1.id, Deck.getCard('gut-punch'))
  game.play(player2.id, Deck.getCard('insurance'))

  t.is(player2.hp, player2.maxHp - 2)
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.false(announceCallback.calledWith('card:insurance:success'))
})
