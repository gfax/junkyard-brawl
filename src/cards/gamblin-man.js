module.exports = {
  id: 'gamblin-man',
  type: 'attack',
  damage: '?',
  copies: 2,
  filter: () => [],
  contact: (player, target, cards, game) => {
    const damage = Math.floor((Math.random() * 6) + 1)
    target.hp -= damage
    game.announce('card:gamblin-man:contact', {
      damage,
      player,
      target
    })
    return cards
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  }
}
