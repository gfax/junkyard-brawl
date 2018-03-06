const { getAttackResults, removeOnce } = require('../util')

const card = module.exports = {
  id: 'insurance',
  type: 'counter',
  copies: 2,
  filter: () => [],
  afterContact: (player, target, cards, game) => {
    if (target.hp < 1) {
      target.hp = Math.floor(target.maxHp / 2)
      game.announce('card:insurance:success', { player: target })
    }
    return true
  },
  counter: (player, attacker, cards, game) => {
    game.announce('card:insurance:counter', { player })
    player.afterContact.push(cards[0].afterContact)
    game.contact(attacker, player, attacker.discard)
    removeOnce(player.afterContact, () => cards[0].afterContact)
    game.incrementTurn()
    return cards
  },
  validCounters: (player, attacker, game) => {
    // Determine the damages by simulating playing the card(s)
    const attackResults = getAttackResults(attacker.discard)
    return [{
      cards: [card],
      weight: player.hp - attackResults.damage <= 0 ? player.maxHp : 0
    }]
  }
}
