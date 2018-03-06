const Ava = require('ava')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player, target] = game.players
  player.hand.push(getCard('gut-punch'))

  game.play(player.id, [getCard('gut-punch')])
  game.pass(target.id)
  t.is(target.hp, 8)
  t.truthy(find(game.discardPile, { id: 'gut-punch' }))
  t.is(game.discardPile.length, 1)
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gutPunch = getCard('gut-punch')
  player1.hand = [gutPunch]
  let plays = gutPunch.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 2)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = gutPunch.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -2)
  })
})
