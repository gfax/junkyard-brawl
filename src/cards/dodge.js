const { printCards } = require('../language')
const { findNext } = require('../util')

const card = module.exports = {
  id: 'dodge',
  type: 'counter',
  copies: 6,
  filter: () => [],
  validateCounter: (player, attacker, cards, game) => {
    // Can't dodge an attack when you've already been grabbed
    if (attacker.discard[0].id === 'grab') {
      game.whisper(player, 'card:dodge:invalid')
      return false
    }
    return true
  },
  counter: (player, attacker, cards, game) => {
    game.discardPile.push(cards[0])
    // Empty the discard since this player may not
    // be a target by the time the turn increments
    player.discard = []
    if (findNext(game.players, player) === attacker) {
      game.announce('card:dodge:nullify', {
        attacker,
        cards: printCards(attacker.discard, game.language),
        player
      })
      game.incrementTurn()
      return cards
    }
    game.target = findNext(game.players, player)
    game.announce('card:dodge:new-target', {
      attacker,
      cards: printCards(attacker.discard[0], game.language),
      player,
      target: game.target
    })
  },
  validCounters: (player, attacker, game) => {
    const [attack] = attacker.discard
    if (attack.id === 'grab') {
      return []
    }
    return [{
      cards: [card],
      weight: player.maxHp - player.hp
    }]
  }
}
