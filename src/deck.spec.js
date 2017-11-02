const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('./deck')
const Junkyard = require('./junkyard')
const Player = require('./player')
const { clone, find, removeOnce } = require('./util')

Ava.test('Should return an object', (t) => {
  t.is(typeof Deck, 'object')
})

Ava.test('generate() should generate a deck', (t) => {
  t.true(Array.isArray(Deck.generate()))
})

Ava.test('generate() should not contain invalid cards in a deck', (t) => {
  const validTypes = /^(attack|counter|disaster|support|unstoppable)$/
  Deck.generate()
    .forEach((card) => {
      t.is(typeof card, 'object')
      t.is(typeof card.id, 'string')
      t.true(
        Array.isArray(card.type.match(validTypes)),
        `Card ${card.id} has an invalid type: ${card.type}`
      )
      if (card.type === 'counter') {
        t.is(
          typeof card.counter,
          'function',
          `Counter card ${card.id} should have a counter function. Got: ${card.counter}`
        )
      }
      if (card.filter) {
        t.deepEqual(
          card.filter([]),
          [],
          `Card filters should return empty arrays for empty requests. Got ${card.filter([])}`
        )
      }
    })
})

Ava.test('getCard() should return a card object', (t) => {
  const card = Deck.getCard('gut-punch')
  t.is(card.id, 'gut-punch')
  t.is(card.type, 'attack')
})

Ava.test('getCard() should throw an error when requesting an invalid card', (t) => {
  t.throws(() => Deck.getCard('fakecard'))
})

Ava.test('parseCards() should throw an error when not given a player', (t) => {
  t.throws(() => {
    Deck.parseCards({ id: 'user2', name: 'Kebbin' }, Deck.getCard('gut-punch'))
  })
})

Ava.test('parseCards() should throw an error when not passed a request', (t) => {
  t.throws(() => Deck.parseCards(new Player('user1', 'Jay')))
})

Ava.test('parseCards() should throw an error when passed invalid cards', (t) => {
  t.throws(() => Deck.parseCards(
    new Player('user1', 'Jay'),
    [{ id: 'gut-punch' }]
  ))
})

Ava.test('parseCards() should return an empty array when a player has no cards', (t) => {
  t.deepEqual(Deck.parseCards(new Player('user1', 'Jay'), '1 2 3'), [])
})

Ava.test('parseCards() should return an empty array when passed an empty array', (t) => {
  t.deepEqual(Deck.parseCards(new Player('user1', 'Jay'), []), [])
})

Ava.test('parseCards() should parse a card object', (t) => {
  t.deepEqual(
    Deck.parseCards(new Player('user1', 'Jay'), Deck.getCard('gut-punch')),
    [Deck.getCard('gut-punch')]
  )
})

Ava.test('parseCards() should parse a string of numbers', (t) => {
  const player = new Player('user1', 'Jay')
  player.hand = [
    Deck.getCard('gut-punch'),
    Deck.getCard('neck-punch'),
    Deck.getCard('guard-dog')
  ]
  t.deepEqual(
    Deck.parseCards(player, ' 2 1'),
    [Deck.getCard('neck-punch')]
  )
})

Ava.test('Gut Punch should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player, target] = game.players
  player.hand.push(Deck.getCard('gut-punch'))

  game.play(player.id, [Deck.getCard('gut-punch')])
  game.pass(target.id)
  t.is(target.hp, 8)
  t.truthy(find(game.discardPile, { id: 'gut-punch' }))
  t.is(game.discardPile.length, 1)
})

Ava.test('Grab should be playable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  const aGun = Deck.getCard('a-gun')
  player1.hand.push(grab)
  player1.hand.push(gutPunch)
  player2.hand.push(grab)
  player2.hand.push(aGun)

  game.play(player1.id, [grab, gutPunch])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:grab:play'))
  t.true(announceCallback.calledWith('card:gut-punch:contact'))

  game.play(player2.id, [grab, aGun])
  game.pass(player1.id)

  t.true(announceCallback.calledWith('card:grab:play'))
  t.true(announceCallback.calledWith('card:a-gun:contact'))

  t.truthy(find(game.discardPile, grab))
  t.is(game.discardPile.length, 4)
})

Ava.test('Grab should only play with an attack', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy().withArgs(Sinon.match.any, 'card:grab:invalid-card')
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()
  whisperCallback.reset()

  const [player] = game.players
  player.hand = player.hand.concat([
    Deck.getCard('grab'),
    Deck.getCard('grab')
  ])

  game.play(player.id, [Deck.getCard('grab')])
  game.play(player.id, [Deck.getCard('grab'), Deck.getCard('grab')])

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.called)
})

Ava.test('Grab should only counter with an attack', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
    .withArgs(Sinon.match.any, 'card:grab:invalid-card')
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  const grab = Deck.getCard('grab')
  player1.hand.push(gutPunch)
  player2.hand.push(grab)
  player2.hand.push(grab)

  game.play(player1.id, gutPunch)
  whisperCallback.reset()
  game.play(player2.id, grab)
  game.play(player2.id, grab, grab)

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.calledWith(player2.id, 'card:grab:invalid-card'))
  t.true(whisperCallback.calledTwice)
})

Ava.test('Grab should counter', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand = player1.hand.concat([
    Deck.getCard('grab'),
    Deck.getCard('grab'),
    Deck.getCard('gut-punch'),
    Deck.getCard('gut-punch')
  ])
  player2.hand = player2.hand.concat([
    Deck.getCard('grab'),
    Deck.getCard('gut-punch')
  ])

  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.pass(player2.id)
  t.is(player1.hp, 8)
  t.is(player2.hp, 6)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 6)
})

