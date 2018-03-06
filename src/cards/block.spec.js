const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should counter', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(getCard('gut-punch'))
  player2.hand.push(getCard('block'))

  game.play(player1.id, [getCard('gut-punch')])
  game.play(player2.id, [getCard('block')])
  t.is(player2.hp, player2.maxHp)
  t.true(announceCallback.calledWith('card:block:counter'))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('should be thwarted by unstoppable cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(getCard('grab'))
  player1.hand.push(getCard('a-gun'))
  player2.hand.push(getCard('block'))

  game.play(player1.id, [getCard('grab'), getCard('a-gun')])
  game.play(player2.id, [getCard('block')])
  t.is(player2.hp, player2.maxHp - 2)
  t.true(announceCallback.calledWith('player:counter-failed'))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 3)
})

Ava.test('should have the weight of the card it is blocking', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const block = getCard('block')
  player1.hand = [getCard('gut-punch')]
  player2.hand = [block]

  game.play(player1, player1.hand)
  const plays = block.validCounters(player2, player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 2)
  })
})

Ava.test('should have the weight against grabs', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const block = getCard('block')
  player1.hand = [getCard('grab'), getCard('gut-punch')]
  player2.hand = [block]

  game.play(player1, player1.hand)
  const plays = block.validCounters(player2, player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 2)
  })
})

Ava.test('should have additional weight if there is a threat of death', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const block = getCard('block')
  player1.hand = [getCard('gut-punch')]
  player2.hand = [block]
  player2.hp = 2

  game.play(player1, player1.hand)
  const plays = block.validCounters(player2, player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.true(play.weight >= player2.maxHp + 2)
  })
})
