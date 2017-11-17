const { removeOnce } = require('../util')

const card = module.exports = {
  id: 'tire',
  type: 'unstoppable',
  missTurns: 1,
  copies: 2,
  filter: () => [],
  beforeTurn: (player, game) => {
    game.discardPile.push(card)
    removeOnce(player.conditionCards, card)
    removeOnce(player.beforeTurn, () => card.beforeTurn)
    return true
  },
  contact: (player, target, cards, game) => {
    target.missTurns += cards[0].missTurns
    target.beforeTurn.push(cards[0].beforeTurn)
    target.conditionCards.push(cards[0])
    game.announce('card:tire:contact', {
      player,
      target
    })
  },
  play: (player, target, cards, game) => {
    game.contact(player, target, cards)
    game.incrementTurn()
  }
}
