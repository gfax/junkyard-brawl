const { find } = require('../util')

const card = module.exports = {
  id: 'sub',
  type: 'support',
  hp: 2,
  copies: 7,
  filter: () => [],
  contact: (player, target, cards, game) => {
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.hp + cards[0].hp, player.maxHp)
    }
    game.announce('card:sub:contact', { player })
    return cards
  },
  validPlays: (player, target, game) => {
    let weight = card.hp
    // We may want to heal from the bees if we're hurting
    if (find(player.conditionCards, { id: 'the-bees' })) {
      weight += player.maxHp - player.hp
    }
    // Try to avoid contacting a target with a deflector
    if (find(target.conditionCards, { id: 'deflector' })) {
      weight = -weight
    }
    return [{
      cards: [card],
      target,
      weight
    }]
  }
}
