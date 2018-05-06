const { baseWeight, remove } = require('../util')

const card = module.exports = {
  id: 'acid-coffee',
  type: 'attack',
  damage: 3,
  missTurns: 1,
  copies: 2,
  filter: () => [],
  beforeTurn: (player, game) => {
    const cardInstance = player.conditionCards.find(el => el.id === card.id)
    game.discardPile.push(cardInstance)
    remove(player.conditionCards, el => el === cardInstance)
    remove(player.beforeTurn, el => el === card.beforeTurn)
    return true
  },
  contact: (player, target, cards, game) => {
    target.hp -= cards[0].damage
    target.missTurns += cards[0].missTurns
    target.beforeTurn.push(cards[0].beforeTurn)
    // Card isn't put in the discard until the missed turn is expended
    target.conditionCards.push(cards[0])
    game.announce('card:acid-coffee:contact', {
      player,
      target
    })
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  },
  validPlays: (player, target, game) => {
    return [{
      cards: [card],
      target,
      weight: baseWeight(player, target, card, game)
    }]
  }
}
