const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should do some random damage between 1 and 6', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const gamblinMan = getCard('gamblin-man')
  player1.hand = [gamblinMan]
  game.play(player1.id, player1.hand)
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:gamblin-man:contact'))
  t.true(player2.hp <= player2.maxHp - 1)
  t.true(player2.hp >= player2.maxHp - 6)
  t.is(game.turns, 1)
  t.is(player1.hand.length, 0)
  t.is(game.discardPile.length, 1)
})

Ava.test('should return a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gamblinMan = getCard('gamblin-man')
  player1.hand = [gamblinMan]
  let plays = gamblinMan.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 4)
  })
  player2.conditionCards = [getCard('deflector')]
  plays = gamblinMan.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -4)
  })
})
