const { printCards } = require('../language')
const { removeOnce, sample } = require('../util')

const card = module.exports = {
  id: 'deflector',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  beforeContact: (player, target, cards, game, discarding) => {
    // Relinquish the card once its ability is used up
    removeOnce(target.beforeContact, () => card.beforeContact)
    removeOnce(target.conditionCards, () => card)
    game.discardPile.push(card)
    game.announce('card:deflector:deflect', {
      player,
      target,
      cards: printCards(cards[0], game.language)
    })
    // Deflect it to anybody other than the originally intended target
    const victim = sample(
      game.players.filter(plyr => plyr !== target)
    )
    game.contact(player, victim, cards, discarding)
    // Returning false means the contactee won't be contacted
    return false
  },
  disaster: (player, cards, game) => {
    player.beforeContact.push(cards[0].beforeContact)
    player.conditionCards.push(cards[0])
    game.announce('card:deflector:play', { player })
  }
}
