const { getCardWeight } = require('../util')

const card = module.exports = {
  id: 'bulldozer',
  type: 'unstoppable',
  copies: 1,
  filter: () => [],
  contact: (player, target, cards, game) => {
    game.discardPile = game.discardPile.concat(target.hand)
    target.hand = []
    game.announce('card:bulldozer:contact', {
      player,
      target
    })
    return cards
  },
  play: (player, target, cards, game) => {
    game.contact(player, target, cards)
    game.incrementTurn()
  },
  validPlays: (player, target, game) => {
    // Weight is proportional to the weight of the
    // opponent's hand we may potentially bulldoze
    const weight = target.hand.reduce((acc, el) => {
      // Avoid infinite recursion
      if (el.id === card.id || el.id === 'magnet') {
        return acc
      }
      return acc + (getCardWeight(target, player, el, game) * 0.1)
    }, 0)
    return [
      { cards: [card], target, weight }
    ]
  }
}
