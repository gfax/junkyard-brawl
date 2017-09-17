const _ = require('lodash')
const Deck = require('./deck')
const Language = require('./language')
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

    // Callback to pipe game announcements through
    this.announceCallback = announceCallback
    // Freshly shuffled cards
    this.deck = Deck.generate()
    // Cards that were discarded
    this.discard = []
    // Players not allowed to rejoin
    this.dropouts = []
    // Language to announce things in
    this.language = language
    // Set commencing user as the first player and game manager
    this.manager = new Player(playerId, playerName)
    // Players currently in the game
    this.players = [this.manager]
    // Slot machine damage
    this.slots = []
    // Time the game started
    this.started = false
    // Player currently being attacked
    this.target = null
    // Name of the game
    this.title = gameTitle
    // Total turns taken
    // Callback to pipe private messages through
    this.whisperCallback = whisperCallback

    this.announce('game:created')
  }

  addPlayer(id, name) {
    const player = new Player(id, name)
    this.players.push(player)
    this.announce('player:joined', { player })
    return player
  }

  announce(code, extraWords = {}) {
    // We gotta pass some variables in to build the phrases
    // the extra words are to identify current things like
    // the target or stats.
    this.announceCallback(code, this.getPhrase(code, extraWords))
  }

  announceStats() {
    const stats = this.players.map((player) => {
      return `${player.name} (${player.hp})`
    })
    this.announceCallback('player:stats', stats.join(', '))
  }

  deal(player) {
    const numberToDeal = player.handMax - player.hand.length
    if (numberToDeal > 0) {
      _.times(numberToDeal, () => {
        if (this.deck.length < 1) {
          this.shuffleDeck()
        }
        player.hand.push(this.deck.pop())
      })
    }
  }

  getDropout(id) {
    return _.find(this.dropouts, { id })
  }

  getPhrase(code, extraWords) {
    return Language.getPhrase(code, this.language)(
      _.assign({
        game: this,
        player: this.players[0].name
      }, extraWords)
    )
  }

  getPlayer(id) {
    return _.find(this.players, { id })
  }

  incrementTurn() {
    this.players = [..._.tail(this.players), this.players[0]]
    this.turns += 1
    this.players[0].turns += 1
    this.announceStats()
    this.announce('game:turn', {
      player: this.players[0]
    })
  }

  performTurn(player, target, cards) {
    _.remove(player.hand, cards)
    player.discard = cards
    this.target = target
    player.discard.forEach((card) => {
      card.onContact(player, target, this)
    })
  }

  // This simply processes requests and
  // passes it to the appropriate method.
  play(playerId, targetId, cards) {
    const player = this.getPlayer(playerId)
    const target = this.getPlayer(targetId)
    // This person is not playing the game
    if (!player) {
      return
    }
    if (this.players[0].id !== playerId) {
      this.announce('player:not-turn', { player })
      return
    }
    if (this.target) {
      return
    }
    if (!target) {
      this.announce('player:invalid-target')
      return
    }
    this.performTurn(player, target, cards)
  }

  removePlayer(id) {
    const index = _.findIndex(this.players, { id })
    const player = this.players.pop(index)
    this.dropouts.push(player)
    this.announce('player:dropped', { player })
    return player
  }

  shuffleDeck() {
    if (!this.discard.length) {
      this.deck = this.deck.concat(Deck.generate())
      this.announce('deck:increased')
      return
    }
    this.deck.concat(_.shuffle(this.discard))
    this.discard = []
    this.announce('deck:shuffle')
  }

  start() {
    if (this.started) {
      this.announce('game:invalid-start')
      return
    }
    if (this.players.length < 2) {
      this.announce('game:invalid-number-of-players')
      return
    }
    this.players = _.shuffle(this.players)
    this.players.forEach(player => this.deal(player))
    this.incrementTurn()
    this.started = new Date()
  }

  whisper(player, code, extraWords = {}) {
    this.whisperCallback(player.id, code, this.getPhrase(code, extraWords))
  }

}
