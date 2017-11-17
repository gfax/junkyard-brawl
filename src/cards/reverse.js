module.exports = {
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
  }
}
