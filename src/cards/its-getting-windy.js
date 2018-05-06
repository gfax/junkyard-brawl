const { find, findNext, getCardWeight, remove, sample } = require('../util')

const card = module.exports = {
  id: 'its-getting-windy',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  disaster: (player, cards, game) => {
    const sampleCard = (plyr) => {
      if (plyr === player) {
        return sample(plyr.hand.filter(el => el.id !== card.id))
      }
      return sample(plyr.hand)
    }
    game.players
      .map((plyr) => {
        if (!plyr.hand.length) {
          return null
        }
        const randomCard = sampleCard(plyr)
        remove(find(game.players, { id: plyr.id }).hand, el => el === randomCard)
        return randomCard
      })
      .forEach((crd, idx) => {
        if (crd !== null) {
          findNext(game.players, game.players[idx]).hand.push(crd)
        }
      })
    game.announce('card:its-getting-windy:disaster', { player })
    game.players.forEach(plyr => game.whisperStatus(plyr))
    return cards
  },
  validDisasters: (player, game) => {
    const anotherPlayer = find(game.players, plyr => plyr !== player)
    // Weight is proportional to their hand's weight
    const weight = player.hand.reduce((acc, _card) => {
      // Avoid infinite recursion
      if (_card.id === card.id) {
        return acc
      }
      return acc + getCardWeight(player, anotherPlayer, _card, game)
    }, 0) / 10
    return [{
      cards: [card],
      weight
    }]
  }
}
