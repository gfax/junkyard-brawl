const { find } = require('../util')

const card = module.exports = {
  id: 'armor',
  type: 'support',
  hp: 5,
  copies: 1,
  filter: () => [],
  contact: (player, target, cards, game) => {
    player.hp += cards[0].hp
    game.announce('card:armor:contact', { player })
    return cards
  },
  validPlays: (player, target, game) => {
    if (find(player.conditionCards, { id: 'deflector' })) {
      return [{
        cards: [card],
        target,
        weight: -card.hp
      }]
    }
    return [{
      cards: [card],
      target,
      weight: card.hp
    }]
  }
}
