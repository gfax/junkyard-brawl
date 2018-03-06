const { printCards } = require('../language')
const { clone, find } = require('../util')

const card = module.exports = {
  id: 'mirror',
  type: 'counter',
  copies: 2,
  filter: () => [],
  counter: (player, attacker, cards, game) => {
    const [head, ...tail] = clone(attacker.discard)
    const mirroredCards = head.id === 'grab' ? tail : [head, ...tail]
    game.contact(attacker, player, attacker.discard, true)
    game.announce('card:mirror:counter', {
      attacker,
      cards: printCards(mirroredCards, game.language),
      player
    })
    game.contact(player, attacker, mirroredCards, false)
    game.incrementTurn()
    return cards
  },
  validCounters: (player, attacker, game) => {
    // Weight is proportional to the player's current health
    let weight = player.hp * 0.75
    if (find(attacker.conditionCards, { id: 'deflector' })) {
      weight *= 0.5
    }
    return [{
      cards: [card],
      weight
    }]
  }
}
