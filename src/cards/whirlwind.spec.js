const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should swap everybody\'s hands', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2, player3] = game.players
  const grab = getCard('grab')
  const gutPunch = getCard('gut-punch')
  const neckPunch = getCard('neck-punch')
  const whirlwind = getCard('whirlwind')

  player1.hand = [grab, grab]
  player2.hand = [gutPunch, gutPunch, whirlwind]
  player3.hand = [neckPunch, neckPunch]
  game.play(player2, whirlwind)

  t.true(announceCallback.calledWith('card:whirlwind:disaster'))
  t.deepEqual(player1.hand, [neckPunch, neckPunch])
  t.deepEqual(player2.hand, [grab, grab])
  t.deepEqual(player3.hand, [gutPunch, gutPunch])
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, whirlwind))
})

Ava.test('should consider empty hands', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2, player3] = game.players
  const grab = getCard('grab')
  const neckPunch = getCard('neck-punch')
  const whirlwind = getCard('whirlwind')

  player1.hand = [grab, grab]
  player2.hand = [whirlwind]
  player3.hand = [neckPunch, neckPunch]
  game.play(player2, whirlwind)

  t.true(announceCallback.calledWith('card:whirlwind:disaster'))
  t.deepEqual(player1.hand, [neckPunch, neckPunch])
  t.deepEqual(player2.hand, [grab, grab])
  t.deepEqual(player3.hand, [])
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, whirlwind))
})

Ava.test('should have a weight proportional to how nice the player hand is', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const whirlwind = getCard('whirlwind')
  player1.hand = [whirlwind, getCard('gut-punch')]
  let plays = whirlwind.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, player1.maxHp / 2)
  })
  player1.hand.push(getCard('deflector'))
  plays = whirlwind.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 0)
  })
})
