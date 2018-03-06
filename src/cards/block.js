const { printCards } = require('../language')
const { getCardWeight } = require('../util')

const card = module.exports = {
  id: 'block',
  type: 'counter',
  copies: 5,
  filter: () => [],
  counter: (player, attacker, cards, game) => {
    // One special situation with being grabbed is if the
    // opponent has a hidden unstoppable card, blocks and
    // grabs will be wasted.
    if (attacker.discard[0].id === 'grab' && attacker.discard[1].type === 'unstoppable') {
      player.discard = []
      game.announce('player:counter-failed', {
        cards: printCards(cards, game.language),
        player
      })
      // Treat it as if he passed
      game.pass(player.id)
      // But still return the failed counter to be discarded
      return cards
    }
    attacker.discard.forEach(_card => game.discardPile.push(_card))
    game.announce('card:block:counter', {
      attacker,
      cards: printCards(attacker.discard, game.language),
      player
    })
    game.incrementTurn()
    return cards
  },
  validCounters: (player, attacker, game) => {
    // If the attacker played a grab, use the next card's weight
    const attack = attacker.discard[0].id === 'grab' ? attacker.discard[1] : attacker.discard[0]
    // Match the block's weight against the opponent's attack
    const weight = getCardWeight(player, attacker, attack, game)
    // Additional weight if the player may die from this
    const bonusWeight = player.hp - weight <= 0 ? player.maxHp : 0
    return [{
      cards: [card],
      weight: weight + bonusWeight
    }]
  }
}
