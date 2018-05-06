const { printCards } = require('../language')
const { remove, sample } = require('../util')

const card = module.exports = {
  id: 'gas-spill',
  type: 'disaster',
  missTurns: 2,
  copies: 1,
  filter: () => [],
  beforeTurn: (player, game) => {
    const cardInstance = player.conditionCards.find(el => el.id === card.id)
    const discardFn = () => {
      // Now we can discard the card
      game.discardPile.push(cardInstance)
      remove(player.conditionCards, el => el === cardInstance)
      remove(player.beforeTurn, el => el === discardFn)
      game.announce('player:discard', {
        cards: printCards(card, game.language),
        player
      })
      return true
    }
    player.beforeTurn.push(discardFn)
    remove(player.beforeTurn, el => el === cardInstance.beforeTurn)
    return true
  },
  contact: (player, target, cards, game) => {
    target.missTurns += card.missTurns
    target.beforeTurn.push(card.beforeTurn)
    target.conditionCards.push(cards[0])
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
