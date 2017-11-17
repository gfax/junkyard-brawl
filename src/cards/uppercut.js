module.exports = {
  id: 'uppercut',
  type: 'attack',
  damage: 5,
  copies: 5,
  filter: () => [],
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    game.announce('card:uppercut:contact', {
      player,
      target
    })
    return cards
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  }
}
