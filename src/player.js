const maxHp = 10

module.exports = class Player {
  constructor(id, name) {
    if (!id) {
      throw new Error('No player ID provided')
    }
    if (typeof name !== 'string') {
      throw new Error('Invalid player name provided: ' + name)
    }
    this.hand = [] // Cards in hand
    this.handMax = 5 // Max number of cards to deal up to
    this.hp = maxHp // Starting health
    this.id = id // Unique player ID
    this.name = name // Display name
    this.turns = 0 // Turns spent playing this game
  }
}
