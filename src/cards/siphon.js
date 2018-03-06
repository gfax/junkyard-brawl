const { find } = require('../util')

const card = module.exports = {
  id: 'siphon',
  type: 'attack',
  damage: 1,
  hp: 1,
  copies: 2,
  filter: () => [],
  contact: (player, target, cards, game) => {
    if (player.hp < player.maxHp) {
      player.hp += cards[0].hp
    }
    target.hp -= cards[0].damage
    game.announce('card:siphon:contact', {
      player,
      target
    })
    return cards
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  },
  validPlays: (player, target, game) => {
    let weight = card.damage + card.hp

    // Contacting a target with a deflector isn't a bad idea!
    // Waste their deflector if possible!
    if (find(target.conditionCards, { id: 'deflector' })) {
      weight += 3
    }

    return [{
      cards: [card],
      target,
      weight
    }]
  }
}
