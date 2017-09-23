const Ava = require('ava')
const Sinon = require('sinon')
const Deck = require('./deck')
const Junkyard = require('./junkyard')
const Player = require('./player')

Ava.test('Should allow instantiation', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.is(typeof game.manager, 'object')
  t.is('player1', game.manager.id)
})

Ava.test('Should throw an error if passed an invalid language', (t) => {
  t.throws(() => {
    const noop = () => {}
    new Junkyard('player1', 'Jay', noop, noop, 'xyz')
  })
})

Ava.test('Should announce when a game is created', (t) => {
  const announceCallback = Sinon.spy()
  new Junkyard('player1', 'Jay', announceCallback)
  t.true(announceCallback.calledOnce)
  t.true(announceCallback.alwaysCalledWithExactly(
    'game:created',
    Sinon.match.string,
    Sinon.match.object
  ))
})

Ava.test('Should show a player his cards on his turn', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  t.true(whisperCallback.calledWith(player.id, 'player:stats'))
})

Ava.test('Should not start a with less than two players', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.start()
  t.true(announceCallback.calledWith(
    'game:invalid-number-of-players'
  ))
  t.false(game.started)
})

Ava.test('Should start a game', (t) => {
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

Ava.test('Should stop', (t) => {
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

Ava.test('Should ignore a request to stop an already-stopped game', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  announceCallback.reset()
  game.stop()
  game.stop()
  game.stop()
  t.truthy(game.stopped)
  t.is(announceCallback.callCount, 1)
})

Ava.test('Should remove a player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.removePlayer('player2')
  t.true(announceCallback.calledWith('player:dropped'))
  t.is(game.dropouts[0], player)
})

Ava.test('Should throw an error when removing an invalid player', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.throws(() => {
    game.removePlayer('Jim-bob Jones')
  })
})

Ava.test('Should stop when removing all opponents', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  game.removePlayer('player2')
  t.true(announceCallback.calledWith('player:dropped'))
  t.true(announceCallback.calledWith('game:stopped'))
  t.truthy(game.stopped)
})

Ava.test('Should stop when there are no players to start a game', (t) => {
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

Ava.test('Should transfer game management', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.transferManagement(player.id)
  t.true(announceCallback.calledWith('game:transferred'))
  t.is(game.manager, player)
})

Ava.test('Should transfer game management when removing the manager', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.removePlayer('player1')
  t.true(announceCallback.calledWith('game:transferred'))
  t.is(game.manager, player)
})

Ava.test('Should not accept moves before starting', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.play('player2')
  t.true(whisperCallback.calledWith('player2', 'player:not-started'))
})

Ava.test('Should not accept cards out of turn', (t) => {
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

Ava.test('Should ignore non-player moves', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  game.play('foo', [Deck.getCard('gut-punch')])
  t.pass()
})

Ava.test('whisperStats() should whisper stats to a player upon request', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [, player2] = game.players
  game.whisperStats(player2.id)
  t.true(whisperCallback.calledWith(player2.id, 'player:stats'))
  t.true(whisperCallback.calledTwice)
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
  t.true(whisperCallback.calledOnce)
})

Ava.test('whisperStats() should throw an error when passed a non-string value', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.throws(() => {
    game.whisperStats(null)
  })
})
