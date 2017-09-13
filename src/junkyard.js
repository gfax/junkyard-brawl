const _ = require('lodash')
const Deck = require('./deck')
const Phrases = require('./phrases')
const Player = require('./player')


const gameTitle = 'Junkyard Brawl'

module.exports = class Junkyard {
  constructor(
    playerId,
    playerName,
    announceCallback = () => {},
    whisperCallback = () => {},
    language = 'en'
  ) {

    const languages = Phrases.getSupportedLanguages()
    if (languages.indexOf(language) === -1) {
      throw new Error(
        `Language "${language}" not supported. Use one of: ${languages}`
      )
    }

    // Callback to pipe game announcements through
    this.announceCallback = announceCallback
    // Freshly shuffled cards
    this.deck = Deck.generate()
    // Players not allowed to rejoin
    this.dropouts = []
    // Language to announce things in
    this.language = language
    // Players currently in the game
    this.players = []
    // Set commencing user as the first player and game manager
    this.manager = this.addPlayer(playerId, playerName)
    // Slot machine damage
    this.slots = []
    // Time the game started
    this.started = false
    // Player currently being attacked
    this.target = null
    // Callback to pipe private messages through
    this.whisperCallback = whisperCallback

    this.announce('game:created')
  }

  addPlayer(playerId, playerName) {
    const player = new Player(playerId, playerName)
    this.players.push(player)
    return player
  }

  announce(code, extraWords = {}) {
    // We gotta pass some variables in to build the phrases
    // the extra words are to identify current things like
    // the target or stats.
    const phrase = Phrases.getPhrase(code, this.language)(_.assign({
      manager: this.manager.name,
      player: this.players[0].name,
      title: gameTitle
    }, extraWords))
    this.announceCallback(code, phrase)
  }

  getDropout(id) {
    return _.find(this.dropouts, { id })
  }

  getPlayer(id) {
    return _.find(this.players, { id })
  }

}
