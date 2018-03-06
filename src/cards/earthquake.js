const card = module.exports = {
  id: 'earthquake',
  type: 'disaster',
  damage: 1,
  copies: 1,
  filter: () => [],
  disaster: (player, cards, game) => {
    game.announce('card:earthquake:disaster', { player })
    game.players.forEach(plyr => (plyr.hp -= cards[0].damage))
    game.announceStatus()
    game.cleanup()
    return cards
  },
  validDisasters: (player, game) => {
    if (player.hp === 1) {
      return []
    }
    const greatIdea = game.players.reduce((acc, plyr) => {
      return acc || plyr.hp === 1
    }, false)
    // This is going to kill somebody so this should have as much
    // weight as possible. (Weight scale is -maxHp - +maxHp.)
    if (greatIdea) {
      return [{
        cards: [card],
        weight: player.maxHp
      }]
    }
    return [{
      cards: [card],
      weight: game.players.length - 1
    }]
  }
}
