const { removeOnce } = require('../util')

module.exports = {
  id: 'meal-steal',
  type: 'attack',
  hp: '?',
  copies: 1,
  filter: () => [],
  contact: (player, target, cards, game) => {
    const stolenCards = target.hand
      .filter(card => card.id === 'soup' || card.id === 'sub')
    const totalHp = stolenCards.reduce((hp, card) => {
      return hp + card.hp
    }, 0)
    stolenCards.forEach(card => removeOnce(target.hand, card))
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
  }
}
