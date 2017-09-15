const _ = require('lodash')

module.exports = {
  generate
}

const cards = {
  gutPunch: {
    type: 'attack',
    onContact: (announce, target) => {
      target.health -= 2
      announce('card:gut-punch:on-contact')
    }
  }
}

function generate() {
  return _.shuffle([
    cards.gutPunch
  ])
}
