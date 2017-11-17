module.exports = {
  id: 'gut-punch',
  type: 'attack',
  damage: 2,
  copies: 10,
  filter: () => [],
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    game.announce('card:gut-punch:contact', {
      player,
      target
    })
    return cards
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  }
}
