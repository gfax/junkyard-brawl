const Ava = require('ava')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const neckPunch1 = getCard('neck-punch')
  const neckPunch2 = getCard('neck-punch')
  player1.hand.push(neckPunch1)
  player2.hand.push(neckPunch2)

  game.play(player1.id, [neckPunch1])
  game.pass(player2.id)
  t.is(player2.hp, 7)
  game.play(player2.id, [neckPunch2])
  game.pass(player1.id)
  t.is(player1.hp, 7)
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const neckPunch = getCard('neck-punch')
  player1.hand = [neckPunch]
  let plays = neckPunch.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 3)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = neckPunch.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -3)
  })
})
