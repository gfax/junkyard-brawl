const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should make a player miss a turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const greaseBucket = getCard('grease-bucket')
  player1.hand.push(greaseBucket)

  game.play(player1.id, [greaseBucket])
  game.pass(player2.id)
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 2)
})

Ava.test('should delay discarding', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, , player3] = game.players
  const greaseBucket = getCard('grease-bucket')
  player1.hand.push(greaseBucket)

  game.play(player1.id, [greaseBucket], player3.id)
  t.is(player1.hand.length, player1.maxHand)

  game.pass(player3.id)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  t.is(game.discardPile.length, 1)
  t.truthy(game.discardPile.find(el => el === greaseBucket))
})

Ava.test('should discard when a player dies', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const greaseBucket = getCard('grease-bucket')
  player1.hand = [greaseBucket]
  player2.hp = 2

  game.play(player1.id, greaseBucket)
  game.pass(player2.id)

  t.truthy(game.discardPile.find(card => card === greaseBucket))
  t.is(game.discardPile.length, player2.maxHand + 1)
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const greaseBucket = getCard('grease-bucket')
  player1.hand = [greaseBucket]
  let plays = greaseBucket.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 2.5)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = greaseBucket.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -2.5)
  })
})
