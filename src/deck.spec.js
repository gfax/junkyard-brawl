const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('./deck')
const Junkyard = require('./junkyard')
const Player = require('./player')
const { find } = require('./util')

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

Ava.test('parseCards() should throw an error when passed an empty array', (t) => {
  t.throws(() => Deck.parseCards(new Player('user1', 'Jay'), []))
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
  t.truthy(find(game.discard, { id: 'gut-punch' }))
  t.is(game.discard.length, 1)
})

Ava.test('Grab should be playable', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('user1', 'Jay', announceCallback)
  game.addPlayer('user2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand = player1.hand.concat([
    Deck.getCard('grab'),
    Deck.getCard('gut-punch')
  ])
  player2.hand = player2.hand.concat([
    Deck.getCard('grab'),
    Deck.getCard('a-gun')
  ])

  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  game.pass(player2.id)

  t.true(announceCallback.calledWith('card:grab:play'))
  t.true(announceCallback.calledWith('card:gut-punch:contact'))

  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('a-gun')])
  game.pass(player1.id)

  t.true(announceCallback.calledWith('card:grab:play'))
  t.true(announceCallback.calledWith('card:a-gun:contact'))

  t.truthy(find(game.discard, { id: 'grab' }))
  t.is(game.discard.length, 4)
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
  whisperCallback.reset()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('grab'))
  player2.hand.push(Deck.getCard('grab'))

  game.play(player1.id, [Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('grab')])
  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('grab')])

  t.false(announceCallback.calledWith('card:grab:play'))
  t.true(whisperCallback.called)
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
  t.is(game.discard.length, 6)
})

Ava.test('A Gun should be playable', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('a-gun'))

  game.play(player1.id, [Deck.getCard('a-gun')])
  t.is(player2.hp, player2.maxHp - 2)
  t.is(game.turns, 1)
  t.truthy(find(game.discard, { id: 'a-gun' }))
  t.is(game.discard.length, 1)
})

Ava.test('A Gun should be able to kill a player', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('a-gun'))
  player2.hp = 2

  game.play(player1.id, [Deck.getCard('a-gun')])
  t.is(game.players.length, 1)
})

Ava.test('A Gun should thwart counters', (t) => {
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
    Deck.getCard('grab'),
    Deck.getCard('gut-punch')
  ])

  game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('a-gun')])
  game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
  t.true(announceCallback.calledWith('player:counter-failed'))
  t.is(player2.hp, 8)
  t.is(game.turns, 1)
  t.is(game.players[0], player2)
})

Ava.test('Avalanche should attack a random player', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()

  const [, player] = game.players
  player.hand.push(Deck.getCard('avalanche'))
  game.play(player.id, Deck.getCard('avalanche'))

  t.is(
    game.players.reduce((acc, plyr) => acc + plyr.hp, 0),
    game.players.reduce((acc, plyr) => acc + plyr.maxHp, 0) - 6
  )
  t.truthy(find(game.discard, { id: 'avalanche' }))
  t.is(game.discard.length, 1)
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
  t.is(game.discard.length, 2)
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
  t.is(game.discard.length, 3)
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
  t.is(game.discard.length, 0, 'card should be with the player, not discarded yet')
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
  t.truthy(find(game.discard, deflector))
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

Ava.test('Dodge should counter and nullify attacks', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()

  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('gut-punch'))
  player2.hand.push(Deck.getCard('dodge'))

  game.play(player1.id, [Deck.getCard('gut-punch')])
  game.play(player2.id, [Deck.getCard('dodge')])

  t.true(announceCallback.calledWith('card:dodge:nullify'))
  t.is(game.turns, 1)
  t.is(game.discard.length, 2)
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
  t.is(game.discard.length, 1)
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
  t.is(game.discard.length, 0)
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
  t.truthy(find(game.discard, { id: 'insurance' }))
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

Ava.test('Sub should heal a player', (t) => {
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
  t.true(player2.hp === 9)
})

Ava.test('Sub should not heal a player above max health', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1] = game.players
  player1.hand.push(Deck.getCard('sub'))

  game.play(player1.id, [Deck.getCard('sub')])

  t.true(announceCallback.calledWith('card:sub:contact'))
  t.true(player1.hp === player1.maxHp)
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
})

Ava.test('THE BEES should go away when a player heals', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('the-bees'))
  player1.hand.push(Deck.getCard('sub'))
  player2.hand.push(Deck.getCard('sub'))

  game.play(player1.id, [Deck.getCard('the-bees')])
  game.play(player1.id, [Deck.getCard('sub')])
  game.play(player2.id, [Deck.getCard('sub')])
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()
  game.incrementTurn()

  t.true(announceCallback.calledWith('card:the-bees:healed'))
  t.true(player1.hp > 8)
  t.true(player2.hp > 8)
})
