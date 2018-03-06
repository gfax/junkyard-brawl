const { getCardWeight } = require('../util')

const card = module.exports = {
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
    attacker.discard = []
    player.discard = cards
    card.play(player, attacker, cards, game)
  },
  validCounters: (player, attacker, game) => {
    return card.validPlays(player, attacker, game)
  },
  validatePlay: (player, target, cards, game) => {
    if (cards.length < 2) {
      game.whisper(player, 'card:grab:invalid-card')
      return false
    }
    if (cards[1].validateContact) {
      const [, ...tail] = cards
      return cards[1].validateContact(target, player, tail, game)
    }
    return true
  },
  play: (player, target, cards, game) => {
    game.announce('card:grab:play', { player, target })
    game.whisperStatus(target)
  },
  validPlays: (player, target, game) => {
    // The likelyhood that we should use a grab for a play is
    // increased with the amount of grabs at the player's disposal
    const grabWeight = player.hand.reduce((acc, el) => {
      if (el.id === card.id) {
        return acc + 0.1
      }
      return acc
    }, 0)
    return player.hand
      .filter(el => el.type === 'attack')
      .map((el) => {
        return {
          cards: [card, el],
          target,
          weight: grabWeight + getCardWeight(player, target, el, game)
        }
      })
  }
}
