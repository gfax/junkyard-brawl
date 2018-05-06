const { baseWeight, remove } = require('../util')

const card = module.exports = {
  id: 'tire',
  type: 'unstoppable',
  missTurns: 1,
  copies: 2,
  filter: () => [],
  beforeTurn: (player, game) => {
    const cardInstance = player.conditionCards.find(el => el.id === card.id)
    remove(player.conditionCards, el => el === cardInstance)
    game.discardPile.push(cardInstance)
    remove(player.beforeTurn, el => el === card.beforeTurn)
    return true
  },
  contact: (player, target, cards, game) => {
    target.missTurns += cards[0].missTurns
    target.beforeTurn.push(cards[0].beforeTurn)
    target.conditionCards.push(cards[0])
    game.announce('card:tire:contact', {
      player,
      target
    })
  },
  play: (player, target, cards, game) => {
    game.contact(player, target, cards)
    game.incrementTurn()
  },
  validPlays: (player, target, game) => {
    return [{
      cards: [card],
      target,
      weight: baseWeight(player, target, card, game)
    }]
  }
}
