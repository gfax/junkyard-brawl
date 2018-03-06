const Ava = require('ava')
const Sinon = require('sinon')
const Deck = require('./deck')
const Junkyard = require('./junkyard')
const Player = require('./player')
const { find, times } = require('./util')

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

Ava.test('addBot() should do nothing if the game is stopped', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.stop()
  announceCallback.reset()
  game.addBot()
  t.true(announceCallback.notCalled)
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
  game.discardPile.push(Deck.getCard('gut-punch'))
  game.start()

  t.is(game.discardPile.length, 0)
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

Ava.test('start() should announce if the game has already started', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  announceCallback.reset()
  game.start()
  t.true(announceCallback.calledWith('game:invalid-start'))
  t.true(announceCallback.calledOnce)
})

Ava.test('start() should show a player his cards on his turn', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  t.true(whisperCallback.calledWith(player.id, 'player:status'))
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
  t.is(game.discardPile.length, player.maxHand)
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

Ava.test('removePlayer() should announce winner if the last opponent dies', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  game.removePlayer('player2', true)
  t.true(announceCallback.calledWith('game:winner'))
  t.false(announceCallback.calledWith('game:stopped'))
})

Ava.test('cleanup() should remove dead players', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2, player3] = game.players
  player1.hp = 0
  player2.hp = 0
  player3.hp = 1

  game.cleanup()
  t.truthy(game.stopped)
})

Ava.test('getDropout() should return a player that was removed from the game', (t) => {
  const game = new Junkyard('player1', 'Jay')
  const player = game.addPlayer('player2', 'Kevin')
  game.removePlayer(player.id)
  t.deepEqual(game.getDropout(player), player, 'Should handle a player object.')
  t.deepEqual(game.getDropout(player.id), player, 'Should handle a string ID.')
  t.is(typeof game.getDropout('player1'), 'undefined', 'Should not return active players')
})

Ava.test('getPlayer() should return a player that is still in the game', (t) => {
  const game = new Junkyard('player1', 'Jay')
  const player = game.addPlayer('player2', 'Kevin')
  t.deepEqual(game.getPlayer(player), player, 'Should handle a player object.')
  t.deepEqual(game.getPlayer(player.id), player, 'Should handle a string ID.')
  game.removePlayer(player.id)
  t.is(typeof game.getPlayer(player), 'undefined', 'Should not return dropouts')
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

Ava.test('transferManagement() should transfer to the first non-robot player', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addBot('Dark')
  const player = game.addPlayer('player2', 'Kevin')
  game.removePlayer('player1')
  t.is(game.manager, player)
})

Ava.test('transferManagement() should still transfer if all remaining players are bots', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addBot('Dark')
  game.addBot('Dark2')
  game.removePlayer('player1')
  t.true(game.manager.robot)
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

Ava.test('play() should not accept attacks out of turn', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [, player2] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  player2.hand.push(gutPunch)
  game.play(player2.id, gutPunch)
  t.true(whisperCallback.calledWith(player2.id, 'player:not-turn'))
})

Ava.test('play() should ignore a player if they have already played', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [turnPlayer] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  const neckPunch = Deck.getCard('neck-punch')
  game.play(turnPlayer, gutPunch)
  announceCallback.reset()
  whisperCallback.reset()

  game.play(turnPlayer, neckPunch)
  t.true(announceCallback.notCalled)
  t.true(whisperCallback.notCalled)
  t.deepEqual(turnPlayer.discard, [gutPunch])
})

Ava.test('play() should expect a target when there are 3 or more players', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [turnPlayer] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  game.play(turnPlayer, gutPunch)
  t.true(whisperCallback.calledWith(turnPlayer.id, 'player:invalid-target'))
})

Ava.test('play() should not let a player attack themselves', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hand = [grab, gutPunch]
  game.play(player1, [grab, gutPunch], player1)

  t.true(whisperCallback.calledWith(player1.id, 'player:invalid-target'))
  t.true(!game.target)
  t.is(player1.hand.length, 2)
  t.is(game.discardPile.length, 0)
})

Ava.test('play() should notify a user when they play no cards', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [turnPlayer] = game.players

  game.play(turnPlayer)
  t.true(whisperCallback.calledWith(turnPlayer.id, 'player:invalid-play'))
  whisperCallback.reset()
  game.play(turnPlayer, null)
  t.true(whisperCallback.calledWith(turnPlayer.id, 'player:invalid-play'))
  whisperCallback.reset()
  game.play(turnPlayer, '')
  t.true(whisperCallback.calledWith(turnPlayer.id, 'player:invalid-play'))
  whisperCallback.reset()
  game.play(turnPlayer, [])
  t.true(whisperCallback.calledWith(turnPlayer.id, 'player:invalid-play'))
  whisperCallback.reset()
})

Ava.test('play() should notify a user when given an invalid card', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [turnPlayer] = game.players
  const block = Deck.getCard('block')
  turnPlayer.hand.push(block)

  whisperCallback.reset()
  game.play(turnPlayer, block)
  t.true(whisperCallback.calledWith(turnPlayer.id, 'player:invalid-play'))
})

Ava.test('play() should notify a player of an invalid counter', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  player1.hand.push(gutPunch)
  player2.hand.push(gutPunch)
  game.play(player1, gutPunch)
  game.play(player2, gutPunch)

  t.true(whisperCallback.calledWith(player2.id, 'player:invalid-counter'))
})

