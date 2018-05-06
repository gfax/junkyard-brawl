const { remove, sample } = require('../util')

const card = module.exports = {
  id: 'the-bees',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  afterContact: (player, target, cards, game) => {
    if (cards[0].type === 'support') {
      const cardInstance = player.conditionCards.find(el => el.id === card.id)
      remove(player.beforeTurn, el => el === cardInstance.beforeTurn)
      remove(player.afterContact, el => el === cardInstance.afterContact)
      remove(player.conditionCards, el => el === cardInstance)
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
  },
  validDisasters: (player, game) => {
    return [{
      cards: [card],
      weight: game.players.length * 0.75
    }]
  }
}
