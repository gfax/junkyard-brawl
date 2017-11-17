const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should restore a player to max health', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const surgery = Deck.getCard('surgery')
  player.hand.push(surgery)
  player.hp = 1
  game.play(player, surgery)

  t.is(player.hp, player.maxHp)
  t.true(announceCallback.calledWith('card:surgery:contact'))
  t.is(player.hand.length, player.maxHand)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
})

Ava.test('should still work when grabbing', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const surgery = Deck.getCard('surgery')
  player1.hand.push(grab)
  player1.hand.push(surgery)
  player1.hp = 1
  game.play(player1, [grab, surgery])
  game.pass(player2)

  t.is(player1.hp, player1.maxHp)
  t.true(announceCallback.calledWith('card:surgery:contact'))
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('should not be playable if the player has >1 hp', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const surgery = Deck.getCard('surgery')
  const grab = Deck.getCard('grab')
  player.hand.push(surgery)
  player.hand.push(grab)

  game.play(player, surgery)
  t.true(whisperCallback.calledWith(player.id, 'card:surgery:invalid-contact'))
  whisperCallback.reset()

  game.play(player, [grab, surgery])
  t.true(whisperCallback.calledWith(player.id, 'card:surgery:invalid-contact'))
  whisperCallback.reset()

  t.is(player.hand.length, player.maxHand + 2)
  t.is(game.discardPile.length, 0)
})
