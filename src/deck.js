const { printCards } = require('./language')
const Player = require('./player')
const {
  clone,
  find,
  flow,
  removeOnce,
  sample,
  shuffle,
  times,
  uniq
} = require('./util')

module.exports = {
  generate,
  getCard,
  parseCards
}

const deck = [
  {
    id: 'a-gun',
    type: 'unstoppable',
    copies: 1,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 2
      game.announce('card:a-gun:contact', {
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.contact(player, target, cards)
      game.incrementTurn()
    }
  },
  {
    id: 'acid-coffee',
    type: 'attack',
    copies: 2,
    filter: () => [],
    beforeTurn: (player, game) => {
      const acidCoffee = getCard('acid-coffee')
      game.discard.push(acidCoffee)
      removeOnce(player.conditionCards, acidCoffee)
      removeOnce(player.beforeTurn, () => acidCoffee.beforeTurn)
      return true
    },
    contact: (player, target, cards, game) => {
      target.hp -= 3
      target.missTurns += 1
      target.beforeTurn.push(cards[0].beforeTurn)
      // Card isn't put in the discard until the missed turn is expended
      target.conditionCards.push(cards[0])
      game.announce('card:acid-coffee:contact', {
        player,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  },
  {
    id: 'armor',
    type: 'support',
    copies: 1,
    filter: () => [],
    contact: (player, target, cards, game) => {
      player.hp += 5
      game.announce('card:armor:contact', { player })
      return cards
    }
  },
  {
    id: 'avalanche',
    type: 'disaster',
    copies: 1,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 6
      game.announce('card:avalanche:contact', {
        player,
        target
      })
      return cards
    },
    disaster: (player, cards, game) => {
      const target = sample(game.players)
      game.contact(player, target, cards)
    }
  },
  {
    id: 'block',
    type: 'counter',
    copies: 5,
    filter: () => [],
    counter: (player, attacker, cards, game) => {
      // One special situation with being grabbed is if the
      // opponent has a hidden unstoppable card, blocks and
      // grabs will be wasted.
      if (attacker.discard[0].id === 'grab' && attacker.discard[1].type === 'unstoppable') {
        player.discard = []
        game.announce('player:counter-failed', {
          cards: printCards(cards, game.language),
          player
        })
        // Treat it as if he passed
        game.pass(player.id)
        // But still return the failed counter to be discarded
        return cards
      }
      attacker.discard.forEach(card => game.discard.push(card))
      game.announce('card:block:counter', {
        attacker,
        cards: printCards(attacker.discard, game.language),
        player
      })
      game.incrementTurn()
      return cards
    }
  },
  {
    id: 'bulldozer',
    type: 'unstoppable',
    copies: 1,
    filter: () => [],
    contact: (player, target, cards, game) => {
      game.discard = game.discard.concat(target.hand)
      target.hand = []
      game.announce('card:bulldozer:contact', {
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.contact(player, target, cards)
      game.incrementTurn()
    }
  },
  {
    id: 'cheap-shot',
    type: 'unstoppable',
    copies: 2,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 1
      game.announce('card:cheap-shot:contact', {
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.contact(player, target, cards)
      game.incrementTurn()
    }
  },
  {
    id: 'crane',
    type: 'unstoppable',
    copies: 1,
    contact: (player, target, cards, game) => {
      const [head, ...tail] = cards
      target.hand = target.hand.concat(tail)
      game.announce('card:crane:contact', {
        cards: printCards(tail, game.language),
        player,
        target
      })
      game.deal(player, tail.length)
      game.whisperStats(target.id)
      game.whisperStats(player.id)
      return [head]
    },
    play: (player, target, cards, game) => {
      game.contact(player, target, cards)
      game.incrementTurn()
    }
  },
  {
    id: 'deflector',
    type: 'disaster',
    copies: 1,
    filter: () => [],
    beforeContact: (player, target, cards, game, discarding) => {
      const deflector = getCard('deflector')
      // Relinquish the card once its ability is used up
      removeOnce(target.beforeContact, () => deflector.beforeContact)
      removeOnce(target.conditionCards, () => deflector)
      game.discard.push(deflector)
      game.announce('card:deflector:deflect', {
        player,
        target,
        cards: printCards(cards[0], game.language)
      })
      // Deflect it to anybody other than the originally intended target
      const victim = sample(
        game.players.filter(plyr => plyr !== target)
      )
      game.contact(player, victim, cards, discarding)
      // Returning false means the contactee won't be contacted
      return false
    },
    disaster: (player, cards, game) => {
      player.beforeContact.push(cards[0].beforeContact)
      player.conditionCards.push(cards[0])
      game.announce('card:deflector:play', { player })
    }
  },
  {
    id: 'dodge',
    type: 'counter',
    copies: 6,
    filter: () => [],
    validateCounter: (player, attacker, cards, game) => {
      // Can't dodge an attack when you've already been grabbed
      if (attacker.discard[0].id === 'grab') {
        game.whisper(player, 'card:dodge:invalid')
        return false
      }
      return true
    },
    counter: (player, attacker, cards, game) => {
      game.discard.push(cards[0])
      // Empty the discard since this player may not
      // be a target by the time the turn increments
      player.discard = []
      if (game.getNextPlayer(player.id) === attacker) {
        game.announce('card:dodge:nullify', {
          attacker,
          cards: printCards(attacker.discard, game.language),
          player
        })
        game.incrementTurn()
        return cards
      }
      game.target = game.getNextPlayer(player.id)
      game.announce('card:dodge:new-target', {
        attacker,
        cards: printCards(attacker.discard[0], game.language),
        player,
        target: game.target
      })
    }
  },
  {
    id: 'earthquake',
    type: 'disaster',
    copies: 1,
    filter: () => [],
    disaster: (player, cards, game) => {
      game.announce('card:earthquake:disaster', { player })
      game.players.forEach(plyr => (plyr.hp -= 1))
      game.announceStats()
      game.players.forEach(plyr => game.maybeRemove(plyr))
      return cards
    }
  },
  {
    id: 'energy-drink',
    type: 'support',
    copies: 1,
    filter: () => [],
    beforeTurn: (player, game) => {
      const energyDrink = getCard('energy-drink')
      const discardFn = () => {
        game.discard.push(energyDrink)
        removeOnce(player.conditionCards, energyDrink)
        removeOnce(player.beforeTurn, () => discardFn)
        player.hp = Math.min(player.hp + 1, player.maxHp)
        game.announce('card:energy-drink:before-turn', { player })
        game.announce('player:discard', {
          cards: printCards(energyDrink, game.language),
          player
        })
        return true
      }
      player.hp = Math.min(player.hp + 1, player.maxHp)
      player.beforeTurn.push(discardFn)
      removeOnce(player.beforeTurn, () => energyDrink.beforeTurn)
      game.announce('card:energy-drink:before-turn', { player })
      return true
    },
    contact: (player, target, cards, game) => {
      target.hp = Math.min(player.hp + 1, player.maxHp)
      target.beforeTurn.push(cards[0].beforeTurn)
      target.conditionCards.push(cards[0])
      game.announce('card:energy-drink:contact', { player: target })
    }
  },
  {
    id: 'gamblin-man',
    type: 'attack',
    copies: 2,
    filter: () => [],
    contact: (player, target, cards, game) => {
      const damage = Math.floor((Math.random() * 6) + 1)
      target.hp -= damage
      game.announce('card:gamblin-man:contact', {
        damage,
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  },
  {
    id: 'gas-spill',
    type: 'disaster',
    copies: 1,
    filter: () => [],
    beforeTurn: (player, game) => {
      const gasSpill = getCard('gas-spill')
      const discardFn = () => {
        // Now we can discard the card
        game.discard.push(gasSpill)
        removeOnce(player.conditionCards, gasSpill)
        removeOnce(player.beforeTurn, () => discardFn)
        game.announce('player:discard', {
          cards: printCards(gasSpill, game.language),
          player
        })
        return true
      }
      player.beforeTurn.push(discardFn)
      removeOnce(player.beforeTurn, () => gasSpill.beforeTurn)
      return true
    },
    contact: (player, target, cards, game) => {
      target.missTurns += 2
      target.beforeTurn.push(cards[0].beforeTurn)
      target.conditionCards.push(cards[0])
      game.announce('card:gas-spill:contact', {
        player,
        target
      })
    },
    disaster: (player, cards, game) => {
      const target = sample(game.players)
      game.contact(player, target, cards)
    }
  },
  {
    id: 'grab',
    type: 'counter',
    copies: 8,
    filter: (cards) => {
      const [head, ...tail] = cards
      if (head) {
        if (head.type === 'attack' || head.type === 'support' || head.type === 'unstoppable') {
          if (head.filter) {
            return [head].concat(head.filter(tail))
          }
          return cards
        }
      }
      return []
    },
    contact: (player, target, cards, game) => {
      const [, ...tail] = cards
      player.discard = []
      game.contact(player, target, tail)
      return [cards[0]]
    },
    validateCounter: (player, attacker, cards, game) => {
      return cards[0].validatePlay(player, attacker, cards, game)
    },
    counter: (player, attacker, cards, game) => {
      game.contact(attacker, player, attacker.discard)
      player.discard = cards
      game.announce('card:grab:counter', { attacker, player })
    },
    validatePlay: (player, target, cards, game) => {
      if (cards.length < 2) {
        game.whisper(player, 'card:grab:invalid-card')
        return false
      }
      if (cards[1].validateContact) {
        const [, ...tail] = cards
        if (!cards[1].validateContact(target, player, tail, game)) {
          return false
        }
      }
      return true
    },
    play: (player, target, cards, game) => {
      if (target.discard[0]) {
        game.contact(target, player, target.discard)
      }
      game.announce('card:grab:play', { player, target })
    }
  },
  {
    id: 'grease-bucket',
    type: 'attack',
    copies: 3,
    filter: () => [],
    beforeTurn: (player, game) => {
      const greaseBucket = getCard('grease-bucket')
      game.discard.push(greaseBucket)
      removeOnce(player.conditionCards, greaseBucket)
      removeOnce(player.beforeTurn, () => greaseBucket.beforeTurn)
      return true
    },
    contact: (player, target, cards, game) => {
      target.hp -= 2
      target.missTurns += 1
      target.beforeTurn.push(cards[0].beforeTurn)
      // Card isn't put in the discard until the missed turn is expended
      target.conditionCards.push(cards[0])
      game.announce('card:grease-bucket:contact', {
        player,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  },
  {
    id: 'guard-dog',
    type: 'attack',
    copies: 1,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 4
      game.announce('card:guard-dog:contact', {
        player,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  },
  {
    id: 'gut-punch',
    type: 'attack',
    copies: 10,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 2
      game.announce('card:gut-punch:contact', {
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  },
  {
    id: 'insurance',
    type: 'counter',
    copies: 2,
    filter: () => [],
    counter: (player, attacker, cards, game) => {
      game.announce('card:insurance:counter', {
        player
      })
      attacker.discard[0].contact(attacker, player, attacker.discard, game)
      game.discard.push(cards[0])
      if (player.hp < 1) {
        player.hp = Math.floor(player.maxHp / 2)
        game.announce('card:insurance:success', { player })
      }
      game.incrementTurn()
    }
  },
  {
    id: 'its-getting-windy',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'magnet',
    type: 'unstoppable',
    copies: 1,
    contact: (player, target, cards, game) => {
      game.discard = game.discard.concat(cards)
      const numberToSteal = Math.min(cards.length, target.hand.length)
      const stolenCards = shuffle(target.hand).slice(0, numberToSteal)
      stolenCards.forEach((card) => {
        removeOnce(target.hand, card)
        player.hand.push(card)
      })
      game.announce('card:magnet:contact', {
        player,
        number: numberToSteal,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.contact(player, target, cards)
      game.incrementTurn()
    }
  },
  {
    id: 'mattress',
    type: 'counter',
    copies: 3,
    filter: () => [],
    counter: (player, attacker, cards, game) => {
      const healthBeforeAttack = clone(player.hp)
      const afterContactFn = (_attacker, target, _cards, _game) => {
        if (healthBeforeAttack > target.hp) {
          target.hp = Math.min(healthBeforeAttack, target.hp + 2)
        }
        removeOnce(target.afterContact, () => afterContactFn)
      }
      player.afterContact.push(afterContactFn)
      game.announce('card:mattress:counter', { player })
      game.contact(attacker, player, attacker.discard)
      game.incrementTurn()
      return cards
    }
  },
  {
    id: 'meal-steal',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'mirror',
    type: 'counter',
    copies: 2,
    filter: () => [],
    counter: (player, attacker, cards, game) => {
      const [head, ...tail] = clone(attacker.discard)
      const mirroredCards = head.id === 'grab' ? tail : [head, ...tail]
      game.contact(attacker, player, attacker.discard, true)
      game.announce('card:mirror:counter', {
        attacker,
        cards: printCards(mirroredCards, game.language),
        player
      })
      game.contact(player, attacker, mirroredCards, false)
      game.incrementTurn()
      return cards
    }
  },
  {
    id: 'neck-punch',
    type: 'attack',
    copies: 10,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 3
      game.announce('card:neck-punch:contact', {
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  },
  {
    id: 'reverse',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'sleep',
    type: 'support',
    copies: 1,
    filter: (cards) => {
      if (cards[0]) {
        if (cards[0].type === 'attack' || cards[0].type === 'unstoppable') {
          return [cards[0]]
        }
      }
      return []
    },
    validateContact: (player, target, cards, game) => {
      if (cards[1]) {
        return true
      }
      game.whisper(target, 'card:sleep:invalid-contact')
      return false
    },
    contact: (player, target, cards, game) => {
      // This is a funny one... in order to determine how many
      // points to give the player, we simulate playing the
      // card to see how much damage it would deal.
      const Junkyard = require('./junkyard')
      const brawl = new Junkyard('1', '')
      brawl.addPlayer('2', '')
      brawl.start()
      const [p1, p2] = brawl.players
      p1.hand.push(cards[1])
      brawl.play(p1, cards[1])
      if (cards[1].type === 'attack') {
        brawl.pass(p2)
      }
      const healthDiff = p2.maxHp - p2.hp
      player.hp = Math.min(player.hp + healthDiff, player.maxHp)
      game.announce('card:sleep:contact', {
        number: healthDiff,
        player
      })
      return cards
    }
  },
  {
    id: 'siphon',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'soup',
    type: 'support',
    copies: 3,
    filter: () => [],
    contact: (player, target, cards, game) => {
      player.hp = Math.min(player.hp + 1, player.maxHp)
      game.announce('card:soup:contact', { player })
      return cards
    }
  },
  {
    id: 'spare-bolts',
    type: 'disaster',
    copies: 1,
    filter: () => [],
    beforeTurn: (player, game) => {
      const spareBolts = getCard('spare-bolts')
      game.discard.push(spareBolts)
      removeOnce(player.beforeTurn, () => spareBolts.beforeTurn)
      removeOnce(player.conditionCards, spareBolts)
    },
    disaster: (player, cards, game) => {
      player.extraTurns += 1
      player.beforeTurn.push(cards[0].beforeTurn)
      player.conditionCards.push(cards[0])
      game.announce('card:spare-bolts:disaster', { player })
    }
  },
  {
    id: 'sub',
    type: 'support',
    copies: 7,
    filter: () => [],
    contact: (player, target, cards, game) => {
      player.hp = Math.min(player.hp + 2, player.maxHp)
      game.announce('card:sub:contact', { player })
      return cards
    }
  },
  {
    id: 'surgery',
    type: 'support',
    copies: 2,
    filter: () => [],
    validateContact: (player, target, cards, game) => {
      if (target.hp === 1) {
        return true
      }
      game.whisper(target, 'card:surgery:invalid-contact')
      return false
    },
    contact: (player, target, cards, game) => {
      player.hp = player.maxHp
      game.announce('card:surgery:contact', { player })
      return cards
    }
  },
  {
    id: 'the-bees',
    type: 'disaster',
    copies: 1,
    filter: () => [],
    afterContact: (player, target, cards, game) => {
      const theBees = getCard('the-bees')
      if (cards[0].type === 'support') {
        removeOnce(player.beforeTurn, () => theBees.beforeTurn)
        removeOnce(player.afterContact, () => theBees.afterContact)
        removeOnce(player.conditionCards, theBees)
        // Relinquish the card from the player
        game.discard.push(theBees)
        game.announce('card:the-bees:healed', { player })
      }
      return true
    },
    beforeTurn: (player, game) => {
      player.hp -= 1
      game.announce('card:the-bees:before-turn', { player })
      if (player.hp < 1) {
        return false
      }
      return true
    },
    disaster: (player, cards, game) => {
      const target = sample(game.players)
      target.beforeTurn.push(cards[0].beforeTurn)
      target.afterContact.push(cards[0].afterContact)
      target.conditionCards.push(cards[0])
      game.announce('card:the-bees:play', {
        player,
        target
      })
    }
  },
  {
    id: 'tire',
    type: 'unstoppable',
    copies: 2,
    filter: () => [],
    beforeTurn: (player, game) => {
      const tire = getCard('tire')
      game.discard.push(tire)
      removeOnce(player.conditionCards, tire)
      removeOnce(player.beforeTurn, () => tire.beforeTurn)
      return true
    },
    contact: (player, target, cards, game) => {
      target.missTurns += 1
      target.beforeTurn.push(cards[0].beforeTurn)
      target.conditionCards.push(cards[0])
      game.announce('card:tire:contact', {
        player,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.contact(player, target, cards)
      game.incrementTurn()
    }
  },
  {
    id: 'tire-iron',
    type: 'unstoppable',
    copies: 1,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 3
      game.announce('card:tire-iron:contact', {
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.contact(player, target, cards)
      game.incrementTurn()
    }
  },
  {
    id: 'toolbox',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'uppercut',
    type: 'attack',
    copies: 5,
    filter: () => [],
    contact: (player, target, cards, game) => {
      target.hp -= 5
      game.announce('card:uppercut:contact', {
        player,
        target
      })
      return cards
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  },
  {
    id: 'whirlwind',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'wrench',
    type: 'attack',
    copies: 2,
    filter: () => [],
    beforeTurn: (player, game) => {
      const wrench = getCard('wrench')
      const discardFn = () => {
        // Now we can discard the card
        game.discard.push(wrench)
        removeOnce(player.conditionCards, wrench)
        removeOnce(player.beforeTurn, () => discardFn)
        game.announce('player:discard', {
          cards: printCards(wrench, game.language),
          player
        })
        return true
      }
      player.beforeTurn.push(discardFn)
      removeOnce(player.beforeTurn, () => wrench.beforeTurn)
      return true
    },
    contact: (player, target, cards, game) => {
      target.missTurns += 2
      target.beforeTurn.push(cards[0].beforeTurn)
      target.conditionCards.push(cards[0])
      game.announce('card:wrench:contact', {
        player,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.announce('player:played', {
        cards: printCards(cards[0], game.language),
        player,
        target
      })
    }
  }
]

function generate() {
  return shuffle(deck.reduce((acc, card) => {
    times(card.copies, () => acc.push(card))
    return acc
  }, []))
}

function getCard(id) {
  const card = find(deck, { id })
  if (!card) {
    throw new Error(`Nonexistent card type requested: ${id}`)
  }
  return card
}

// Normalize requests into an array of card objects
function parseCards(player, request) {
  function checkObject(obj) {
    if (!obj.id || !obj.type) {
      throw new Error('Passed a non-card object.')
    }
  }
  // Apply any card-specific filters. For instance,
  // Gut Punch filters any card following itself
  // as it is a standalone attack.
  function filterCards(cards) {
    const [head, ...tail] = cards
    if (head && head.filter) {
      return [head].concat(head.filter(tail))
    }
    return cards
  }

  if ((player instanceof Player) === false) {
    throw new Error(`Expected first parameter to be a player, got ${player}`)
  }
  if (typeof request === 'undefined') {
    throw new Error('Cannot parse an undefined request!')
  }
  // Card object
  if (typeof request === 'object' && !Array.isArray(request)) {
    checkObject(request)
    return [request]
  }
  if (Array.isArray(request)) {
    if (!request.length) {
      throw new Error('Passed an empty array of cards.')
    }
    checkObject(request[0])
    // It's already an array of cards so just filter them now
    return filterCards(request)
  }
  if (!player.hand.length) {
    return []
  }
  return flow([
    req => req.split(' '),
    req => req.filter(elem => elem),
    uniq,
    req => req.map((word) => {
      const number = parseInt(word)
      // 1-index to 0-index
      return player.hand[number - 1]
    }),
    // Filter out undefined cards
    cards => cards.filter(card => card),
    // Apply any card-specific filters. For instance,
    // Gut Punch filters any card following itself
    // as it is a standalone attack.
    filterCards
  ])(request)
}