Ava.test('Acid Coffee should make a player miss a turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('acid-coffee'))

  game.play(player1.id, [Deck.getCard('acid-coffee')])
  game.pass(player2.id)
  t.is(player2.hp, player2.maxHp - 3)
  t.is(game.turns, 2)
})

Ava.test('Acid Coffee should delay discarding', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, , player3] = game.players
  player1.hand.push(Deck.getCard('acid-coffee'))

  game.play(player1.id, [Deck.getCard('acid-coffee')], player3.id)
  t.is(player1.hand.length, player1.maxHand)

  game.pass(player3.id)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  t.is(game.discardPile.length, 1)
})

Ava.test('Acid Coffee should discard even in the event of death', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('acid-coffee'))
  player2.hp = 3

  game.play(player1.id, [Deck.getCard('acid-coffee')])
  t.is(player1.hand.length, player1.maxHand)

  game.pass(player2.id)
  t.truthy(game.stopped)
  t.is(game.discardPile.length, player2.maxHand + 1)
  t.truthy(find(game.discardPile, Deck.getCard('acid-coffee')))
})

Ava.test('A Gun should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('a-gun'))

  game.play(player1, Deck.getCard('a-gun'))
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, { id: 'a-gun' }))
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('A Gun should be able to kill a player', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('a-gun'))
  player2.hp = 2

  game.play(player1, Deck.getCard('a-gun'))
  t.is(game.players.length, 1)
})

Ava.test('A Gun should be unblockable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = player1.hand.concat([
    Deck.getCard('grab'),
    Deck.getCard('a-gun')
  ])
  player2.hand = player2.hand.concat([
    Deck.getCard('block')
  ])

  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('a-gun')])
  game.play(player2.id, [Deck.getCard('block')])
  t.true(announceCallback.calledWith('player:counter-failed'))
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 1)
  t.is(game.players[0], player2)
  t.is(game.discardPile.length, 3)
  t.is(player1.hand.length, player1.maxHand)
  t.is(player2.hand.length, player2.maxHand)
  t.truthy(find(game.discardPile, { id: 'grab' }))
  t.truthy(find(game.discardPile, { id: 'a-gun' }))
  t.truthy(find(game.discardPile, { id: 'block' }))
})

Ava.test('Armor should add 5 HP, even past the player\'s max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hand.push(Deck.getCard('armor'))
  game.play(player.id, [Deck.getCard('armor')])

  t.true(announceCallback.calledWith('card:armor:contact'))
  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 1)
  t.is(player.hp, player.maxHp + 5)
})

Ava.test('Avalanche should attack a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [, player] = game.players
  const avalanche = Deck.getCard('avalanche')
  player.hand.push(avalanche)
  game.play(player.id, [avalanche])

  t.is(
    game.players.reduce((acc, plyr) => acc + plyr.hp, 0),
    game.players.reduce((acc, plyr) => acc + plyr.maxHp, 0) - 6
  )
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, avalanche))
  t.is(player.hand.length, player.maxHand)
})

Ava.test('Avalanche should be able to kill a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  player1.hp = 6
  player2.hp = 6
  player3.hp = 6
  player2.hand.push(Deck.getCard('avalanche'))
  game.play(player2.id, Deck.getCard('avalanche'))

  t.true(announceCallback.calledWith('player:died'))
  t.is(game.players.length, 2)
  t.is(game.dropouts.length, 1)
})

Ava.test('Block should counter', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('block'))

  game.play(player1.id, [Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('block')])
  t.is(player2.hp, player2.maxHp)
  t.true(announceCallback.calledWith('card:block:counter'))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('Block should be thwarted by unstoppable cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('grab'))
  player1.hand.push(Deck.getCard('a-gun'))
  player2.hand.push(Deck.getCard('block'))

  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('a-gun')])
  game.play(player2.id, [Deck.getCard('block')])
  t.is(player2.hp, player2.maxHp - 2)
  t.true(announceCallback.calledWith('player:counter-failed'))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 3)
})

Ava.test('Bulldozer should leave a target with no cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, , player3] = game.players
  player1.hand.push(Deck.getCard('bulldozer'))
  game.play(player1.id, Deck.getCard('bulldozer'), player3.id)

  t.true(announceCallback.calledWith('card:bulldozer:contact'))
  t.is(player3.hand.length, 0)
  t.is(game.turns, 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, player3.maxHand + 1)
})

Ava.test('Cheap Shot should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const cheapShot = Deck.getCard('cheap-shot')
  player1.hand.push(cheapShot)

  game.play(player1.id, [cheapShot])
  t.is(player2.hp, player2.maxHp - 1)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, cheapShot))
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('Crane should dump cards onto a target', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const crane = Deck.getCard('crane')
  player1.hand.push(crane)
  const [card1, card2, card3] = player1.hand
  game.play(player1.id, [crane, card1, card2, card3])

  t.is(player2.hand.length, player2.maxHand + 3)
  t.truthy(find(player2.hand, card1))
  t.truthy(find(player2.hand, card2))
  t.truthy(find(player2.hand, card3))
  t.true(announceCallback.calledWith('card:crane:contact'))
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('Crane should be playable with a grab', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  const aGun = Deck.getCard('a-gun')
  const crane = Deck.getCard('crane')
  const grab = Deck.getCard('grab')
  player1.hand.push(grab)
  player1.hand.push(aGun)
  player3.hand.push(aGun)
  player3.hand.push(grab)
  player3.hand.push(crane)
  const [card1, card2, card3] = player3.hand
  game.play(player1.id, [grab, aGun], player3.id)
  game.play(player3.id, [grab, crane, card1, card2, card3])
  game.pass(player1.id)

  t.is(game.turns, 1)
  t.is(game.players[0], player2)
  t.is(game.discardPile.length, 4)
  t.is(player1.hand.length, player1.maxHand + 3)
  t.is(player3.hand.length, player3.maxHand + 1)
})

