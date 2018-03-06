const Ava = require('ava')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tireIron = getCard('tire-iron')
  player1.hand.push(tireIron)

  game.play(player1.id, [tireIron])
  t.is(player2.hp, player2.maxHp - 3)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, tireIron))
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tireIron = getCard('tire-iron')
  player1.hand = [tireIron]
  let plays = tireIron.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, tireIron.damage + 3)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = tireIron.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -(tireIron.damage + 3))
  })
})
