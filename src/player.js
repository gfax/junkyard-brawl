const maxHp = 10

module.exports = class Player {
  constructor(id, name) {
    if (!id) {
      throw new Error('No player ID provided')
    }
    if (typeof name !== 'string') {
      throw new Error(`Invalid player name provided: ${name}`)
    }
    // Array of callbacks to trigger post-contact
    this.afterContact = []
    // Array of callbacks to trigger pre-contact
    this.beforeContact = []
    // Array of callbacks to trigger pre-move
    this.beforeTurn = []
    // Array of cards attached to the player while special conditions are in effect.
    // Not only does this let us see what conditions are currently applied to the player
    // for the purpose of displaying player stats, but in the event of a pre-mature death
    // the cards can be quickly collected and put in the discard pile.
    this.conditionCards = []
    // Cards in play
    this.discard = []
    // Cards in hand
    this.hand = []
    // Starting health
    this.hp = maxHp
    // Unique player ID
    this.id = id
    // Max number of cards to deal up to
    this.maxHand = 5
    // Maximum hp the player is allowed to accumulate
    this.maxHp = maxHp
    // Tracker for determining how many turns will be missed
    this.missTurns = 0
    // Display name
    this.name = name
    // Turns spent playing this game
    this.turns = 0
  }
}
