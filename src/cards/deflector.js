const { printCards } = require('../language')
const { remove, sample } = require('../util')

const card = module.exports = {
  id: 'deflector',
  type: 'disaster',
  copies: 1,
  filter: () => [],
  beforeContact: (player, target, cards, game, discarding) => {
    // Relinquish the card once its ability is used up
    const cardInstance = target.conditionCards.find(el => el.id === card.id)
    remove(target.beforeContact, el => el === card.beforeContact)
    remove(target.conditionCards, el => el === cardInstance)
    game.discardPile.push(cardInstance)
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
  },
  validDisasters: (player, game) => {
    return [{
      cards: [card],
      // Keep in mind the scale is from -maxHp - +maxHp. There may be
      // better disasters to play first so we'll give this 90% weight.
      weight: player.maxHp * 0.9
    }]
  }
}
