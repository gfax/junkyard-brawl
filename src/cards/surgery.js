module.exports = {
  id: 'surgery',
  type: 'support',
  copies: 2,
  filter: () => [],
  validateContact: (player, target, cards, game) => {
    if (target.hp === 1) {
      return true
    }
    game.whisper(target, 'card:surgery:invalid-contact')
    return false
  },
  contact: (player, target, cards, game) => {
    player.hp = player.maxHp
    game.announce('card:surgery:contact', { player })
    return cards
  }
}
