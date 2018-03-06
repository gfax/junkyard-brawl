const { find, findNext, getCardWeight } = require('../util')

const card = module.exports = {
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
  },
  validDisasters: (player, game) => {
    // Weight is proportional to how bad the player hand is
    const target = find(game.players, plyr => plyr !== player)
    const hasNiceCard = find(player.hand, (el) => {
      if (el.id === card.id) {
        return false
      }
      return getCardWeight(player, target, el, game) > player.maxHp * 0.75
    })
    return [{
      cards: [card],
      weight: hasNiceCard ? 0 : player.maxHp / 2
    }]
  }
}
