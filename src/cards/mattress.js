const { clone, removeOnce } = require('../util')

module.exports = {
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
      removeOnce(target.afterContact, () => afterContactFn)
    }
    player.afterContact.push(afterContactFn)
    game.announce('card:mattress:counter', { player })
    game.contact(attacker, player, attacker.discard)
    game.incrementTurn()
    return cards
  }
}
