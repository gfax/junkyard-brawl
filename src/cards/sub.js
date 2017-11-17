module.exports = {
  id: 'sub',
  type: 'support',
  hp: 2,
  copies: 7,
  filter: () => [],
  contact: (player, target, cards, game) => {
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.hp + cards[0].hp, player.maxHp)
    }
    game.announce('card:sub:contact', { player })
    return cards
  }
}
