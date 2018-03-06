const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should reverse order of play', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.addPlayer('player4', 'Dark')
  game.start()

  const [player1, player2, player3, player4] = game.players
  const reverse = getCard('reverse')
  player2.hand.push(reverse)
  game.play(player2, reverse)

  t.true(announceCallback.calledWith('card:reverse:disaster'))
  t.deepEqual(game.players, [player4, player3, player2, player1])
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, reverse))
})

Ava.test('should have no weight during the player\'s turn', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const reverse = getCard('reverse')
  player1.hand = [reverse]
  const plays = reverse.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 0)
  })
})

Ava.test('should have a conditional weight during other players\' turns', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [, player2] = game.players
  const reverse = getCard('reverse')
  player2.hand = [reverse]
  let plays = reverse.validDisasters(player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 4)
  })
  game.addPlayer('player3', 'Jimbo')
  plays = reverse.validDisasters(player2, game)
  plays.forEach((play) => {
    t.is(play.weight, 3)
  })
})
