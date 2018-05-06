const {
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
      return Object.assign({ uid: uuid() }, card)
    }))
  }, []))
}

function getCard(id) {
  const card = find(deck, { id })
  if (!card) {
    throw new Error(`Nonexistent card type requested: ${id}`)
  }
  return Object.assign({ uid: uuid() }, card)
}

// Normalize requests into an array of card objects
// player - player instance to whom these cards belong to
// request - one of the following:
//   - card object referenced in the player's hand
//   - string of a card id of a card that is in the player's hand
//   - array of either of the above
// noCardFilter - False by default. Cards will be filtered out if they make no
//   sense in the context of play. For example, playing two Gut Punch cards, it
//   will ignore the second one. If true, all the cards will be parsed. This is
//   used to parse all cards the user is trying to discard since he is not
//   playing them.
function parseCards(player, request, noCardFilter = false) {
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
  // Hey we can just skip the rest of the checks if the player has no cards.
  if (!player.hand.length) {
    return []
  }
  if (!request || (typeof request !== 'object' && typeof request !== 'string')) {
    throw new Error(
      `Expected second parameter to be an object or non-empty string, got ${request}.`
    )
  }

  return flow([
    // Convert each potential request to an actual card reference in hand
    // by first comparing the uid, then the id if the uid is not present.
    (cardArray) => {
      return cardArray.map((requestCard) => {
        return player.hand.find((handCard) => {
          if (typeof requestCard === 'string') {
            return requestCard === handCard.uid || requestCard === handCard.id
          }
          if (requestCard.uid) {
            return requestCard.uid === handCard.uid
          }
          return requestCard.id && requestCard.id === handCard.id
        })
      })
    },
    cardArray => cardArray.filter(card => card),
    uniq,
    filterCards
  ])(Array.isArray(request) ? request : [request])
}
