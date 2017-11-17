const { findNext, removeOnce, sample } = require('../util')

module.exports = {
  id: 'its-getting-windy',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  disaster: (player, cards, game) => {
    game.players
      .map((plyr) => {
        if (!plyr.hand.length) {
          return null
        }
        const card = sample(plyr.hand)
        removeOnce(plyr.hand, card)
        return card
      })
      .forEach((card, idx) => {
        if (card !== null) {
          findNext(game.players, game.players[idx]).hand.push(card)
        }
      })
    game.announce('card:its-getting-windy:disaster', { player })
    game.players.forEach(plyr => game.whisperStatus(plyr))
    return cards
  }
}
