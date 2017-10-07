const Ava = require('ava')
const Sinon = require('sinon')
const Deck = require('./deck')
const Junkyard = require('./junkyard')
const Player = require('./player')
const { times } = require('./util')

Ava.test('Should allow instantiation', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.is(typeof game.manager, 'object')
  t.is('player1', game.manager.id)
})

Ava.test('constructor() should throw an error if passed an invalid language', (t) => {
  t.throws(() => {
    const noop = () => {}
    new Junkyard('player1', 'Jay', noop, noop, 'xyz')
  })
})

Ava.test('constructor() should announce when a game is created', (t) => {
  const announceCallback = Sinon.spy()
  new Junkyard('player1', 'Jay', announceCallback)
  t.true(announceCallback.calledOnce)
  t.true(announceCallback.alwaysCalledWithExactly(
    'game:created',
    Sinon.match.string,
    Sinon.match.object
  ))
})

Ava.test('addPlayer() should add multiple players', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  times(3, num => game.addPlayer(`player${num + 2}`, 'Randy'))

  t.true(announceCallback.calledWith('player:joined'))
  t.is(game.players.length, 4)
})

Ava.test('addPlayer() should not allow duplicate players', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player1', 'Jay')

  t.true(whisperCallback.calledWith('player1', 'player:already-joined'))
})

Ava.test('addPlayer() should not let a dropped player rejoin', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.removePlayer('player2')
  game.addPlayer('player2', 'Kevin')

  t.true(whisperCallback.calledWith('player2', 'player:cannot-rejoin'))
})

Ava.test('addPlayer() should allow players to join mid-game', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  game.addPlayer('player3', 'Jimbo')

  t.true(announceCallback.calledWith('player:joined'))
  t.is(game.players.length, 3)
})

Ava.test('addPlayer() should trigger deck replenishing', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  times(100, num => game.addPlayer(`player${num + 2}`, 'Randy'))
  game.start()

  t.true(announceCallback.calledWith('deck:increased'))
})

Ava.test('addPlayer() should trigger discard shuffling', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.deck = []
  game.discard.push(Deck.getCard('gut-punch'))
  game.start()

  t.is(game.discard.length, 0)
  t.true(announceCallback.calledWith('deck:shuffled'))
})

Ava.test('start() should start a game', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  t.false(game.started)
  game.start()
  t.true(game.started instanceof Date)
  t.true(game.players[0] instanceof Player)
  t.true(game.players[1] instanceof Player)
  t.true(announceCallback.calledWith('game:turn'))
})

Ava.test('start() should not start a with less than two players', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.start()
  t.true(announceCallback.calledWith(
    'game:invalid-number-of-players'
  ))
  t.false(game.started)
})

Ava.test('start() should show a player his cards on his turn', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  t.true(whisperCallback.calledWith(player.id, 'player:stats'))
})

Ava.test('stop() should stop', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.stop()
  t.true(game.stopped instanceof Date)
  t.true(announceCallback.calledWith('game:stopped'))
  // You shouldn't be able to do anything else after a game has stopped
  const { callCount } = announceCallback
  game.addPlayer('player2', 'Kevin')
  game.start()
  game.transferManagement('player2')
  game.play('player1', [Deck.getCard('gut-punch')])
  game.removePlayer('player2')
  t.false(game.started)
  t.is(announceCallback.callCount, callCount)
})

Ava.test('stop() should ignore a request to stop an already-stopped game', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  announceCallback.reset()
  game.stop()
  game.stop()
  game.stop()
  t.truthy(game.stopped)
  t.is(announceCallback.callCount, 1)
})

Ava.test('removePlayer() should remove a player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.removePlayer('player2')
  t.true(announceCallback.calledWith('player:dropped'))
  t.is(game.dropouts[0], player)
})

Ava.test('removePlayer() should discard player cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [, player] = game.players
  game.removePlayer(player.id)
  t.true(announceCallback.calledWith('player:dropped'))
  t.is(game.discard.length, player.maxHand)
  t.is(player.hand.length, 0)
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('removePlayer() should throw an error when removing an invalid player', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.throws(() => {
    game.removePlayer('Jim-bob Jones')
  })
})

