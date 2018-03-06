const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should cause a player to miss a turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tire = getCard('tire')

  game.play(player1.id, tire)
  t.is(game.turns, 2)
  t.is(game.discardPile.length, 1)
  t.is(player1.hand.length, player1.maxHand)
  t.true(announceCallback.calledWith('card:tire:contact'))
  t.is(player2.conditionCards.length, 0)
  t.truthy(find(game.discardPile, tire))
})

Ava.test('should discard if the affected player is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, , player3] = game.players
  const tire = getCard('tire')
  player1.hand.push(tire)

  game.play(player1.id, tire, player3.id)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 0)
  t.is(player1.hand.length, player1.maxHand)

  game.removePlayer(player3.id)
  t.is(game.discardPile.length, player3.maxHand + 1)
  t.truthy(find(game.discardPile, tire))
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tire = getCard('tire')
  player1.hand = [tire]
  let plays = tire.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 3.5)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = tire.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -3.5)
  })
})
