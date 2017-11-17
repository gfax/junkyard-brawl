module.exports = {
  id: 'neck-punch',
  type: 'attack',
  damage: 3,
  copies: 10,
  filter: () => [],
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    game.announce('card:neck-punch:contact', {
      player,
      target
    })
    return cards
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  }
}
