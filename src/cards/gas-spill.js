const { printCards } = require('../language')
const { removeOnce, sample } = require('../util')

const card = module.exports = {
  id: 'gas-spill',
  type: 'disaster',
  missTurns: 2,
  copies: 1,
  filter: () => [],
  beforeTurn: (player, game) => {
    const discardFn = () => {
      // Now we can discard the card
      game.discardPile.push(card)
      removeOnce(player.conditionCards, card)
      removeOnce(player.beforeTurn, () => discardFn)
      game.announce('player:discard', {
        cards: printCards(card, game.language),
        player
      })
      return true
    }
    player.beforeTurn.push(discardFn)
    removeOnce(player.beforeTurn, () => card.beforeTurn)
    return true
  },
  contact: (player, target, cards, game) => {
    target.missTurns += card.missTurns
    target.beforeTurn.push(card.beforeTurn)
    target.conditionCards.push(card)
    game.announce('card:gas-spill:contact', {
      player,
      target
    })
  },
  disaster: (player, cards, game) => {
    const target = sample(game.players)
    game.contact(player, target, cards)
  },
  validDisasters: (player, game) => {
    return [{
      cards: [card],
      weight: game.players.length * 0.75
    }]
  }
}
