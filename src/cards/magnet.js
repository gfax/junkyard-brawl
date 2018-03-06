const { getCardWeight, removeOnce, shuffle } = require('../util')

const card = module.exports = {
  id: 'magnet',
  type: 'unstoppable',
  copies: 1,
  contact: (player, target, cards, game) => {
    game.discardPile = game.discardPile.concat(cards)
    const numberToSteal = Math.min(cards.length, target.hand.length)
    const stolenCards = shuffle(target.hand).slice(0, numberToSteal)
    stolenCards.forEach((_card) => {
      removeOnce(target.hand, _card)
      player.hand.push(_card)
    })
    game.announce('card:magnet:contact', {
      player,
      number: numberToSteal,
      target
    })
  },
  play: (player, target, cards, game) => {
    game.contact(player, target, cards)
    game.incrementTurn()
  },
  validPlays: (player, target, game) => {
    // Weight is proportional to the weight of the
    // opponent's hand we may potentially steal
    const weight = target.hand.reduce((acc, el) => {
      // Avoid infinite recursion
      if (el.id === card.id || el.id === 'bulldozer') {
        return acc
      }
      return acc + (getCardWeight(target, player, el, game) * 0.1)
    }, 2)
    return [
      { cards: [card], target, weight }
    ]
  }
}
