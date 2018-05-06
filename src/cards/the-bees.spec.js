const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should be playable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const theBees = getCard('the-bees')
  player1.hand.push(theBees)

  game.play(player1.id, [theBees])

  t.true(announceCallback.calledWith('card:the-bees:play'))
  t.true(player1.beforeTurn.length + player2.beforeTurn.length === 1)
})

Ava.test('should sting a player each turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const theBees = getCard('the-bees')
  player1.hand.push(theBees)

  game.play(player1.id, theBees)
  game.incrementTurn()
  game.incrementTurn()

  t.true(announceCallback.calledWith('card:the-bees:before-turn'))
  t.true(player1.hp + player2.hp === player1.maxHp + player2.maxHp - 1)
})

Ava.test('should sting a player to death', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  const [player1, player2] = game.players
  const theBees = getCard('the-bees')
  player1.hp = 2
  player2.hp = 2

  game.start()
  game.players[0].hand.push(theBees)
  game.play(game.players[0].id, theBees)
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()

  t.true(announceCallback.calledWith('player:died'))
  t.is(game.players.length, 1)
  t.truthy(game.stopped)
  t.truthy(
    game.discardPile.find(el => el === theBees),
    'it should be cycled back into the game when the player dies'
  )
  t.is(game.discardPile.length, player2.maxHand + 1)
})

Ava.test('should go away when a player heals', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  let [player1, player2] = game.players
  const gutPunch = getCard('gut-punch')
  const sub = getCard('sub')
  const theBees = getCard('the-bees')
  player1.hand.push(theBees)
  game.play(player1, theBees)

  if (player1.conditionCards.length) {
    game.incrementTurn();
    [player1, player2] = game.players
  }

  player1.hand.push(gutPunch)
  game.play(player1, gutPunch)
  game.pass(player2)
  t.false(announceCallback.calledWith('card:the-bees:healed'))

  player2.hand.push(sub)
  game.play(player2, sub)
  t.true(announceCallback.calledWith('card:the-bees:healed'))
  t.is(player1.conditionCards.length, 0)
})

Ava.test('should have a weight proportional to the number of players', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const theBees = getCard('the-bees')
  player1.hand = [theBees]
  const plays = theBees.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, game.players.length * 0.75)
  })
})