Ava.test('Deflector should attach to a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('deflector'))

  announceCallback.reset()
  game.play(player1.id, [Deck.getCard('deflector')])

  t.true(announceCallback.calledWith('card:deflector:play'))
  t.true(announceCallback.calledOnce)
  t.is(game.discardPile.length, 0, 'card should be with the player, not discarded yet')
  t.is(player1.beforeContact.length + player2.beforeContact.length, 1)
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('Deflector should deflect an attack to another random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const deflector = Deck.getCard('deflector')
  player1.hand.push(deflector)
  game.play(player1.id, [deflector])
  const gutPunch = Deck.getCard('gut-punch')

  if (player1.beforeContact.length) {
    game.incrementTurn()
    player2.hand.push(gutPunch)
    game.play(player2.id, [gutPunch])
    game.pass(player1.id)
    t.is(player1.hp, player1.maxHp)
    t.is(player2.hp, player2.maxHp - 2)
    t.is(game.turns, 2)
  } else {
    player1.hand.push(gutPunch)
    game.play(player1.id, [gutPunch])
    game.pass(player2.id)
    t.is(player2.hp, player2.maxHp)
    t.is(player1.hp, player1.maxHp - 2)
    t.is(game.turns, 1)
  }

  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.is(player1.beforeContact.length + player2.beforeContact.length, 0)
  t.truthy(find(game.discardPile, deflector))
})

Ava.test('Deflector should also deflect Avalanches', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const avalanche = Deck.getCard('avalanche')
  const deflector = Deck.getCard('deflector')
  player1.hand.push(deflector)
  player2.hand.push(avalanche)
  game.play(player1.id, [deflector])
  game.contact(player2, player1, [avalanche])
  t.is(player2.hp, player2.maxHp - 6)
  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.true(announceCallback.calledWith('card:avalanche:contact'))
  t.is(game.discardPile.length, 2)
})

Ava.test('Deflector should halt resolving further before-contact conditions', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const deflector = Deck.getCard('deflector')
  const gutPunch = Deck.getCard('gut-punch')
  player2.beforeContact.push(deflector.beforeContact)
  player2.beforeContact.push(deflector.beforeContact)
  player1.hand.push(gutPunch)
  game.play(player1.id, [gutPunch])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.is(game.turns, 1)
  t.is(player2.beforeContact.length, 1, 'player should have 1 unresolved beforeContact')
})

Ava.test('Deflector should resolve before-contact conditions across player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const deflector = Deck.getCard('deflector')
  const gutPunch = Deck.getCard('gut-punch')
  player1.beforeContact.push(deflector.beforeContact)
  player2.beforeContact.push(deflector.beforeContact)
  player1.hand.push(gutPunch)
  game.play(player1.id, [gutPunch])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:deflector:deflect'))
  t.is(game.turns, 1)
  t.is(player2.hp, player2.maxHp - 2)
})

Ava.test('Deflector should discard if the player holding it is removed', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1] = game.players
  const deflector = Deck.getCard('deflector')
  player1.hand.push(deflector)
  game.play(player1.id, [deflector])
  game.removePlayer(player1.id)
  t.is(game.discardPile.length, player1.maxHand + 1)
  t.truthy(find(game.discardPile, deflector))
  t.is(game.turns, 0)
})

Ava.test('Dodge should counter and nullify attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, , player3] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player3.hand.push(Deck.getCard('dodge'))

  game.play(player1.id, Deck.getCard('gut-punch'), player3)
  game.play(player3.id, Deck.getCard('dodge'))

  t.true(announceCallback.calledWith('card:dodge:nullify'))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('Dodge should counter and refer attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('dodge'))

  game.play(player1.id, [Deck.getCard('gut-punch')], player2.id)
  game.play(player2.id, [Deck.getCard('dodge')])

  t.true(announceCallback.calledWith('card:dodge:new-target'))
  t.is(game.turns, 0)
  t.is(game.discardPile.length, 1)
  t.is(game.target, player3)
})

Ava.test('Dodge should not be playable when grabbed', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('grab'))
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('dodge'))

  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('dodge')])

  t.true(whisperCallback.calledWith(player2.id, 'card:dodge:invalid'))
  t.is(game.turns, 0)
  t.is(game.discardPile.length, 0)
})

