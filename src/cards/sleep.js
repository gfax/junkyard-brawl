const { getAttackResults } = require('../util')

module.exports = {
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
    // Determine how many points to give the player, by simulating
    // playing the card(s) and turning the damages into health.
    const { damage: healthDiff } = getAttackResults([cards[1]])
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.hp + healthDiff, player.maxHp)
    }
    game.announce('card:sleep:contact', {
      number: healthDiff,
      player
    })
    return cards
  }
}
