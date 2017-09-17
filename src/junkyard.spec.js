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
    Sinon.match.string
  ))
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
  game.start()
  t.true(game.started instanceof Date)
  t.true(game.players[0] instanceof Player)
  t.true(game.players[1] instanceof Player)
  t.true(announceCallback.calledWith('game:turn'))
})

Ava.test('Should remove a player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  const player = game.addPlayer('player2', 'Kevin')
  game.removePlayer('player2')
  t.true(announceCallback.calledWith('player:dropped'))
  t.is(game.dropouts[0], player)
})

Ava.test('Gut Punch should work', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player, target] = game.players
  const card = Deck.getCard('gut-punch')
  player.hand.push(card)
  game.play(player.id, target.id, [card])
  t.is(target.hp, 8)
})