Ava.test('Energy Drink should heal a player over the course of 3 turns', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  const energyDrink = Deck.getCard('energy-drink')
  player.hand.push(energyDrink)
  player.hp = 2
  game.play(player.id, [energyDrink])

  t.true(announceCallback.calledWith('card:energy-drink:contact'))
  t.false(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.is(player.hp, 3)
  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, 4)
  t.is(game.discardPile.length, 0)
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))

  announceCallback.reset()
  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, 5)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, energyDrink))
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('Energy Drink should have no effect on a player at or above their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  const energyDrink = Deck.getCard('energy-drink')
  player.hand.push(energyDrink)
  player.hp = player.maxHp + 5
  game.play(player.id, [energyDrink])

  t.true(announceCallback.calledWith('card:energy-drink:contact'))
  t.false(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.is(player.hp, player.maxHp + 5)
  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, player.maxHp + 5)
  t.is(game.discardPile.length, 0)
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))

  announceCallback.reset()
  game.incrementTurn()
  game.incrementTurn()
  t.is(player.hp, player.maxHp + 5)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, energyDrink))
  t.true(announceCallback.calledWith('card:energy-drink:before-turn'))
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('Earthquake should hurt everybody', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('earthquake'))
  game.play(player1.id, Deck.getCard('earthquake'))

  t.true(announceCallback.calledWith('card:earthquake:disaster'))
  t.is(player1.hp, player1.maxHp - 1)
  t.is(player2.hp, player2.maxHp - 1)
})

Ava.test('Earthquake should immediately discard', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hand.push(Deck.getCard('earthquake'))
  game.play(player.id, Deck.getCard('earthquake'))

  t.is(player.hand.length, player.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, Deck.getCard('earthquake')))
})

Ava.test('Earthquake should kill people', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player] = game.players
  player.hp = 1
  player.hand.push(Deck.getCard('earthquake'))
  game.play(player.id, Deck.getCard('earthquake'))

  t.truthy(game.stopped)
  t.is(game.discardPile.length, player.maxHand + 1)
})

Ava.test('Earthquake should trigger a no-winner situation', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [player1, player2, player3] = game.players
  player1.hp = 1
  player2.hp = 1
  player3.hp = 1
  player1.hand.push(Deck.getCard('earthquake'))
  game.play(player1, Deck.getCard('earthquake'))

  t.true(announceCallback.calledWith('game:no-survivors'))
  t.truthy(game.stopped)
})

Ava.test('Gamblin\' man should do some random damage between 1 and 6', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gamblin-man'))
  game.play(player1.id, Deck.getCard('gamblin-man'))
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:gamblin-man:contact'))
  t.true(player2.hp <= player2.maxHp - 1)
  t.true(player2.hp >= player2.maxHp - 6)
  t.is(game.turns, 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
})

Ava.test('Gas Spill should cause a player to miss 2 turns.', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gas-spill'))

  game.play(player1.id, [Deck.getCard('gas-spill')])
  t.true(announceCallback.calledWith('card:gas-spill:contact'))
  t.is(player1.beforeTurn.length + player2.beforeTurn.length, 1)
  t.is(player1.missTurns + player2.missTurns, 2)
})

Ava.test('Gas Spill should delay discarding', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const gasSpill = Deck.getCard('gas-spill')
  player1.hand.push(gasSpill)
  game.play(player1.id, [gasSpill])
  t.is(player1.hand.length, player1.maxHand)

  t.is(game.discardPile.length, 0)
  if (player1.beforeTurn.length) {
    t.is(player1.missTurns, 2)
    game.incrementTurn()
    game.incrementTurn()
    t.is(player1.missTurns, 1)
    t.is(game.discardPile.length, 0)
    game.incrementTurn()
  } else if (player2.beforeTurn.length) {
    game.incrementTurn()
    t.is(game.discardPile.length, 0)
    game.incrementTurn()
  } else {
    t.fail()
  }
  t.is(game.discardPile.length, 1)
  t.true(announceCallback.calledWith('player:discard'))
})

Ava.test('Gas Spill should discard when the affected player is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const gasSpill = Deck.getCard('gas-spill')
  game.players[0].hand.push(gasSpill)
  game.play(game.players[0].id, [gasSpill])

  t.is(game.discardPile.length, 0)
  const player = find(game.players, plyr => plyr.beforeTurn.length === 1)
  game.removePlayer(player.id)
  t.is(game.discardPile.length, player.maxHand + 1)
  t.truthy(find(game.discardPile, gasSpill))
})

Ava.test('Grease Bucket should make a player miss a turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('grease-bucket'))

  game.play(player1.id, [Deck.getCard('grease-bucket')])
  game.pass(player2.id)
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 2)
})

Ava.test('Grease Bucket should delay discarding', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, , player3] = game.players
  player1.hand.push(Deck.getCard('grease-bucket'))

  game.play(player1.id, [Deck.getCard('grease-bucket')], player3.id)
  t.is(player1.hand.length, player1.maxHand)

  game.pass(player3.id)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  t.is(game.discardPile.length, 1)
})

Ava.test('Grease Bucket should discard when a player dies', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('grease-bucket'))
  player2.hp = 2

  game.play(player1.id, [Deck.getCard('grease-bucket')])
  game.pass(player2.id)

  t.truthy(find(game.discardPile, Deck.getCard('grease-bucket')))
  t.is(game.discardPile.length, player2.maxHand + 1)
})

Ava.test('Insurance should restore a player to half HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('insurance'))
  player2.hp = 2
  game.play(player1.id, Deck.getCard('gut-punch'))
  game.play(player2.id, Deck.getCard('insurance'))

  t.is(player2.hp, Math.floor(player2.maxHp / 2))
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.true(announceCallback.calledWith('card:insurance:success'))
  t.truthy(find(game.discardPile, { id: 'insurance' }))
})

Ava.test('Insurance should work against unstoppable attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('grab'))
  player1.hand.push(Deck.getCard('a-gun'))
  player2.hand.push(Deck.getCard('insurance'))
  player2.hp = 1
  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('a-gun')])
  game.play(player2.id, Deck.getCard('insurance'))

  t.is(player2.hp, Math.floor(player2.maxHp / 2))
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.true(announceCallback.calledWith('card:insurance:success'))
})

