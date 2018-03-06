const Ava = require('ava')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = player1.hand.concat([getCard('guard-dog')])
  player2.hand = player2.hand.concat([getCard('guard-dog')])

  game.play(player1.id, [getCard('guard-dog')])
  game.pass(player2.id)
  t.is(player2.hp, 6)
  game.play(player2.id, [getCard('guard-dog')])
  game.pass(player1.id)
  t.is(player1.hp, 6)
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const guardDog = getCard('guard-dog')
  player1.hand = [guardDog]
  let plays = guardDog.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 4)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = guardDog.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -4)
  })
})
