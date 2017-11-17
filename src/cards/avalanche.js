const { sample } = require('../util')

module.exports = {
  id: 'avalanche',
  type: 'disaster',
  damage: 6,
  copies: 1,
  filter: () => [],
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
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
}
