const { sample } = require('../util')

const card = module.exports = {
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
  },
  validDisasters: (player, game) => {
    let weight = 0.75 * game.players.length
    if (player.hp > 6) {
      weight += 1
    }
    return [
      { cards: [card], weight }
    ]
  }
}
