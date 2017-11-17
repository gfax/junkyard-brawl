const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should swap everybody\'s hands', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2, player3] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  const neckPunch = Deck.getCard('neck-punch')
  const whirlwind = Deck.getCard('whirlwind')

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
  const grab = Deck.getCard('grab')
  const neckPunch = Deck.getCard('neck-punch')
  const whirlwind = Deck.getCard('whirlwind')

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