Ava.test('removePlayer() should stop when removing all opponents', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  game.removePlayer('player2')
  t.true(announceCallback.calledWith('player:dropped'))
  t.true(announceCallback.calledWith('game:stopped'))
  t.truthy(game.stopped)
})

Ava.test('removePlayer() should stop when there are no players to start a game', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.removePlayer('player2')
  t.true(announceCallback.calledWith('player:dropped'))
  t.false(announceCallback.calledWith('game:stopped'))
  game.removePlayer('player1')
  t.true(announceCallback.calledWith('game:stopped'))
  t.truthy(game.stopped)
})

Ava.test('transferManagement() should transfer game management', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.transferManagement(player.id)
  t.true(announceCallback.calledWith('game:transferred'))
  t.is(game.manager, player)
})

Ava.test('transferManagement() should transfer game management when removing the manager', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.removePlayer('player1')
  t.true(announceCallback.calledWith('game:transferred'))
  t.is(game.manager, player)
})

Ava.test('play() should not accept moves before starting', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.play('player2')
  t.true(whisperCallback.calledWith('player2', 'player:not-started'))
})

Ava.test('play() should not accept cards out of turn', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  const [, player2] = game.players
  const card = Deck.getCard('gut-punch')
  player2.hand.push(card)
  game.play(player2.id, [card])
  t.true(whisperCallback.calledWith('player2', 'player:not-started'))
})

Ava.test('play() should ignore non-player moves', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  announceCallback.reset()
  game.play('foo', [Deck.getCard('gut-punch')])
  t.false(announceCallback.called)
})

Ava.test('counter() should throw an error when not passed cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.start()
  t.throws(() => game.counter(player))
})

Ava.test('pass() should throw an error when not passed a player id', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.throws(() => game.pass())
})

Ava.test('pass() should ignore requests when the game has not started', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  announceCallback.reset()
  game.pass(game.manager.id)
  t.true(announceCallback.notCalled)
})

Ava.test('whisperStats() should whisper stats to a player upon request', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [, player2] = game.players
  whisperCallback.reset()
  game.whisperStats(player2.id)
  t.true(whisperCallback.calledWith(player2.id, 'player:stats'))
  t.true(whisperCallback.calledOnce)
})

Ava.test('whisperStats() should let a player know they have no cards', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.whisperStats('player1')
  t.true(whisperCallback.calledWith(
    'player1',
    'player:stats',
    Sinon.match(/you have no cards/i)
  ))
})

Ava.test('whisperStats() should ignore whispering stats to non-players', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  game.whisperStats('foo')
  game.whisperStats('bar')
  t.true(whisperCallback.calledTwice)
})

Ava.test('whisperStats() should throw an error when passed a non-string value', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.throws(() => {
    game.whisperStats(null)
  })
})

Ava.test('contact() should announce if a played died', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hp = 2

  game.play(player1.id, [Deck.getCard('gut-punch')])
  t.false(announceCallback.calledWith('player:died'))
  game.pass(player2.id)
  t.true(announceCallback.calledWith('player:died'))
})

Ava.test('incrementTurn() should remove dead players', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hp = 2

  game.play(player1.id, [Deck.getCard('gut-punch')])
  game.pass(player2.id)
  t.is(game.players.length, 1)
  t.truthy(game.stopped)
})

Ava.test('incrementTurn() should deal players back up to a full hand', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.players.forEach(player => player.hand.push(Deck.getCard('gut-punch')))
  game.start()

  const [player1, player2] = game.players
  t.is(player1.hand.length, player1.maxHand)

  game.play(player1.id, Deck.getCard('gut-punch'))
  game.pass(player2.id)
  game.play(player2.id, Deck.getCard('gut-punch'))
  game.pass(player1.id)

  t.is(player1.hand.length, player1.maxHand)
})
