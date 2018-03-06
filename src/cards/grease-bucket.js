const { baseWeight, removeOnce } = require('../util')

const card = module.exports = {
  id: 'grease-bucket',
  type: 'attack',
  damage: 2,
  missTurns: 1,
  copies: 3,
  filter: () => [],
  beforeTurn: (player, game) => {
    game.discardPile.push(card)
    removeOnce(player.conditionCards, card)
    removeOnce(player.beforeTurn, () => card.beforeTurn)
    return true
  },
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    target.missTurns += cards[0].missTurns
    target.beforeTurn.push(cards[0].beforeTurn)
    // Card isn't put in the discard until the missed turn is expended
    target.conditionCards.push(cards[0])
    game.announce('card:grease-bucket:contact', {
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
