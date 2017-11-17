module.exports = {
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
  }
}
