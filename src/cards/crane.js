const { printCards } = require('../language')

module.exports = {
  id: 'crane',
  type: 'unstoppable',
  copies: 1,
  contact: (player, target, cards, game) => {
    const [head, ...tail] = cards
    target.hand = target.hand.concat(tail)
    if (tail.length) {
      game.announce('card:crane:contact', {
        cards: printCards(tail, game.language),
        player,
        target
      })
    } else {
      game.announce('card:crane:no-cards', {
        card: printCards(head, game.language),
        player
      })
    }
    game.deal(player, tail.length)
    game.whisperStatus(target.id)
    game.whisperStatus(player.id)
    return [head]
  },
  play: (player, target, cards, game) => {
    game.contact(player, target, cards)
    game.incrementTurn()
  }
}