Ava.test('Insurance should do nothing when a player lives', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('insurance'))
  game.play(player1.id, Deck.getCard('gut-punch'))
  game.play(player2.id, Deck.getCard('insurance'))

  t.is(player2.hp, player2.maxHp - 2)
  t.true(announceCallback.calledWith('card:insurance:counter'))
  t.false(announceCallback.calledWith('card:insurance:success'))
})

Ava.test('It\'s Getting Windy should rotate cards forward', (t) => {
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

Ava.test('It\'s Getting Windy should account for players with no cards', (t) => {
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

Ava.test('Guard Dog should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand = player1.hand.concat([Deck.getCard('guard-dog')])
  player2.hand = player2.hand.concat([Deck.getCard('guard-dog')])

  game.play(player1.id, [Deck.getCard('guard-dog')])
  game.pass(player2.id)
  t.is(player2.hp, 6)
  game.play(player2.id, [Deck.getCard('guard-dog')])
  game.pass(player1.id)
  t.is(player1.hp, 6)
})

Ava.test('Magnet should steal cards from another player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const aGun = Deck.getCard('a-gun')
  const crazyHand = [aGun, aGun, aGun, aGun, aGun]
  player1.hand.push(Deck.getCard('magnet'))
  player2.hand = clone(crazyHand)
  game.play(player1.id, [...player1.hand.reverse()])

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:magnet:contact'))
  t.deepEqual(player1.hand, crazyHand)
})

Ava.test('Magnet shouldn\'t try to steal more than the player has', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const aGun = Deck.getCard('a-gun')
  const crazyHand = [aGun]
  player1.hand.push(Deck.getCard('magnet'))
  player2.hand = clone(crazyHand)
  game.play(player1.id, [...player1.hand.reverse()])

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:magnet:contact'))
  t.deepEqual(player1.hand, crazyHand)
})

Ava.test('Mattress should absorb up to 2 hp of damage', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const neckPunch = Deck.getCard('neck-punch')
  const mattress = Deck.getCard('mattress')
  player1.hand.push(neckPunch)
  player2.hand.push(mattress)
  game.play(player1.id, neckPunch)
  game.play(player2.id, mattress)

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:mattress:counter'))
  t.is(player2.hp, player2.maxHp - 1)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, neckPunch))
  t.truthy(find(game.discardPile, mattress))
})

Ava.test('Mattress should not give a player more hp than they had', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const cheapShot = Deck.getCard('cheap-shot')
  const mattress = Deck.getCard('mattress')
  player1.hand.push(grab)
  player1.hand.push(cheapShot)
  player2.hand.push(mattress)
  player2.hp = 5
  game.play(player1.id, [grab, cheapShot])
  game.play(player2.id, mattress)

  t.is(game.turns, 1)
  t.true(announceCallback.calledWith('card:mattress:counter'))
  t.is(player2.hp, 5)
  t.is(game.discardPile.length, 3)
  t.truthy(find(game.discardPile, grab))
  t.truthy(find(game.discardPile, cheapShot))
  t.truthy(find(game.discardPile, mattress))
})

Ava.test('Mattress should work when a player has more than max hp', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const uppercut = Deck.getCard('uppercut')
  const mattress = Deck.getCard('mattress')
  player1.hand.push(uppercut)
  player2.hand.push(mattress)
  player2.hp = player2.maxHp + 6
  game.play(player1.id, uppercut)
  game.play(player2.id, mattress)

  t.is(player2.hp, player2.maxHp + 3)
  t.is(game.discardPile.length, 2)
})

Ava.test('Matress shouldn\'t have an effect when there was no damage', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const sub = Deck.getCard('sub')
  const mattress = Deck.getCard('mattress')
  player1.hand.push(grab)
  player1.hand.push(sub)
  player2.hand.push(mattress)
  player2.hp = 5
  game.play(player1.id, [grab, sub])
  game.play(player2.id, mattress)

  t.is(player2.hp, 5)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 3)
})

Ava.test('Meal Steal should steal multiple cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  const soup = Deck.getCard('soup')
  const sub = Deck.getCard('sub')
  player1.hand.push(mealSteal)
  player2.hand = [soup, sub, gutPunch, sub]

  game.play(player1, mealSteal)

  t.true(announceCallback.calledWith('card:meal-steal:steal-multiple'))
  t.is(player1.hp, player1.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.truthy(find(player2.hand, gutPunch))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 4)
})

Ava.test('Meal Steal should heal with multiple stolen cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  const soup = Deck.getCard('soup')
  const sub = Deck.getCard('sub')
  player1.hp = 1
  player1.hand.push(mealSteal)
  player2.hand = [soup, sub, gutPunch, sub]

  game.play(player1, mealSteal)

  t.is(player1.hp, 6)
})

