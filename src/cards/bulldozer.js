module.exports = {
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
  }
}
