const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should be playable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('the-bees'))

  game.play(player1.id, [Deck.getCard('the-bees')])

  t.true(announceCallback.calledWith('card:the-bees:play'))
  t.true(player1.beforeTurn.length + player2.beforeTurn.length === 1)
})

Ava.test('should sting a player each turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('the-bees'))

  game.play(player1.id, [Deck.getCard('the-bees')])
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
  player1.hp = 2
  player2.hp = 2

  game.start()
  game.players[0].hand.push(Deck.getCard('the-bees'))
  game.play(game.players[0].id, [Deck.getCard('the-bees')])
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()

  t.true(announceCallback.calledWith('player:died'))
  t.is(game.players.length, 1)
  t.truthy(game.stopped)
  t.truthy(
    find(game.discardPile, Deck.getCard('the-bees')),
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
  const gutPunch = Deck.getCard('gut-punch')
  const sub = Deck.getCard('sub')
  const theBees = Deck.getCard('the-bees')
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
