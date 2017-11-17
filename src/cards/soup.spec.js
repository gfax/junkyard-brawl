const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should heal a player and discard', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const soup = Deck.getCard('soup')
  player1.hand.push(soup)
  player1.hp = 3
  player2.hand.push(soup)

  game.play(player1.id, [soup])
  game.play(player2.id, [soup])

  t.true(announceCallback.calledWith('card:soup:contact'))
  t.is(player1.hp, 4)
  t.is(player2.hp, player2.maxHp, 'They should still have their max HP.')
  t.is(player2.hand.length, player2.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, soup))
})

Ava.test('should not heal a player above their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const soup = Deck.getCard('soup')
  player1.hand.push(soup)
  player1.hp = player1.maxHp + 5

  game.play(player1.id, soup)
  t.true(announceCallback.calledWith('card:soup:contact'))
  t.is(player1.hp, player1.maxHp + 5, 'They should retain their surplus HP.')
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, soup))
})
