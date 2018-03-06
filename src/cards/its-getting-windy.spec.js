const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should rotate cards forward', (t) => {
  const fuzzyEqual = (arr1, arr2) => {
    return arr2.filter((el) => {
      return find(arr1, { id: el.id })
    }).length === arr1.length
  }
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  const gutPunch = getCard('gut-punch')
  const itsGettingWindy = getCard('its-getting-windy')
  const neckPunch = getCard('neck-punch')
  const soup = getCard('soup')
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
  const gutPunch = getCard('gut-punch')
  const itsGettingWindy = getCard('its-getting-windy')
  player1.hand = [gutPunch]
  player2.hand = [itsGettingWindy]
  player3.hand = []
  game.play(player2, itsGettingWindy)

  t.true(announceCallback.calledWith('card:its-getting-windy:disaster'))
  t.is(player1.hand.length, 0)
  t.is(player2.hand.length, 1)
  t.is(player3.hand.length, 0)
})

Ava.test('should have a weight proportional to their hand\'s weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const gutPunch = getCard('gut-punch')
  const itsGettingWindy = getCard('its-getting-windy')
  player1.hand = [gutPunch, gutPunch, itsGettingWindy]
  const plays = itsGettingWindy.validDisasters(player1, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 0.4)
  })
})
