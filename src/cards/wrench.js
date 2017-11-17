const { printCards } = require('../language')
const { removeOnce } = require('../util')

const card = module.exports = {
  id: 'wrench',
  type: 'attack',
  missTurns: 2,
  copies: 2,
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
    target.missTurns += cards[0].missTurns
    target.beforeTurn.push(cards[0].beforeTurn)
    target.conditionCards.push(cards[0])
    game.announce('card:wrench:contact', {
      player,
      target
    })
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  }
}
