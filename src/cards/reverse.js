const card = module.exports = {
  id: 'reverse',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  disaster: (player, cards, game) => {
    game.announce('card:reverse:disaster', { player })
    const [head, ...tail] = game.players
    game.players = [head, ...tail.reverse()]
    game.incrementTurn()
    return cards
  },
  validDisasters: (player, game) => {
    let weight = 0
    if (game.players[0] !== player) {
      weight += 3
      if (game.players.length === 2) {
        weight += 1
      }
    }
    return [{
      cards: [card],
      weight
    }]
  }
}
