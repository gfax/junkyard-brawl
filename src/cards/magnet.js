const { removeOnce, shuffle } = require('../util')

module.exports = {
  id: 'magnet',
  type: 'unstoppable',
  copies: 1,
  contact: (player, target, cards, game) => {
    game.discardPile = game.discardPile.concat(cards)
    const numberToSteal = Math.min(cards.length, target.hand.length)
    const stolenCards = shuffle(target.hand).slice(0, numberToSteal)
    stolenCards.forEach((card) => {
      removeOnce(target.hand, card)
      player.hand.push(card)
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
  }
}
