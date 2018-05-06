const { clone, getCardWeight, remove } = require('../util')

const card = module.exports = {
  id: 'mattress',
  type: 'counter',
  copies: 3,
  filter: () => [],
  counter: (player, attacker, cards, game) => {
    const healthBeforeAttack = clone(player.hp)
    const afterContactFn = (_attacker, target, _cards, _game) => {
      if (healthBeforeAttack > target.hp) {
        target.hp = Math.min(healthBeforeAttack, target.hp + 2)
      }
      remove(target.afterContact, el => el === afterContactFn)
    }
    player.afterContact.push(afterContactFn)
    game.announce('card:mattress:counter', { player })
    game.contact(attacker, player, attacker.discard)
    game.incrementTurn()
    return cards
  },
  validCounters: (player, attacker, game) => {
    // If the attacker played a grab, use the next card's weight
    const attack = attacker.discard[0].id === 'grab' ? attacker.discard[1] : attacker.discard[0]
    // Match the block's weight against the opponent's attack
    const weight = getCardWeight(player, attacker, attack, game)
    // Additional weight if the player may die from this
    const bonusWeight = player.hp - weight <= 0 ? player.maxHp * 0.9 : 0
    return [{
      cards: [card],
      weight: weight + bonusWeight
    }]
  }
}
