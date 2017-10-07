const { printCards } = require('./language')
const Player = require('./player')
const {
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
      game.discard.push(cards[0])
      player.discard = []
      target.hp -= 2
      game.announce('card:a-gun:contact', {
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
    id: 'acid-coffee',
    type: 'attack',
    copies: 2,
    filter: () => [],
    beforeTurn: (player, game) => {
      const acidCoffee = getCard('acid-coffee')
      const discardFn = () => {
        // Now we can discard the card
        game.discard.push(acidCoffee)
        removeOnce(player.beforeTurn, () => discardFn)
        return true
      }
      player.beforeTurn.push(discardFn)
      removeOnce(player.beforeTurn, () => acidCoffee.beforeTurn)
      return true
    },
    contact: (player, target, cards, game) => {
      // Card isn't put in the discard until the missed turn is expended
      player.discard = []
      target.hp -= 3
      target.missTurns += 1
      target.beforeTurn.push(cards[0].beforeTurn)
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
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'avalanche',
    type: 'disaster',
    copies: 1,
    filter: () => [],
    contact: (player, target, cards, game) => {
      game.discard.push(cards[0])
      target.hp -= 6
      game.announce('card:avalanche:play', {
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
    id: 'block',
    type: 'counter',
    copies: 5,
    filter: () => [],
    counter: (player, attacker, cards, game) => {
      // One special situation with being grabbed is if the
      // opponent has a hidden unstoppable card, blocks and
      // grabs will be wasted.
      if (attacker.discard[0].id === 'grab' && attacker.discard[1].type === 'unstoppable') {
        // Discard whatever he played and treat it as if he passed
        game.discard = game.discard.concat(cards)
        player.discard = []
        game.announce('player:counter-failed', {
          cards: printCards(cards, game.language),
          player
        })
        game.pass(player.id)
        return
      }
      game.announce('card:block:counter', {
        attacker,
        cards: printCards(attacker.discard, game.language),
        player
      })
      game.incrementTurn()
    }
  },
  {
    id: 'bulldozer',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'cheap-shot',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'crane',
    type: 'unstoppable',
    copies: 1,
    contact: (player, target, cards, game) => {
      game.discard.push(cards[0])
      player.discard = []
      const [, ...tail] = cards
      target.hand = target.hand.concat(tail)
      game.announce('card:crane:contact', {
        cards: printCards(tail, game.language),
        player,
        target
      })
      game.deal(player)
      game.whisperStats(target.id)
      game.whisperStats(player.id)
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
    beforeContact: (player, target, cards, game) => {
      const deflector = getCard('deflector')
      // Relinquish the card once its ability is used up
      removeOnce(target.beforeContact, () => deflector.beforeContact)
      game.discard.push(deflector)
      game.announce('card:deflector:deflect', {
        player,
        target,
        cards: printCards(cards[0], game.language)
      })
      const victim = sample(
        game.players.filter(plyr => plyr !== target)
      )
      game.contact(player, victim, cards, game)
      // Returning false means the contactee won't be contacted
      return false
    },
    disaster: (player, cards, game) => {
      player.beforeContact.push(cards[0].beforeContact)
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
      player.discard = []
      if (game.getNextPlayer(player.id) === attacker) {
        game.announce('card:dodge:nullify', {
          attacker,
          cards: printCards(attacker.discard, game.language),
          player
        })
        game.incrementTurn()
        return
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
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'energy-drink',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'gamblin-man',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'gas-spill',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'grab',
    type: 'counter',
    copies: 8,
    filter: (cards) => {
      const [head, ...tail] = cards
      if (head) {
        if (head.type === 'attack' || head.type === 'unstoppable') {
          if (head.filter) {
            return [head].concat(head.filter(tail))
          }
          return cards
        }
      }
      return []
    },
    contact: (player, target, cards, game) => {
      game.discard.push(player.discard[0])
      removeOnce(player.discard, player.discard[0])
      cards[0].contact(player, target, player.discard, game)
    },
    validateCounter: (player, attacker, cards, game) => {
      return cards[0].validatePlay(player, attacker, cards, game)
    },
    counter: (player, attacker, cards, game) => {
      // One special situation with being grabbed is if the
      // opponent has a hidden unstoppable card, blocks and
      // grabs will be wasted.
      if (attacker.discard[0].id === 'grab' && attacker.discard[1].type === 'unstoppable') {
        // Discard whatever he played and treat it as if he passed
        game.discard = game.discard.concat(cards)
        player.discard = []
        game.announce('player:counter-failed', {
          cards: printCards(cards, game.language),
          player
        })
        game.pass(player.id)
        return
      }
      game.contact(attacker, player, attacker.discard, game)
      player.discard = cards
      game.announce('card:grab:counter', { attacker, player })
    },
    validatePlay: (player, target, cards, game) => {
      if (cards.length < 2) {
        game.whisper(player, 'card:grab:invalid-card')
        return false
      }
      return true
    },
    play: (player, target, cards, game) => {
      if (target.discard[0]) {
        target.discard[0].contact(target, player, target.discard, game)
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
      const discardFn = () => {
        // Now we can discard the card
        game.discard.push(greaseBucket)
        removeOnce(player.beforeTurn, () => discardFn)
        return true
      }
      player.beforeTurn.push(discardFn)
      removeOnce(player.beforeTurn, () => greaseBucket.beforeTurn)
      return true
    },
    contact: (player, target, cards, game) => {
      // Card isn't put in the discard until the missed turn is expended
      player.discard = []
      target.hp -= 2
      target.missTurns += 1
      target.beforeTurn.push(cards[0].beforeTurn)
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
      game.discard.push(player.discard[0])
      player.discard = []
      target.hp -= 2
      game.announce('card:gut-punch:contact', {
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
      player.discard = []
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
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'meal-steal',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'mirror',
    type: 'attack',
    copies: 0,
    filter: () => []
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
    id: 'propeller',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'reverse',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'sleep',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'siphon',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'soup',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'spare-bolts',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'sub',
    type: 'support',
    copies: 7,
    filter: () => [],
    contact: (player, target, cards, game) => {
      player.hp = Math.min(player.hp + 2, player.maxHp)
      game.announce('card:sub:contact', { player })
    }
  },
  {
    id: 'surgery',
    type: 'attack',
    copies: 0,
    filter: () => []
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
      game.announce('card:the-bees:play', {
        player,
        target
      })
    }
  },
  {
    id: 'tire',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'tire-iron',
    type: 'attack',
    copies: 0,
    filter: () => []
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
    copies: 0,
    filter: () => []
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
    copies: 0,
    filter: () => []
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
