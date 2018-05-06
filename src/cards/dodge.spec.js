const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should counter and nullify attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, , player3] = game.players
  player1.hand = [getCard('gut-punch')]
  player3.hand = [getCard('dodge')]

  game.play(player1.id, player1.hand, player3)
  game.play(player3.id, player3.hand)

  t.true(announceCallback.calledWith('card:dodge:nullify'))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('should counter and redirect attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  const gutPunch = getCard('gut-punch')
  const dodge = getCard('dodge')
  player1.hand.push(gutPunch)
  player2.hand.push(dodge)

  game.play(player1.id, gutPunch, player2.id)
  game.play(player2.id, dodge)

  t.true(announceCallback.calledWith('card:dodge:new-target'))
  t.is(game.turns, 0)
  t.is(game.discardPile.length, 1)
  t.is(game.target, player3)
})

Ava.test('should not be playable when grabbed', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand = [getCard('grab'), getCard('gut-punch')]
  player2.hand = [getCard('dodge')]

  game.play(player1.id, player1.hand)
  game.play(player2.id, player2.hand)

  t.true(whisperCallback.calledWith(player2.id, 'card:dodge:invalid'))
  t.is(game.turns, 0)
  t.is(game.discardPile.length, 0)
})

Ava.test('should have a weight proportional to the player HP', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gutPunch = getCard('gut-punch')
  const dodge = getCard('dodge')
  player1.hand = [gutPunch]
  player2.hand = [dodge]
  game.play(player1, gutPunch)
  const moves = dodge.validCounters(player2, player1, game)
  t.true(Array.isArray(moves))
  t.true(moves.length > 0)
  const [move] = moves
  t.is(move.weight, player1.maxHp - player1.hp)
})

Ava.test('should not return any moves if the player is grabbed', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = [getCard('grab'), getCard('gut-punch')]
  const dodge = getCard('dodge')
  player2.hand = [dodge]
  game.play(player1, player1.hand)
  const moves = dodge.validCounters(player2, player1, game)
  t.true(Array.isArray(moves))
  t.is(moves.length, 0)
})
