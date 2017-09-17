const _ = require('lodash')

module.exports = {
  generate,
  getCard
}

const deck = {
  gutPunch: {
    id: 'gut-punch',
    type: 'attack',
    onContact: (player, target, game) => {
      target.hp -= 2
      game.announce('card:gut-punch:on-contact', {
        player,
        target
      })
    }
  }
}

function generate() {
  return _.shuffle([
    deck.gutPunch
  ])
}

function getCard(id) {
  return _.find(deck, { id })
}
