const card = module.exports = {
  id: 'toolbox',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  disaster: (player, cards, game) => {
    game.announce('card:toolbox:disaster', { player })
    game.deal(player, 8 - player.hand.length)
    game.whisperStatus(player)
    return cards
  },
  validDisasters: (player, game) => {
    return [{
      cards: [card],
      weight: player.maxHand - player.hand.length + 2
    }]
  }
}