Ava.test('Meal Steal should steal one card', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  const sub = Deck.getCard('sub')
  player1.hand.push(mealSteal)
  player2.hand = [gutPunch, sub]

  game.play(player1, mealSteal)

  t.true(announceCallback.calledWith('card:meal-steal:steal-one'))
  t.is(player1.hp, player1.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.truthy(find(player2.hand, gutPunch))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('Meal Steal should steal zero cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hand.push(mealSteal)
  player2.hand = [gutPunch]

  game.play(player1, mealSteal)

  t.true(announceCallback.calledWith('card:meal-steal:steal-zero'))
  t.is(player1.hp, player1.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.truthy(find(player2.hand, gutPunch))
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
})

Ava.test('Meal Steal should have no effect with no stolen cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const mealSteal = Deck.getCard('meal-steal')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hp = 1
  player1.hand.push(mealSteal)
  player2.hand = [gutPunch]

  game.play(player1, mealSteal)

  t.is(player1.hp, 1)
})

Ava.test('Mirror should duplicate attacks', (t) => {
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

Ava.test('Mirror should duplicate unstoppable attacks', (t) => {
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

Ava.test('Mirror should duplicate support', (t) => {
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

Ava.test('Mirror should work with Deflector', (t) => {
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

Ava.test('Neck Punch should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('neck-punch'))
  player2.hand.push(Deck.getCard('neck-punch'))

  game.play(player1.id, [Deck.getCard('neck-punch')])
  game.pass(player2.id)
  t.is(player2.hp, 7)
  game.play(player2.id, [Deck.getCard('neck-punch')])
  game.pass(player1.id)
  t.is(player1.hp, 7)
})

Ava.test('Reverse should reverse order of play', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.addPlayer('player4', 'Dark')
  game.start()

  const [player1, player2, player3, player4] = game.players
  const reverse = Deck.getCard('reverse')
  player2.hand.push(reverse)
  game.play(player2, reverse)

  t.true(announceCallback.calledWith('card:reverse:disaster'))
  t.deepEqual(game.players, [player4, player3, player2, player1])
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, reverse))
})

Ava.test('Siphon should steal health from a player and give to another', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const siphon = Deck.getCard('siphon')
  player1.hp = 5
  player1.hand.push(siphon)
  game.play(player1, siphon)
  game.pass(player2)

  t.is(player1.hp, 6)
  t.is(player2.hp, player2.maxHp - 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, siphon))
})

Ava.test('Siphon should not give a player more than their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const siphon = Deck.getCard('siphon')
  player1.hp = player1.maxHp + 5
  player1.hand.push(siphon)
  game.play(player1, siphon)
  game.pass(player2)

  t.is(player1.hp, player1.maxHp + 5)
  t.is(player2.hp, player2.maxHp - 1)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, siphon))
})

Ava.test('Sleep should work with attacks - Gut Punch', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(gutPunch)
  game.play(player1.id, [sleep, gutPunch])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(game.turns, 1)
  t.is(player1.hp, 4)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, gutPunch))
})

Ava.test('Sleep should work with unstoppable attacks - Cheap Shot', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const cheapShot = Deck.getCard('cheap-shot')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(cheapShot)
  game.play(player1.id, [sleep, cheapShot])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(player1.hp, 3)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, cheapShot))
})

Ava.test('Sleep should work during a grab', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const sleep = Deck.getCard('sleep')
  const tireIron = Deck.getCard('tire-iron')
  player1.hp = 2
  player1.hand.push(grab)
  player1.hand.push(sleep)
  player1.hand.push(tireIron)
  game.play(player1.id, [grab, sleep, tireIron])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(game.turns, 1)
  t.is(player1.hp, 5)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 3)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, grab))
  t.truthy(find(game.discardPile, tireIron))
})

Ava.test('Sleep should not heal a player past their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const aGun = Deck.getCard('a-gun')
  player1.hand.push(sleep)
  player1.hand.push(aGun)
  game.play(player1.id, [sleep, aGun])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(player1.hp, player1.maxHp)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, aGun))
})

Ava.test('Sleep should not heal a player if the attack does no damage', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const tire = Deck.getCard('tire')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(tire)
  game.play(player1.id, [sleep, tire])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(player1.hp, 2)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, tire))
})

Ava.test('Sleep should warn when a player plays it wrong', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1] = game.players
  const sleep = Deck.getCard('sleep')
  const avalanche = Deck.getCard('avalanche')
  const soup = Deck.getCard('soup')
  const grab = Deck.getCard('grab')
  player1.hp = 2
  player1.hand.push(sleep)
  player1.hand.push(avalanche)
  player1.hand.push(soup)
  player1.hand.push(grab)

  game.play(player1.id, [sleep])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  game.play(player1.id, [sleep, avalanche])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  game.play(player1.id, [sleep, soup])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  game.play(player1.id, [sleep, grab])
  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  whisperCallback.reset()

  t.is(player1.hp, 2)
  t.is(player1.hand.length, player1.maxHand + 4)
  t.is(game.discardPile.length, 0)
})

Ava.test('Sleep should warn when a player plays it wrong with Grab', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1] = game.players
  const grab = Deck.getCard('grab')
  const sleep = Deck.getCard('sleep')
  const avalanche = Deck.getCard('avalanche')
  player1.hp = 2
  player1.hand.push(grab)
  player1.hand.push(sleep)
  player1.hand.push(avalanche)
  game.play(player1.id, [grab, sleep, avalanche])

  t.true(whisperCallback.calledWith(player1.id, 'card:sleep:invalid-contact'))
  t.is(game.turns, 0)
  t.is(player1.hp, 2)
  t.is(player1.hand.length, player1.maxHand + 3)
  t.is(game.discardPile.length, 0)
})

