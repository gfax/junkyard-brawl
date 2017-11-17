const { printCards } = require('../language')
const { removeOnce } = require('../util')

const card = module.exports = {
  id: 'energy-drink',
  type: 'support',
  hp: 3,
  copies: 1,
  filter: () => [],
  beforeTurn: (player, game) => {
    const discardFn = () => {
      game.discardPile.push(card)
      removeOnce(player.conditionCards, card)
      removeOnce(player.beforeTurn, () => discardFn)
      if (player.hp < player.maxHp) {
        player.hp += 1
      }
      game.announce('card:energy-drink:before-turn', { player })
      game.announce('player:discard', {
        cards: printCards(card, game.language),
        player
      })
      return true
    }
    if (player.hp < player.maxHp) {
      player.hp += 1
    }
    player.beforeTurn.push(discardFn)
    removeOnce(player.beforeTurn, () => card.beforeTurn)
    game.announce('card:energy-drink:before-turn', { player })
    return true
  },
  contact: (player, target, cards, game) => {
    if (player.hp < player.maxHp) {
      player.hp += 1
    }
    target.beforeTurn.push(cards[0].beforeTurn)
    target.conditionCards.push(cards[0])
    game.announce('card:energy-drink:contact', { player: target })
  }
}
