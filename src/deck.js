const {
  clone,
  find,
  flow,
  shuffle,
  times,
  uniq,
  uuid
} = require('./util')

module.exports = {
  generate,
  getCard,
  parseCards
}

const deck = [
  require('./cards/a-gun'),
  require('./cards/acid-coffee'),
  require('./cards/armor'),
  require('./cards/avalanche'),
  require('./cards/block'),
  require('./cards/bulldozer'),
  require('./cards/cheap-shot'),
  require('./cards/crane'),
  require('./cards/deflector'),
  require('./cards/dodge'),
  require('./cards/earthquake'),
  require('./cards/energy-drink'),
  require('./cards/gamblin-man'),
  require('./cards/gas-spill'),
  require('./cards/grab'),
  require('./cards/grease-bucket'),
  require('./cards/guard-dog'),
  require('./cards/gut-punch'),
  require('./cards/insurance'),
  require('./cards/its-getting-windy'),
  require('./cards/magnet'),
  require('./cards/mattress'),
  require('./cards/meal-steal'),
  require('./cards/mirror'),
  require('./cards/neck-punch'),
  require('./cards/reverse'),
  require('./cards/siphon'),
  require('./cards/sleep'),
  require('./cards/soup'),
  require('./cards/spare-bolts'),
  require('./cards/sub'),
  require('./cards/surgery'),
  require('./cards/the-bees'),
  require('./cards/tire'),
  require('./cards/tire-iron'),
  require('./cards/toolbox'),
  require('./cards/uppercut'),
  require('./cards/whirlwind'),
  require('./cards/wrench')
]

function generate() {
  return shuffle(deck.reduce((acc, card) => {
    return acc.concat(times(card.copies, () => {
      return Object.assign(clone(card), { uid: uuid() })
    }))
  }, []))
}

function getCard(id) {
  const card = find(deck, { id })
  if (!card) {
    throw new Error(`Nonexistent card type requested: ${id}`)
  }
  return card
}

// Normalize requests into an array of card objects
function parseCards(player, request, noCardFilter = false) {
  function checkObject(obj) {
    if (!obj.id || !obj.type) {
      throw new Error('Passed a non-card object.')
    }
  }
  // Apply any card-specific filters. For instance,
  // Gut Punch filters any card following itself
  // as it is a standalone attack.
  function filterCards(cards) {
    // Option was passed in to disabled this filter.
    // User is probably requesting to discard.
    if (noCardFilter) {
      return cards
    }
    const [head, ...tail] = cards
    if (head && head.filter) {
      return [head].concat(head.filter(tail))
    }
    return cards
  }

  if (!player || typeof player !== 'object') {
    throw new Error(`Expected first parameter to be a player, got ${player}`)
  }
  if (typeof request === 'undefined') {
    throw new Error('Cannot parse an undefined request!')
  }
  if (request === null) {
    return []
  }
  // Card object
  if (typeof request === 'object' && !Array.isArray(request)) {
    checkObject(request)
    return [request]
  }
  if (Array.isArray(request)) {
    if (!request.length) {
      return []
    }
    checkObject(request[0])
    // It's already an array of cards so just filter them now
    return filterCards(request)
  }
  if (!player.hand.length) {
    return []
  }
  return flow([
    req => req.split(' '),
    req => req.filter(elem => elem),
    uniq,
    req => req.map((word) => {
      const number = parseInt(word)
      // 1-index to 0-index
      return player.hand[number - 1]
    }),
    // Filter out undefined cards
    cards => cards.filter(card => card),
    // Apply any card-specific filters. For instance,
    // Gut Punch filters any card following itself
    // as it is a standalone attack.
    filterCards
  ])(request)
}
