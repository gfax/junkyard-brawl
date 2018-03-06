const { find, removeOnce } = require('../util')

const card = module.exports = {
  id: 'meal-steal',
  type: 'attack',
  hp: '?',
  copies: 1,
  filter: () => [],
  contact: (player, target, cards, game) => {
    const stolenCards = target.hand
      .filter(_card => _card.id === 'soup' || _card.id === 'sub')
    const totalHp = stolenCards.reduce((hp, _card) => {
      return hp + _card.hp
    }, 0)
    stolenCards.forEach(_card => removeOnce(target.hand, _card))
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.hp + totalHp, player.maxHp)
    }
    // It's easier to have different messages for different results
    // than to try and parse out the amount in the lodash template.
    let messageCode = 'zero'
    if (stolenCards.length === 1) {
      messageCode = 'one'
    } else if (stolenCards.length > 1) {
      messageCode = 'multiple'
    }
    game.announce(`card:meal-steal:steal-${messageCode}`, {
      hp: totalHp,
      number: stolenCards.length,
      player,
      target
    })
    return cards.concat(stolenCards)
  },
  play: (player, target, cards, game) => {
    game.contact(player, target, cards)
    game.incrementTurn()
  },
  validPlays: (player, target, game) => {
    let weight = player.maxHp - player.hp

    if (find(player.conditionCards, { id: 'the-bees' })) {
      weight *= 2
    }

    return [{
      cards: [card],
      weight
    }]
  }
}
