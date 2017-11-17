module.exports = {
  id: 'sleep',
  type: 'support',
  copies: 1,
  filter: (cards) => {
    if (cards[0]) {
      if (cards[0].type === 'attack' || cards[0].type === 'unstoppable') {
        return [cards[0]]
      }
    }
    return []
  },
  validateContact: (player, target, cards, game) => {
    if (cards[1]) {
      return true
    }
    game.whisper(target, 'card:sleep:invalid-contact')
    return false
  },
  contact: (player, target, cards, game) => {
    // This is a funny one... in order to determine how many
    // points to give the player, we simulate playing the
    // card to see how much damage it would deal.
    const Junkyard = require('../junkyard')
    const brawl = new Junkyard('1', '')
    brawl.addPlayer('2', '')
    brawl.start()
    const [p1, p2] = brawl.players
    p1.hand.push(cards[1])
    brawl.play(p1, cards[1])
    if (cards[1].type === 'attack') {
      brawl.pass(p2)
    }
    const healthDiff = p2.maxHp - p2.hp
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.hp + healthDiff, player.maxHp)
    }
    game.announce('card:sleep:contact', {
      number: healthDiff,
      player
    })
    return cards
  }
}
