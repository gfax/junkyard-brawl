const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should dump cards onto a target', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const crane = getCard('crane')
  player1.hand.push(crane)
  const [card1, card2, card3] = player1.hand
  game.play(player1.id, [crane, card1, card2, card3])

  t.is(player2.hand.length, player2.maxHand + 3)
  t.truthy(find(player2.hand, card1))
  t.truthy(find(player2.hand, card2))
  t.truthy(find(player2.hand, card3))
  t.true(announceCallback.calledWith('card:crane:contact'))
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('should be playable with no cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const crane = getCard('crane')
  player1.hand = [crane]
  game.play(player1.id, crane)

  t.is(player2.hand.length, player2.maxHand)
  t.true(announceCallback.calledWith('card:crane:no-cards'))
  t.is(player1.hand.length, 0)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, crane))
})

Ava.test('should be playable with a grab', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  const aGun = getCard('a-gun')
  const crane = getCard('crane')
  const grab = getCard('grab')
  player1.hand.push(grab)
  player1.hand.push(aGun)
  player3.hand.push(aGun)
  player3.hand.push(grab)
  player3.hand.push(crane)
  const [card1, card2, card3] = player3.hand
  game.play(player1.id, [grab, aGun], player3.id)
  game.play(player3.id, [grab, crane, card1, card2, card3])
  game.pass(player1.id)

  t.is(game.turns, 1)
  t.is(game.players[0], player2)
  t.is(game.discardPile.length, 4)
  t.is(player1.hand.length, player1.maxHand + 3)
  t.is(player3.hand.length, player3.maxHand + 1)
})

Ava.test('should returns valid plays', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const crane = getCard('crane')
  player1.hand = [crane]
  const plays = crane.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    t.true(play.weight >= 0)
  })
})

Ava.test('should have weight when a player has worthless cards', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const crane = getCard('crane')
  const soup = getCard('soup')
  player1.hand = [crane, soup]
  const plays = crane.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    t.true(play.weight >= 1)
  })
})

Ava.test('should have less weight when a player has nice cards', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const crane = getCard('crane')
  const armor = getCard('armor')
  player1.hand = [crane, armor]
  const plays = crane.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    t.true(play.weight < 2)
  })
})
