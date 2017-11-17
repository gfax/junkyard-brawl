const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { clone, removeOnce } = require('../util')

Ava.test('should rotate cards forward', (t) => {
  const fuzzyEqual = (arr1, arr2) => {
    const copyArray = clone(arr1)
    arr2.forEach(el => removeOnce(copyArray, el))
    return !copyArray.length
  }
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  const itsGettingWindy = Deck.getCard('its-getting-windy')
  const neckPunch = Deck.getCard('neck-punch')
  const soup = Deck.getCard('soup')
  player1.hand = [gutPunch, gutPunch, gutPunch]
  player2.hand = [neckPunch, neckPunch, neckPunch, itsGettingWindy]
  player3.hand = [soup, soup, soup]

  game.play(player2, itsGettingWindy)

  t.true(announceCallback.calledWith('card:its-getting-windy:disaster'))
  t.true(fuzzyEqual(player1.hand, [gutPunch, gutPunch, soup]))
  t.true(fuzzyEqual(player2.hand, [neckPunch, neckPunch, gutPunch]))
  t.true(fuzzyEqual(player3.hand, [soup, soup, neckPunch]))
})

Ava.test('should account for players with no cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  const itsGettingWindy = Deck.getCard('its-getting-windy')
  player1.hand = [gutPunch]
  player2.hand = [itsGettingWindy]
  player3.hand = []
  game.play(player2, itsGettingWindy)

  t.true(announceCallback.calledWith('card:its-getting-windy:disaster'))
  t.is(player1.hand.length, 0)
  t.is(player2.hand.length, 1)
  t.is(player3.hand.length, 0)
})
