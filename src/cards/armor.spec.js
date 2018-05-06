const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should add 5 HP, even past the player\'s max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hand.push(getCard('armor'))
  game.play(player.id, 'armor')

  t.true(announceCallback.calledWith('card:armor:contact'))
  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 1)
  t.is(player.hp, player.maxHp + 5)
})

Ava.test('should have a weight proportional to its HP', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const armor = getCard('armor')
  player1.hand = [armor]
  const plays = armor.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, armor.hp)
  })
})

// If you have a deflector then any attempt at healing
// yourself will deflect to another player.
Ava.test('should have a weight negated by potential self-deflection', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const armor = getCard('armor')
  const deflector = getCard('deflector')
  player1.hand = [armor, deflector]
  game.play(player1, deflector)
  const plays = armor.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.truthy(play.target)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, -armor.hp)
  })
})
