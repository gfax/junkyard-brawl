const Deck = require('./deck')
const Player = require('./player')

module.exports = class Junkyard {
  constructor(playerId, playerName = 'Bob') {
    this.deck = Deck.generate()
    this.dropouts = [] // Players not allowed to rejoin
    this.players = [] // Players currently in the game
    // Set commencing user as the first player and game manager
    this.manager = this.addPlayer(playerId, playerName)
    this.slots = [] // Slot machine damage
    this.started = false // Time the game started
    this.target = null // Player currently being attacked
  }

  addPlayer(playerId, playerName) {
    const player = new Player(playerId, playerName)
    this.players.push(player)
    return player
  }

}
