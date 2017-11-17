module.exports = {
  id: 'cheap-shot',
  type: 'unstoppable',
  damage: 1,
  copies: 2,
  filter: () => [],
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    game.announce('card:cheap-shot:contact', {
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
