const Ava = require('ava')
const Bot = require('./bot')
const Junkyard = require('./junkyard')
const Sinon = require('sinon')
const { getCard } = require('./deck')
const { find } = require('./util')

Ava.test('should instantiate an object', (t) => {
  const game = new Junkyard('human1', 'Jay')
  t.is(typeof new Bot('Dark', game), 'object')
})

Ava.test('should require the bot name to be a string', (t) => {
  const game = new Junkyard('human1', 'Jay')
  t.throws(() => {
    new Bot(2, game)
  })
  t.throws(() => {
    new Bot({}, game)
  })
})

Ava.test('should require a game object to be passed on instantiation', (t) => {
  t.throws(() => new Bot('Dark'))
  t.throws(() => new Bot('Dark', null))
  t.throws(() => new Bot('Dark', {}))
})

Ava.test('should make some reasonable moves', (t) => {
  const game = new Junkyard('human1', 'Jay')
  const bot = game.addBot('Dark')
  bot.hand = [
    getCard('neck-punch'),
    getCard('neck-punch'),
    getCard('neck-punch'),
    getCard('neck-punch'),
    getCard('uppercut')
  ]
  game.start()
  if (game.players[0].id === 'human1') {
    game.incrementTurn()
  }
  t.is(game.players[0].discard[0].id, 'uppercut')
})

Ava.test('should discard if it has a crappy hand', (t) => {
  const game = new Junkyard('human1', 'Jay')
  const bot = game.addBot('Dark')
  bot.hand = [
    getCard('soup'),
    getCard('soup'),
    getCard('soup'),
    getCard('soup'),
    getCard('soup')
  ]
  game.start()
  // Stuck on player's turn, increment turn so bot can move
  if (!game.turns) {
    game.incrementTurn()
  }
  t.true(game.discardPile.length >= 5)
  game.discardPile.slice(0, 5).forEach(card => card.id === 'soup')
})

Ava.test('should counter when reasonable to do so', (t) => {
  const game = new Junkyard('human1', 'Jay')
  const bot = game.addBot('Dark')
  bot.hand = [
    getCard('block'),
    getCard('uppercut'),
    getCard('uppercut'),
    getCard('uppercut'),
    getCard('uppercut')
  ]
  bot.hp = 4
  game.start()
  // Stuck on player responding, increment turn so bot can move
  while (game.players[0] === bot) {
    game.incrementTurn()
  }

  const uppercut = getCard('uppercut')
  game.players[0].hand.push(uppercut)
  game.play('human1', uppercut)
  t.truthy(find(game.discardPile, { id: 'block' }))
})

Ava.test('should use disaster cards when it makes sense', (t) => {
  const game = new Junkyard('human1', 'Jay')
  const spy = Sinon.spy(game, 'play')
  const bot = game.addBot('Dark')
  bot.hand = [
    getCard('deflector'),
    getCard('uppercut'),
    getCard('uppercut'),
    getCard('uppercut'),
    getCard('uppercut')
  ]
  game.start()

  t.true(spy.called)
  t.true(spy.calledWithExactly(bot, Sinon.match((val) => {
    return val && val.length && val[0].id === 'deflector'
  })))
})

Ava.test('should pass if there is no choice', (t) => {
  const game = new Junkyard('human1', 'Jay')
  const spy = Sinon.spy(game, 'pass')
  const bot = game.addBot('Dark')
  bot.hand = [
    getCard('uppercut'),
    getCard('uppercut'),
    getCard('uppercut'),
    getCard('uppercut'),
    getCard('uppercut')
  ]
  game.start()
  // Stuck on player responding, increment turn so bot can move
  while (game.players[0] === bot) {
    game.incrementTurn()
  }

  const uppercut = getCard('uppercut')
  game.players[0].hand.push(uppercut)
  game.play('human1', uppercut)
  t.true(spy.calledOnce)
  t.true(spy.calledWithExactly(bot))
})
