const { findNext } = require('../util')

module.exports = {
  id: 'whirlwind',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  disaster: (player, cards, game) => {
    const tornado = game.players.map(plyr => plyr.hand)
    game.players.forEach((plyr, idx) => {
      const nextPlyr = findNext(game.players, plyr)
      nextPlyr.hand = tornado[idx]
    })
    game.announce('card:whirlwind:disaster', { player })
    return cards
  }
}
