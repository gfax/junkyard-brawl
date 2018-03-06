const Ava = require('ava')
const Sinon = require('sinon')

const { getCard }= require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should absorb up to 2 hp of damage', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const neckPunch = getCard('neck-punch')
  const mattress = getCard('mattress')
  player1.hand.push(neckPunch)
  player2.hand.push(mattress)
  game.play(player1.id, neckPunch)
  game.play(player2.id, mattress)

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:mattress:counter'))
  t.is(player2.hp, player2.maxHp - 1)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, neckPunch))
  t.truthy(find(game.discardPile, mattress))
})

Ava.test('should not give a player more hp than they had', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = getCard('grab')
  const cheapShot = getCard('cheap-shot')
  const mattress = getCard('mattress')
  player1.hand.push(grab)
  player1.hand.push(cheapShot)
  player2.hand.push(mattress)
  player2.hp = 5
  game.play(player1.id, [grab, cheapShot])
  game.play(player2.id, mattress)

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:mattress:counter'))
  t.is(player2.hp, 5)
  t.is(game.discardPile.length, 3)
  t.truthy(find(game.discardPile, grab))
  t.truthy(find(game.discardPile, cheapShot))
  t.truthy(find(game.discardPile, mattress))
})

Ava.test('should work when a player has more than max hp', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const uppercut = getCard('uppercut')
  const mattress = getCard('mattress')
  player1.hand.push(uppercut)
  player2.hand.push(mattress)
  player2.hp = player2.maxHp + 6
  game.play(player1.id, uppercut)
  game.play(player2.id, mattress)

  t.is(player2.hp, player2.maxHp + 3)
  t.is(game.discardPile.length, 2)
})

Ava.test('should work against a grab', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = getCard('grab')
  const gutPunch = getCard('gut-punch')
  const mattress = getCard('mattress')

  player1.hand.push(grab)
  player1.hand.push(gutPunch)
  player2.hand.push(mattress)

  game.play(player1, [grab, gutPunch])
  game.play(player2, mattress)

  t.is(player2.hp, player2.maxHp)
  t.is(game.discardPile.length, 3)
  t.is(game.turns, 1)
})

Ava.test('shouldn\'t have an effect when there was no damage', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = getCard('grab')
  const sub = getCard('sub')
  const mattress = getCard('mattress')
  player1.hand.push(grab)
  player1.hand.push(sub)
  player2.hand.push(mattress)
  player2.hp = 5
  game.play(player1.id, [grab, sub])
  game.play(player2.id, mattress)

  t.is(player2.hp, 5)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 3)
})

Ava.test('should have the weight of the card it is countering', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const mattress = getCard('mattress')
  player1.hand = [getCard('gut-punch')]
  player2.hand = [mattress]

  game.play(player1, player1.hand)
  const plays = mattress.validCounters(player2, player1, game)
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
  const mattress = getCard('mattress')
  player1.hand = [getCard('grab'), getCard('gut-punch')]
  player2.hand = [mattress]

  game.play(player1, player1.hand)
  const plays = mattress.validCounters(player2, player1, game)
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
  const mattress = getCard('mattress')
  player1.hand = [getCard('gut-punch')]
  player2.hand = [mattress]
  player2.hp = 2

  game.play(player1, player1.hand)
  const plays = mattress.validCounters(player2, player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.true(play.weight >= 11)
  })
})
