const { remove } = require('../util')

const card = module.exports = {
  id: 'spare-bolts',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  beforeTurn: (player, game) => {
    const cardInstance = player.conditionCards.find(el => el.id === card.id)
    game.discardPile.push(cardInstance)
    remove(player.beforeTurn, el => el === cardInstance.beforeTurn)
    remove(player.conditionCards, el => el === card)
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