Ava.test('Sleep should not heal a player above their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  const sleep = Deck.getCard('sleep')
  const gutPunch = Deck.getCard('gut-punch')
  player1.hp = player1.maxHp + 5
  player1.hand.push(sleep)
  player1.hand.push(gutPunch)
  game.play(player1.id, [sleep, gutPunch])

  t.true(announceCallback.calledWith('card:sleep:contact'))
  t.is(game.turns, 1)
  t.is(player1.hp, player1.maxHp + 5)
  t.is(player2.hp, player2.maxHp)
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, sleep))
  t.truthy(find(game.discardPile, gutPunch))
})

Ava.test('Soup should heal a player and discard', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const soup = Deck.getCard('soup')
  player1.hand.push(soup)
  player1.hp = 3
  player2.hand.push(soup)

  game.play(player1.id, [soup])
  game.play(player2.id, [soup])

  t.true(announceCallback.calledWith('card:soup:contact'))
  t.is(player1.hp, 4)
  t.is(player2.hp, player2.maxHp, 'They should still have their max HP.')
  t.is(player2.hand.length, player2.maxHand)
  t.is(game.discardPile.length, 2)
  t.truthy(find(game.discardPile, soup))
})

Ava.test('Soup should not heal a player above their max HP', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  const soup = Deck.getCard('soup')
  player1.hand.push(soup)
  player1.hp = player1.maxHp + 5

  game.play(player1.id, soup)
  t.true(announceCallback.calledWith('card:soup:contact'))
  t.is(player1.hp, player1.maxHp + 5, 'They should retain their surplus HP.')
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, soup))
})

Ava.test('Spare Bolts should give a player an extra turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const spareBolts = Deck.getCard('spare-bolts')
  player.hand.push(spareBolts)

  game.play(player.id, spareBolts)
  game.incrementTurn()

  t.true(announceCallback.calledWith('card:spare-bolts:disaster'))
  t.is(game.players[0], player)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, spareBolts))
})

Ava.test('Spare bolts should discard if the play is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [, player] = game.players
  const spareBolts = Deck.getCard('spare-bolts')
  player.hand.push(spareBolts)
  game.play(player.id, spareBolts)
  game.removePlayer(player.id)

  t.is(game.discardPile.length, player.maxHand + 1)
  t.truthy(find(game.discardPile, spareBolts))
})

Ava.test('Sub should heal a player and discard', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('neck-punch'))
  player2.hand.push(Deck.getCard('sub'))

  game.play(player1.id, [Deck.getCard('neck-punch')])
  game.pass(player2.id)
  game.play(player2.id, [Deck.getCard('sub')])

  t.true(announceCallback.calledWith('card:sub:contact'))
  t.is(player2.hp, player2.maxHp - 1)
  t.is(player2.hand.length, player2.maxHand)
  t.truthy(find(game.discardPile, Deck.getCard('sub')))
  t.is(game.discardPile.length, 2)
})

Ava.test('Sub should not heal a player above max health', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const sub = Deck.getCard('sub')
  player1.hand.push(sub)
  player2.hand.push(sub)
  player2.hp = player2.maxHp + 5

  game.play(player1, sub)
  t.true(announceCallback.calledWith('card:sub:contact'))
  t.is(player1.hp, player1.maxHp, 'They should still have max health.')
  announceCallback.reset()

  game.play(player2, sub)
  t.true(announceCallback.calledWith('card:sub:contact'))
  t.is(player2.hp, player2.maxHp + 5, 'They should retain their surplus health.')
})

Ava.test('Surgery should restore a player to max health', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const surgery = Deck.getCard('surgery')
  player.hand.push(surgery)
  player.hp = 1
  game.play(player, surgery)

  t.is(player.hp, player.maxHp)
  t.true(announceCallback.calledWith('card:surgery:contact'))
  t.is(player.hand.length, player.maxHand)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
})

Ava.test('Surgery should still work when grabbing', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const grab = Deck.getCard('grab')
  const surgery = Deck.getCard('surgery')
  player1.hand.push(grab)
  player1.hand.push(surgery)
  player1.hp = 1
  game.play(player1, [grab, surgery])
  game.pass(player2)

  t.is(player1.hp, player1.maxHp)
  t.true(announceCallback.calledWith('card:surgery:contact'))
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 2)
})

Ava.test('Surgery should not be playable if the player has >1 hp', (t) => {
  const announceCallback = Sinon.spy()
  const whisperCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const surgery = Deck.getCard('surgery')
  const grab = Deck.getCard('grab')
  player.hand.push(surgery)
  player.hand.push(grab)

  game.play(player, surgery)
  t.true(whisperCallback.calledWith(player.id, 'card:surgery:invalid-contact'))
  whisperCallback.reset()

  game.play(player, [grab, surgery])
  t.true(whisperCallback.calledWith(player.id, 'card:surgery:invalid-contact'))
  whisperCallback.reset()

  t.is(player.hand.length, player.maxHand + 2)
  t.is(game.discardPile.length, 0)
})

Ava.test('THE BEES should be playable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('the-bees'))

  game.play(player1.id, [Deck.getCard('the-bees')])

  t.true(announceCallback.calledWith('card:the-bees:play'))
  t.true(player1.beforeTurn.length + player2.beforeTurn.length === 1)
})

Ava.test('THE BEES should sting a player each turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('the-bees'))

  game.play(player1.id, [Deck.getCard('the-bees')])
  game.incrementTurn()
  game.incrementTurn()

  t.true(announceCallback.calledWith('card:the-bees:before-turn'))
  t.true(player1.hp + player2.hp === player1.maxHp + player2.maxHp - 1)
})

