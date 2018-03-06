const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(getCard('a-gun'))

  game.play(player1, getCard('a-gun'))
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, { id: 'a-gun' }))
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('should be able to kill a player', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(getCard('a-gun'))
  player2.hp = 2

  game.play(player1, getCard('a-gun'))
  t.is(game.players.length, 1)
})

Ava.test('should be unblockable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = player1.hand.concat([
    getCard('grab'),
    getCard('a-gun')
  ])
  player2.hand = player2.hand.concat([
    getCard('block')
  ])

  game.play(player1.id, [getCard('grab'), getCard('a-gun')])
  game.play(player2.id, [getCard('block')])
  t.true(announceCallback.calledWith('player:counter-failed'))
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 1)
  t.is(game.players[0], player2)
  t.is(game.discardPile.length, 3)
  t.is(player1.hand.length, player1.maxHand)
  t.is(player2.hand.length, player2.maxHand)
  t.truthy(find(game.discardPile, { id: 'grab' }))
  t.truthy(find(game.discardPile, { id: 'a-gun' }))
  t.truthy(find(game.discardPile, { id: 'block' }))
})

Ava.test('should returns valid plays', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const aGun = getCard('a-gun')
  player1.hand = [aGun]
  const plays = aGun.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    t.true(play.weight > 1)
  })
})
