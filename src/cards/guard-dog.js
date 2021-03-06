const { baseWeight } = require('../util')

const card = module.exports = {
  id: 'guard-dog',
  type: 'attack',
  damage: 4,
  copies: 2,
  filter: () => [],
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    game.announce('card:guard-dog:contact', {
      player,
      target
    })
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  },
  validPlays: (player, target, game) => {
    return [{
      cards: [card],
      target,
      weight: baseWeight(player, target, card, game)
    }]
  }
}
