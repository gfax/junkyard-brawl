const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')

Ava.test('should hurt everybody', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const earthquake = getCard('earthquake')
  player1.hand.push(earthquake)
  game.play(player1.id, earthquake)

  t.true(announceCallback.calledWith('card:earthquake:disaster'))
  t.is(player1.hp, player1.maxHp - 1)
  t.is(player2.hp, player2.maxHp - 1)
})

Ava.test('should immediately discard', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  const earthquake = getCard('earthquake')
  player.hand.push(earthquake)
  game.play(player.id, earthquake)

  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(game.discardPile.find(card => card === earthquake))
})

Ava.test('should kill people', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hp = 1
  const earthquake = getCard('earthquake')
  player.hand.push(earthquake)
  game.play(player.id, earthquake)

  t.truthy(game.stopped)
  t.is(game.discardPile.length, player.maxHand + 1)
})

Ava.test('should trigger a no-winner situation', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  player1.hp = 1
  player2.hp = 1
  player3.hp = 1
  const earthquake = getCard('earthquake')
  player1.hand.push(earthquake)
  game.play(player1, earthquake)

  t.true(announceCallback.calledWith('game:no-survivors'))
  t.truthy(game.stopped)
})

Ava.test('should have weight proportional to the number of opponents', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const earthquake = getCard('earthquake')
  player1.hand = [earthquake]
  const plays = earthquake.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.true(play.weight === game.players.length - 1)
  })
})

Ava.test('should not return any plays if playing it is suicide', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const earthquake = getCard('earthquake')
  player1.hand = [earthquake]
  player1.hp = 1
  const plays = earthquake.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.is(plays.length, 0)
})

Ava.test('should return a lot of weight if this will kill an opponent', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const earthquake = getCard('earthquake')
  player1.hand = [earthquake]
  player2.hp = 1
  const plays = earthquake.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, player1.maxHp)
  })
})
