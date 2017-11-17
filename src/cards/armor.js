module.exports = {
  id: 'armor',
  type: 'support',
  heal: 5,
  copies: 1,
  filter: () => [],
  contact: (player, target, cards, game) => {
    player.hp += cards[0].heal
    game.announce('card:armor:contact', { player })
    return cards
  }
}
