module.exports = {
  id: 'soup',
  type: 'support',
  hp: 1,
  copies: 3,
  filter: () => [],
  contact: (player, target, cards, game) => {
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.hp + cards[0].hp, player.maxHp)
    }
    game.announce('card:soup:contact', { player })
    return cards
  }
}
