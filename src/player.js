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
    // Array of callbacks to trigger pre-fight
    this.beforeTurn = []
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
    // Display name
    this.name = name
    // Turns spent playing this game
    this.turns = 0
  }
}
