const { printCards } = require('../language')

module.exports = {
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
    attacker.discard.forEach(card => game.discardPile.push(card))
    game.announce('card:block:counter', {
      attacker,
      cards: printCards(attacker.discard, game.language),
      player
    })
    game.incrementTurn()
    return cards
  }
}
