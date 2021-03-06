const { baseWeight } = require('../util')

const card = module.exports = {
  id: 'a-gun',
  type: 'unstoppable',
  damage: 2,
  copies: 1,
  filter: () => [],
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    game.announce('card:a-gun:contact', {
      player,
      target
    })
    return cards
  },
  play: (player, target, cards, game) => {
    game.contact(player, target, cards)
    game.incrementTurn()
  },
  validPlays: (player, target, game) => {
    return [{
      cards: [card],
      target,
      weight: baseWeight(player, target, card, game)
    }]
  }
}
