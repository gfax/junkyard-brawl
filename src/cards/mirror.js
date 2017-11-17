const { printCards } = require('../language')
const { clone } = require('../util')

module.exports = {
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
  }
}
