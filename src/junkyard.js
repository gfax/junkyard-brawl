const Player = require('./player')

module.exports = class Junkyard {
  constructor(playerId, playerName = 'Bob') {
    const manager = new Player(playerId, playerName)
    this.manager = manager
  }

  printManager() {
    return this.manager
  }
}
