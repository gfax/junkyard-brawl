const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should duplicate attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('mirror'))

  game.play(player1.id, Deck.getCard('gut-punch'))
  game.play(player2.id, Deck.getCard('mirror'))

  t.true(announceCallback.calledWith('card:gut-punch:contact'))
  t.true(announceCallback.calledWith('card:mirror:counter'))
  t.is(player1.hp, player1.maxHp - 2)
  t.is(player2.hp, player2.maxHp - 2)
})

Ava.test('should duplicate unstoppable attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const aGun = Deck.getCard('a-gun')
  const mirror = Deck.getCard('mirror')
  player1.hand.push(grab)
  player1.hand.push(aGun)
  player2.hand.push(mirror)

  game.play(player1.id, [grab, aGun])
  game.play(player2.id, [mirror])

  t.true(announceCallback.calledWith('card:a-gun:contact'))
  t.true(announceCallback.calledWith('card:mirror:counter'))
  t.is(player1.hp, player1.maxHp - 2)
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 3)
  t.truthy(find(game.discardPile, mirror))
  t.truthy(find(game.discardPile, grab))
  t.truthy(find(game.discardPile, aGun))
})

Ava.test('should duplicate support', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const armor = Deck.getCard('armor')
  const mirror = Deck.getCard('mirror')
  player1.hand.push(grab)
  player1.hand.push(armor)
  player2.hand.push(mirror)

  game.play(player1.id, [grab, armor])
  game.play(player2.id, [mirror])

  t.true(announceCallback.calledWith('card:armor:contact'))
  t.true(announceCallback.calledWith('card:mirror:counter'))
  t.is(game.turns, 1)
  t.is(player1.hp, player1.maxHp + 5)
  t.is(player2.hp, player2.maxHp + 5)
  t.is(game.discardPile.length, 3)
  t.truthy(find(game.discardPile, mirror))
  t.truthy(find(game.discardPile, grab))
  t.truthy(find(game.discardPile, armor))
})

Ava.test('should work with Deflector', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  let [player1] = game.players
  let player2 = null
  const deflector = Deck.getCard('deflector')
  const gutPunch = Deck.getCard('gut-punch')
  const mirror = Deck.getCard('mirror')
  player1.hand.push(deflector)
  game.play(player1.id, deflector)
  if (player1.conditionCards.length) {
    game.incrementTurn()
  }
  [player1, player2] = game.players
  player1.hand.push(mirror)
  player2.hand.push(gutPunch)
  game.incrementTurn()
  game.play(player2.id, gutPunch)
  game.play(player1.id, mirror)

  t.is(game.players[0].id, player1.id, 'Turn should increment after countering')
  t.is(player2.hp, player1.maxHp)
  t.is(player1.hp, player2.maxHp - 4)
  t.is(game.discardPile.length, 3)
})