Ava.test('play() should announce when waiting for a player response', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  player1.hand.push(gutPunch)
  announceCallback.reset()
  whisperCallback.reset()

  game.play(player1, gutPunch)
  t.true(announceCallback.calledWith('player:played'))
  t.true(whisperCallback.calledWith(player2.id, 'player:status'))
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

Ava.test('pass() should ignore requests from non players', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  game.removePlayer('player2')
  const [turnPlayer] = game.players
  turnPlayer.hand.push(Deck.getCard('gut-punch'))
  game.play(turnPlayer, Deck.getCard('gut-punch'))
  announceCallback.reset()
  game.pass('player2')
  game.pass('foobaz')
  t.true(announceCallback.notCalled)
  t.is(game.turns, 0)
})

Ava.test('pass() should notify turn players they cannot pass', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [turnPlayer] = game.players
  game.pass(turnPlayer)
  t.true(whisperCallback.calledWith(turnPlayer.id, 'player:no-passing'))
  t.is(game.turns, 0)
})

Ava.test('pass() should notify a player it is not their turn to pass', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2, player3] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  game.play(player1, Deck.getCard('gut-punch'), player3)
  game.pass(player2)
  t.true(whisperCallback.calledWith(player2.id, 'player:not-turn'))
  t.is(game.turns, 0)
})

Ava.test('pass() should notify a player that is it too late to pass', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  game.play(player1, Deck.getCard('gut-punch'))
  game.pass(player1)
  t.true(whisperCallback.calledWith(player1.id, 'player:already-played'))
  t.is(game.turns, 0)
})

Ava.test('pass() should allow the turn player to pass when grabbed', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hand.push(gutPunch)
  player2.hand.push(grab)
  player2.hand.push(gutPunch)

  game.play(player1, gutPunch)
  game.play(player2, [grab, gutPunch])
  game.pass(player1)

  t.is(game.turns, 1)
})

Ava.test('discard() should ignore requests when the game has not started', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  announceCallback.reset()
  whisperCallback.reset()
  game.discard(game.manager.id)
  t.true(announceCallback.notCalled)
  t.true(whisperCallback.notCalled)
})

Ava.test('discard() should ignore requests from non players', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  game.removePlayer('player2')
  const gutPunch = Deck.getCard('gut-punch')
  announceCallback.reset()
  whisperCallback.reset()
  game.discard('player2', gutPunch)
  game.discard('foobaz', gutPunch)
  t.true(announceCallback.notCalled)
  t.true(whisperCallback.notCalled)
  t.is(game.turns, 0)
})

Ava.test('discard() should notify a player when it is not their turn', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [, player2] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  player2.hand.push(gutPunch)
  game.discard(player2, gutPunch)
  t.true(whisperCallback.calledWith(player2.id, 'player:not-turn'))
})

Ava.test('discard() should discard the given cards and deal the appropriate amount', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [turnPlayer] = game.players
  const block = Deck.getCard('block')
  const gutPunch = Deck.getCard('gut-punch')
  turnPlayer.hand.push(block)
  turnPlayer.hand.push(gutPunch)

  game.discard(turnPlayer, [block, gutPunch])
  t.is(turnPlayer.hand.length, turnPlayer.maxHand)
  t.is(game.discardPile.length, 2)
  t.is(game.turns, 1)
  t.truthy(find(game.discardPile, block))
  t.truthy(find(game.discardPile, gutPunch))
})

Ava.test('discard() should discard a player\'s entire hand if no cards were specified', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [turnPlayer] = game.players
  const block = Deck.getCard('block')
  const gutPunch = Deck.getCard('gut-punch')
  turnPlayer.hand = [block, gutPunch, gutPunch, block]

  game.discard(turnPlayer)
  t.is(turnPlayer.hand.length, turnPlayer.maxHand)
  t.is(game.discardPile.length, 4)
  t.is(game.turns, 1)
  t.truthy(find(game.discardPile, block))
  t.truthy(find(game.discardPile, gutPunch))
})

Ava.test('whisperStatus() should whisper stats to a player upon request', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [, player2] = game.players
  whisperCallback.reset()
  game.whisperStatus(player2.id)
  t.true(whisperCallback.calledWith(player2.id, 'player:status'))
  t.true(whisperCallback.calledOnce)
})

Ava.test('whisperStatus() should let a player know they have no cards', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.whisperStatus('player1')
  t.true(whisperCallback.calledWith(
    'player1',
    'player:status',
    Sinon.match(/you have no cards/i)
  ))
})

Ava.test('whisperStatus() should ignore whispering statuses to non-players', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  whisperCallback.reset()
  game.whisperStatus('foo')
  game.whisperStatus('bar')
  t.true(whisperCallback.notCalled)
})

Ava.test('whisperStatus() should throw an error when passed an undefined value', (t) => {
  const game = new Junkyard('player1', 'Jay')
  t.throws(() => game.whisperStatus(null))
  t.throws(() => game.whisperStatus())
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

Ava.test('contact() should throw an error if the last param is not a boolean', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  t.throws(() => game.contact(player1.id, player2.id, [Deck.getCard('gut-punch')], {}))
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