Ava.test('THE BEES should sting a player to death', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  const [player1, player2] = game.players
  player1.hp = 2
  player2.hp = 2

  game.start()
  game.players[0].hand.push(Deck.getCard('the-bees'))
  game.play(game.players[0].id, [Deck.getCard('the-bees')])
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()

  t.true(announceCallback.calledWith('player:died'))
  t.is(game.players.length, 1)
  t.truthy(game.stopped)
  t.truthy(
    find(game.discardPile, Deck.getCard('the-bees')),
    'it should be cycled back into the game when the player dies'
  )
  t.is(game.discardPile.length, player2.maxHand + 1)
})

Ava.test('THE BEES should go away when a player heals', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  let [player1, player2] = game.players
  const gutPunch = Deck.getCard('gut-punch')
  const sub = Deck.getCard('sub')
  const theBees = Deck.getCard('the-bees')
  player1.hand.push(theBees)
  game.play(player1, theBees)

  if (player1.conditionCards.length) {
    game.incrementTurn();
    [player1, player2] = game.players
  }

  player1.hand.push(gutPunch)
  game.play(player1, gutPunch)
  game.pass(player2)
  t.false(announceCallback.calledWith('card:the-bees:healed'))

  player2.hand.push(sub)
  game.play(player2, sub)
  t.true(announceCallback.calledWith('card:the-bees:healed'))
  t.is(player1.conditionCards.length, 0)
})

Ava.test('Tire should cause a player to miss a turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tire = Deck.getCard('tire')

  game.play(player1.id, tire)
  t.is(game.turns, 2)
  t.is(game.discardPile.length, 1)
  t.is(player1.hand.length, player1.maxHand)
  t.true(announceCallback.calledWith('card:tire:contact'))
  t.is(player2.conditionCards.length, 0)
  t.truthy(find(game.discardPile, tire))
})

Ava.test('Tire should discard if the affected player is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, , player3] = game.players
  const tire = Deck.getCard('tire')
  player1.hand.push(tire)

  game.play(player1.id, tire, player3.id)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 0)
  t.is(player1.hand.length, player1.maxHand)

  game.removePlayer(player3.id)
  t.is(game.discardPile.length, player3.maxHand + 1)
  t.truthy(find(game.discardPile, tire))
})

Ava.test('Tire Iron should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const tireIron = Deck.getCard('tire-iron')
  player1.hand.push(tireIron)

  game.play(player1.id, [tireIron])
  t.is(player2.hp, player2.maxHp - 3)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, tireIron))
  t.is(player1.hand.length, player1.maxHand)
})

Ava.test('Toolbox should deal a player up to 8 cards', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player] = game.players
  const toolbox = Deck.getCard('toolbox')
  player.hand.push(toolbox)

  game.play(player, toolbox)
  t.true(announceCallback.calledWith('card:toolbox:disaster'))
  t.is(player.hand.length, 8)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, toolbox))
})

Ava.test('Uppercut should hurt a player pretty good', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const uppercut = Deck.getCard('uppercut')
  player1.hand.push(uppercut)

  game.play(player1.id, uppercut)
  t.true(announceCallback.calledWith('player:played'))
  t.is(game.turns, 0)
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:uppercut:contact'))
  t.is(player2.hp, player2.maxHp - 5)
  t.is(game.turns, 1)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, uppercut))
})

Ava.test('Whirlwind should swap everybody\'s hands', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2, player3] = game.players
  const grab = Deck.getCard('grab')
  const gutPunch = Deck.getCard('gut-punch')
  const neckPunch = Deck.getCard('neck-punch')
  const whirlwind = Deck.getCard('whirlwind')

  player1.hand = [grab, grab]
  player2.hand = [gutPunch, gutPunch, whirlwind]
  player3.hand = [neckPunch, neckPunch]
  game.play(player2, whirlwind)

  t.true(announceCallback.calledWith('card:whirlwind:disaster'))
  t.deepEqual(player1.hand, [neckPunch, neckPunch])
  t.deepEqual(player2.hand, [grab, grab])
  t.deepEqual(player3.hand, [gutPunch, gutPunch])
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, whirlwind))
})

Ava.test('Whirlwind should consider empty hands', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2, player3] = game.players
  const grab = Deck.getCard('grab')
  const neckPunch = Deck.getCard('neck-punch')
  const whirlwind = Deck.getCard('whirlwind')

  player1.hand = [grab, grab]
  player2.hand = [whirlwind]
  player3.hand = [neckPunch, neckPunch]
  game.play(player2, whirlwind)

  t.true(announceCallback.calledWith('card:whirlwind:disaster'))
  t.deepEqual(player1.hand, [neckPunch, neckPunch])
  t.deepEqual(player2.hand, [grab, grab])
  t.deepEqual(player3.hand, [])
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, whirlwind))
})

Ava.test('Wrench should cause a player to miss 2 turns', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const wrench = Deck.getCard('wrench')
  player1.hand.push(wrench)

  game.play(player1, wrench)
  t.true(announceCallback.calledWith('player:played'))

  game.pass(player2)
  t.true(announceCallback.calledWith('card:wrench:contact'))
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 0)
  t.is(game.turns, 2)

  game.incrementTurn()
  t.is(game.turns, 4)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, wrench))
})

Ava.test('Wrench should discard if the affected player is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const wrench = Deck.getCard('wrench')
  player1.hand.push(wrench)

  game.play(player1, wrench)
  game.pass(player2)
  game.removePlayer(player2)

  t.is(game.discardPile.length, player2.maxHand + 1)
  t.truthy(find(game.discardPile, wrench))
})
