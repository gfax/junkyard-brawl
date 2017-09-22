const _ = require('lodash')
const Language = require('./language')

module.exports = {
  generate,
  getCard
}

const deck = [
  {
    id: 'a-gun',
    type: 'attack',
    copies: 0
  },
  {
    id: 'acid-coffee',
    type: 'attack',
    copies: 0
  },
  {
    id: 'armor',
    type: 'attack',
    copies: 0
  },
  {
    id: 'avalanche',
    type: 'attack',
    copies: 0
  },
  {
    id: 'block',
    type: 'attack',
    copies: 0
  },
  {
    id: 'bulldozer',
    type: 'attack',
    copies: 0
  },
  {
    id: 'cheap-shot',
    type: 'attack',
    copies: 0
  },
  {
    id: 'crane',
    type: 'attack',
    copies: 0
  },
  {
    id: 'deflector',
    type: 'attack',
    copies: 0
  },
  {
    id: 'dodge',
    type: 'attack',
    copies: 0
  },
  {
    id: 'earthquake',
    type: 'attack',
    copies: 0
  },
  {
    id: 'energy-drink',
    type: 'attack',
    copies: 0
  },
  {
    id: 'gamblin-man',
    type: 'attack',
    copies: 0
  },
  {
    id: 'gas-spill',
    type: 'attack',
    copies: 0
  },
  {
    id: 'grab',
    type: 'counter',
    copies: 8,
    contact: (player, target, cards, game) => {
      game.discard.push(player.discard[0])
      _.remove(player.discard, player.discard[0])
      cards[0].contact(player, target, player.discard, game)
      player.discard = []
    },
    counter: (player, target, cards, game) => {
      if (cards.length < 2) {
        game.whisper(player, 'card:grab:invalid-card', { target })
        return
      }
      if (cards[1].type !== 'attack' && cards[1].type !== 'unstoppable') {
        game.whisper(player, 'card:grab:invalid-card', { target })
        return
      }
      target.discard[0].contact(target, player, target.discard, game)
      player.discard = [cards[0], cards[1]]
      game.announce('card:grab:counter', { player, target })
    },
    play: (player, target, cards, game) => {
      if (cards.length < 2) {
        game.whisper(player, 'card:grab:invalid-card')
        return
      }
      if (cards[1].type !== 'attack' && cards[1].type !== 'unstoppable') {
        game.whisper(player, 'card:grab:invalid-card')
        return
      }
      if (target.discard[0]) {
        target.discard[0].contact(target, player, target.discard, game)
      }
      player.discard = [cards[0], cards[1]]
      game.target = target
      game.announce('card:grab:play', { player, target })
    }
  },
  {
    id: 'grease-bucket',
    type: 'attack',
    copies: 0
  },
  {
    id: 'guard-dog',
    type: 'attack',
    copies: 0
  },
  {
    id: 'gut-punch',
    type: 'attack',
    copies: 10,
    contact: (player, target, cards, game) => {
      target.hp -= 2
      game.announce('card:gut-punch:contact', {
        player,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.target = target
      player.discard = [cards[0]]
      _.remove(player.hand, player.discard)
      game.announce('player:played', {
        card: Language.printCards(player.discard[0], 'en'),
        player,
        target
      })
    }
  },
  {
    id: 'insurance',
    type: 'attack',
    copies: 0
  },
  {
    id: 'its-getting-windy',
    type: 'attack',
    copies: 0
  },
  {
    id: 'magnet',
    type: 'attack',
    copies: 0
  },
  {
    id: 'mattress',
    type: 'attack',
    copies: 0
  },
  {
    id: 'meal-steal',
    type: 'attack',
    copies: 0
  },
  {
    id: 'mirror',
    type: 'attack',
    copies: 0
  },
  {
    id: 'neck-punch',
    type: 'attack',
    copies: 10,
    contact: (player, target, cards, game) => {
      target.hp -= 3
      game.announce('card:neck-punch:contact', {
        player,
        target
      })
    },
    play: (player, target, cards, game) => {
      game.target = target
      player.discard = [cards[0]]
      _.remove(player.hand, player.discard)
      game.announce('player:played', {
        card: Language.printCards(player.discard[0], 'en'),
        player,
        target
      })
    }
  },
  {
    id: 'propeller',
    type: 'attack',
    copies: 0
  },
  {
    id: 'reverse',
    type: 'attack',
    copies: 0
  },
  {
    id: 'sleep',
    type: 'attack',
    copies: 0
  },
  {
    id: 'siphon',
    type: 'attack',
    copies: 0
  },
  {
    id: 'soup',
    type: 'attack',
    copies: 0
  },
  {
    id: 'spare-bolts',
    type: 'attack',
    copies: 0
  },
  {
    id: 'sub',
    type: 'attack',
    copies: 0
  },
  {
    id: 'surgery',
    type: 'attack',
    copies: 0
  },
  {
    id: 'the-bees',
    type: 'attack',
    copies: 0
  },
  {
    id: 'tire',
    type: 'attack',
    copies: 0
  },
  {
    id: 'tire-iron',
    type: 'attack',
    copies: 0
  },
  {
    id: 'toolbox',
    type: 'attack',
    copies: 0
  },
  {
    id: 'uppercut',
    type: 'attack',
    copies: 0
  },
  {
    id: 'whirlwind',
    type: 'attack',
    copies: 0
  },
  {
    id: 'wrench',
    type: 'attack',
    copies: 0
  }
]

function generate() {
  return _.shuffle(deck.reduce((acc, card) => {
    _.times(card.copies, () => acc.push(card))
    return acc
  }, []))
}

function getCard(id) {
  return _.find(deck, { id })
}
