const { printCards } = require('../language')
const { find, remove } = require('../util')

const card = module.exports = {
  id: 'energy-drink',
  type: 'support',
  hp: 3,
  copies: 1,
  filter: () => [],
  beforeTurn: (player, game) => {
    const cardInstance = player.conditionCards.find(el => el.id === card.id)
    const discardFn = () => {
      game.discardPile.push(cardInstance)
      remove(player.conditionCards, el => el === cardInstance)
      remove(player.beforeTurn, el => el === discardFn)
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
    remove(player.beforeTurn, el => cardInstance.beforeTurn)
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
  },
  validPlays: (player, target, game) => {
    let weight = Math.min(player.maxHp - player.hp + 1, card.hp)

    // Increase the weight based on the player's deficit
    if (find(player.conditionCards, { id: 'the-bees' })) {
      weight += player.maxHp - player.hp
    }

    // Try to avoid contacting a target with a deflector
    if (find(target.conditionCards, { id: 'deflector' })) {
      weight = -weight
    }

    return [{
      cards: [card],
      target,
      weight
    }]
  }
}
