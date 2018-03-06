const { removeOnce } = require('../util')

const card = module.exports = {
  id: 'spare-bolts',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  beforeTurn: (player, game) => {
    game.discardPile.push(card)
    removeOnce(player.beforeTurn, () => card.beforeTurn)
    removeOnce(player.conditionCards, card)
  },
  disaster: (player, cards, game) => {
    player.extraTurns += 1
    player.beforeTurn.push(cards[0].beforeTurn)
    player.conditionCards.push(cards[0])
    game.announce('card:spare-bolts:disaster', { player })
  },
  validDisasters: (player, game) => {
    return [{
      cards: [card],
      weight: player.maxHp - 1
    }]
  }
}
