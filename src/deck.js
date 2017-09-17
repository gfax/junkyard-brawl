const _ = require('lodash')

module.exports = {
  generate,
  getCard
}

const deck = [
  {
    id: 'gut-punch',
    copies: 10,
    type: 'attack',
    onContact: (player, target, game) => {
      target.hp -= 2
      game.announce('card:gut-punch:on-contact', {
        player,
        target
      })
    }
  }
]

function generate() {
  return _.shuffle(deck.reduce((acc, card) => {
    _.times(card.copies, () => acc.push(card))
    return acc
  }, []))
}

function getCard(id) {
  return _.find(deck, { id })
}
