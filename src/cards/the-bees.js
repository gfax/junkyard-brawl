const { removeOnce, sample } = require('../util')

const card = module.exports = {
  id: 'the-bees',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  afterContact: (player, target, cards, game) => {
    if (cards[0].type === 'support') {
      removeOnce(player.beforeTurn, () => card.beforeTurn)
      removeOnce(player.afterContact, () => card.afterContact)
      removeOnce(player.conditionCards, card)
      // Relinquish the card from the player
      game.discardPile.push(card)
      game.announce('card:the-bees:healed', { player })
    }
    return true
  },
  beforeTurn: (player, game) => {
    player.hp -= 1
    game.announce('card:the-bees:before-turn', { player })
    if (player.hp < 1) {
      return false
    }
    return true
  },
  disaster: (player, cards, game) => {
    const target = sample(game.players)
    target.beforeTurn.push(cards[0].beforeTurn)
    target.afterContact.push(cards[0].afterContact)
    target.conditionCards.push(cards[0])
    game.announce('card:the-bees:play', {
      player,
      target
    })
  }
}
