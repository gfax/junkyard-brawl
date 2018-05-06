const { printCards } = require('../language')
const { baseWeight, remove } = require('../util')

const card = module.exports = {
  id: 'wrench',
  type: 'attack',
  missTurns: 2,
  copies: 2,
  filter: () => [],
  beforeTurn: (player, game) => {
    const discardFn = () => {
      // Now we can finally discard the card
      const cardInstance = player.conditionCards.find(el => el.id === card.id)
      game.discardPile.push(cardInstance)
      remove(player.conditionCards, el => el === cardInstance)
      remove(player.beforeTurn, el => el === discardFn)
      game.announce('player:discard', {
        cards: printCards(card, game.language),
        player
      })
      return true
    }
    player.beforeTurn.push(discardFn)
    remove(player.beforeTurn, el => el === card.beforeTurn)
    return true
  },
  contact: (player, target, cards, game) => {
    target.missTurns += cards[0].missTurns
    target.beforeTurn.push(cards[0].beforeTurn)
    target.conditionCards.push(cards[0])
    game.announce('card:wrench:contact', {
      player,
      target
    })
  },
  play: (player, target, cards, game) => {
    game.announcePlayed(player, target, cards)
  },
  validPlays: (player, target, game) => {
    const twoPlayerMultiplier = game.players.length === 2 ? 1.5 : 1
    return [{
      cards: [card],
      target,
      weight: baseWeight(player, target, card, game) * twoPlayerMultiplier
    }]
  }
}
