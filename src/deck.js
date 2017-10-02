const _ = require('lodash')
const Language = require('./language')
const Player = require('./player')

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
      target.hp -= 2
      game.announce('card:a-gun:play', {
        player,
        target
      })
      game.incrementTurn()
    }
  },
  {
    id: 'acid-coffee',
    type: 'attack',
    copies: 0,
    filter: () => []
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
      const target = _.sample(game.players)
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
          cards: Language.printCards(cards, game.language),
          player
        })
        game.pass(player.id)
        return
      }
      game.announce('card:block:counter', {
        attacker,
        cards: Language.printCards(attacker.discard, game.language),
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
    type: 'attack',
    copies: 0
  },
  {
    id: 'deflector',
    type: 'attack',
    copies: 0,
    filter: () => []
  },
  {
    id: 'dodge',
    type: 'attack',
    copies: 0,
    filter: () => []
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
      _.remove(player.discard, player.discard[0])
      cards[0].contact(player, target, player.discard, game)
    },
    counter: (player, attacker, cards, game) => {
      if (cards.length < 2) {
        game.whisper(player, 'card:grab:invalid-card')
        return
      }
      // One special situation with being grabbed is if the
      // opponent has a hidden unstoppable card, blocks and
      // grabs will be wasted.
      if (attacker.discard[0].id === 'grab' && attacker.discard[1].type === 'unstoppable') {
        // Discard whatever he played and treat it as if he passed
        game.discard = game.discard.concat(cards)
        player.discard = []
        game.announce('player:counter-failed', {
          cards: Language.printCards(cards, game.language),
          player
        })
        game.pass(player.id)
        return
      }
      attacker.discard[0].contact(attacker, player, attacker.discard, game)
      player.discard = cards
      game.announce('card:grab:counter', { attacker, player })
    },
    play: (player, target, cards, game) => {
      if (cards.length < 2) {
        game.whisper(player, 'card:grab:invalid-card')
        return
      }
      if (target.discard[0]) {
        target.discard[0].contact(target, player, target.discard, game)
      }
      game.announce('card:grab:play', { player, target })
    }
  },
  {
    id: 'grease-bucket',
    type: 'attack',
    copies: 0,
    filter: () => []
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
        card: Language.printCards(cards[0], game.language),
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
        card: Language.printCards(cards[0], game.language),
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
    type: 'attack',
    copies: 0,
    filter: () => []
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
        card: Language.printCards(cards[0], game.language),
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
      if (cards[0].type === 'support') {
        _.remove(player.beforeTurn, () => getCard('the-bees').beforeTurn)
        _.remove(player.afterContact, () => getCard('the-bees').afterContact)
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
      const target = _.sample(game.players)
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
  return _.shuffle(deck.reduce((acc, card) => {
    _.times(card.copies, () => acc.push(card))
    return acc
  }, []))
}

function getCard(id) {
  const card = _.find(deck, { id })
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
  return _.flow([
    req => req.split(' '),
    req => req.filter(elem => elem),
    _.uniq,
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
