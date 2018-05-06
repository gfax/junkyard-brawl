const Ava = require('ava')
const Junkyard = require('./junkyard')
const Util = require('./util')
const { getCard } = require('./deck')

Ava.test('findNext() should return the next item in an array', (t) => {
  const array = ['a', 'b', 'c', 'd', 'e']
  t.is(Util.findNext(array, 'a'), 'b')
  t.is(Util.findNext(array, 'c'), 'd')
})

Ava.test('findNext() should return the first item in an array if there is no next', (t) => {
  const array = ['a', 'b', 'c', 'd', 'e']
  t.is(Util.findNext(array, 'e'), 'a')
})

Ava.test('getCardWeight() should return weight of cards for countering', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = [getCard('neck-punch')]
  player2.hand = [getCard('grab'), getCard('gut-punch')]
  game.play(player1, getCard('neck-punch'))
  t.is(Util.getCardWeight(player2, player1, getCard('grab'), game), 2.1)
})

Ava.test('getPlayerCounters() should return a sorted list of counter moves', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = [getCard('neck-punch')]
  player2.hand = [getCard('grab'), getCard('gut-punch'), getCard('mirror')]
  game.play(player1, getCard('neck-punch'))
  const moves = Util.getPlayerCounters(player2, player1, game)
  t.is(moves.length, 2)
  t.true(moves[0].weight > moves[1].weight)
})

Ava.test('getPlayerDisasters() should return a sorted list of counter moves', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  player1.hand = [getCard('earthquake'), getCard('deflector')]
  const moves = Util.getPlayerDisasters(player1, game)
  t.is(moves.length, 2)
  t.true(moves[0].weight > moves[1].weight)
})

Ava.test('remove() should remove only one copy of an item from an array', (t) => {
  const array = [1, 2, 3, 4, 5, 4]
  Util.remove(array, el => el === 4)
  t.deepEqual(
    array,
    [1, 2, 3, 5, 4]
  )
})

Ava.test('remove() shouldn\'t touch an array with a false predicate', (t) => {
  const array = [1, 2, 3]
  Util.remove(array, el => el === 4)
  t.deepEqual(
    array,
    [1, 2, 3]
  )
})
