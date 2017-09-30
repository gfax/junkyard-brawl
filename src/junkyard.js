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
    // Time the game started
    this.started = false
    // Time the game ended
    this.stopped = false
    // Player currently being attacked
    this.target = null
    // Name of the game
    this.title = gameTitle
    // Total turns taken
    this.turns = -1
    // Callback to pipe private messages through
    this.whisperCallback = whisperCallback

    this.announce('game:created')
  }

  addPlayer(id, name) {
    if (this.stopped) {
      return
    }
    if (this.getPlayer(id)) {
      this.whisper(this.getPlayer(id), 'player:already-joined', {
        player: this.getPlayer(id)
      })
      return
    }
    if (this.getDropout(id)) {
      this.whisper(this.getDropout(id), 'player:cannot-rejoin', {
        player: this.getDropout(id)
      })
      return
    }
    const player = new Player(id, name)
    this.players.push(player)
    this.announce('player:joined', { player })
    return player
  }

  announce(code, extraWords = {}) {
    // We gotta pass some variables in to build the phrases
    // the extra words are to identify current things like
    // the target or stats.
    this.announceCallback(
      code,
      this.getPhrase(code, extraWords),
      _.merge(extraWords, { game: this })
    )
  }

  announceStats() {
    const stats = this.players.map((player) => {
      return `${player.name} (${player.hp})`
    })
    this.announceCallback(
      'player:stats',
      stats.join(', '),
      { game: this }
    )
  }

  counter(player, cards) {
    if (!cards) {
      throw new Error(`Expected cards, got: ${cards}`)
    }
    let attacker = this.target
    if (player === this.target) {
      [attacker] = this.players
    }
    // Take the cards out of the player's hand and put
    // any previous discard into the main discard pile
    _.remove(player.hand, card => _.find(cards, card))
    this.discard = this.discard.concat(player.discard)
    player.discard = cards
    // One special situation with being grabbed is if the
    // opponent has a hidden unstoppable card, the counter
    // will be wasted.
    if (attacker.discard[0].id === 'grab' && attacker.discard[1].type === 'unstoppable') {
      // Discard whaetever he played and treat it as if he passed
      this.discard = this.discard.concat(cards)
      player.discard = []
      this.announce('player:counter-failed', {
        cards: Language.printCards(cards, this.language),
        player
      })
      this.pass(player.id)
      return
    }
    cards[0].counter(player, attacker, cards, this)
  }

  deal(player) {
    const numberToDeal = player.maxHand - player.hand.length
    if (numberToDeal > 0) {
      _.times(numberToDeal, () => {
        if (this.deck.length < 1) {
          shuffleDeck(this)
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
        player: (this.players[0] || {}).name
      }, extraWords)
    )
  }

  getPlayer(id) {
    return _.find(this.players, { id })
  }

  incrementTurn() {
    if (this.stopped) {
      return
    }
    this.discard = this.discard.concat(this.players[0].discard)
    this.players[0].discard = []
    if (this.target) {
      this.discard = this.discard.concat(this.target.discard)
      this.target.discard = []
      // Silently prune dead player and return if the game stopped
      if (maybeRemove(this.target, this) && this.stopped) {
        return
      }
      this.target = null
    }
    this.players = [..._.tail(this.players), this.players[0]]
    if (maybeRemove(this.players[0], this) && this.stopped) {
      return
    }
    this.turns += 1
    this.players[0].turns += 1
    this.announceStats()
    const [player] = this.players
    // Condition callbacks should return true or false. If false, the
    // callback chain is interrupted (ie., perhaps the played died.)
    player.beforeTurn.concat([
      () => {
        this.announce('game:turn', { player })
        this.whisperStats(player.id)
      }
    ]).reduce((bool, condition) => bool && condition(player, this), true)
    maybeRemove(this.players[0], this)
  }

  pass(playerId) {
    if (typeof playerId !== 'string') {
      throw new Error(`Expected played id when passing, got ${playerId}`)
    }
    if (!this.started) {
      return
    }
    const player = this.getPlayer(playerId)
    const [turnPlayer] = this.players
    // Ignore dropouts and others non-players
    if (!player) {
      return
    }
    // Ignore players that aren't currently engaged in a move
    if (player !== turnPlayer && player !== this.target) {
      this.whisper(player, 'player:not-turn')
    }
    if (!this.target && playerId === turnPlayer.id) {
      this.whisper(player, 'player:no-passing')
      return
    }
    // Let the target pass, but only if he hasn't played a counter
    if (player === this.target && player.discard.length) {
      this.whisper(player, 'player:already-played')
      return
    }
    if (player === this.target) {
      contact(turnPlayer, player, turnPlayer.discard, this)
    // The target must have played a counter like Grab
    } else if (player === turnPlayer && this.target.discard) {
      contact(this.target, turnPlayer, this.target.discard, this)
    }
    this.incrementTurn()
  }

  // This simply processes requests and
  // passes it to the appropriate method.
  play(playerId, cardRequest, targetId) {
    if (this.stopped) {
      return
    }
    const player = this.getPlayer(playerId)
    // This person is not playing the game
    if (!player) {
      return
    }
    // Turn-player played some cards; waiting for target to respond
    if (player === this.players[0] && player.discard.length) {
      return
    }
    if (!this.started) {
      this.whisper(player, 'player:not-started')
      return
    }
    const cards = Deck.parseCards(player, cardRequest)
    // Disaster can (only) be played when there is no target
    if (!this.target && cards[0].type && cards[0].type === 'disaster') {
      cards[0].disaster(player, cards, this)
      return
    }
    if (this.players[0].id !== playerId && !this.target) {
      this.whisper(player, 'player:not-turn')
      return
    }
    // Countering the first play
    if (this.target && this.target === player) {
      this.counter(player, cards)
      return
    }
    let target = null
    if (cards[0].type === 'support') {
      contact(player, target, cards, this)
      this.incrementTurn()
      return
    }
    // Assume the target is the only other player
    if (this.players.length === 2) {
      [, target] = this.players
    } else {
      target = this.getPlayer(targetId)
    }
    if (!target) {
      this.whisper(player, 'player:invalid-target')
      return
    }
    // This can probably be factored out and just check
    // whether a card has a "play" function on it.
    if (cards[0].type === 'counter' && cards[0].id !== 'grab') {
      this.whisper(player, 'player:invalid-play')
      return
    }
    this.target = target
    player.discard = cards
    _.remove(player.hand, card => _.find(player.discard, card))
    cards[0].play(player, target, cards, this)
  }

  removePlayer(id, silent = false) {
    if (this.stopped) {
      return
    }
    const player = this.getPlayer(id)
    if (!player) {
      throw new Error('Cannot remove invalid player: ${id}')
    }
    const wasTurnPlayer = player === this.players[0]
    _.remove(this.players, player)
    this.dropouts.push(player)
    if (!silent) {
      this.announce('player:dropped', { player })
    }
    // No more opponents left
    if (this.started && this.players.length < 2) {
      this.stop()
      return
    }
    // Nobody wants to start a game
    if (!this.players.length) {
      this.stop()
      return
    }
    if (this.manager === player) {
      this.transferManagement()
    }
    // Let the new turn player know its their turn now
    if (wasTurnPlayer) {
      this.announce('game:turn', { player: this.players[0] })
    }
  }

  start() {
    if (this.stopped) {
      return
    }
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

  stop() {
    if (this.stopped) {
      return
    }
    this.stopped = new Date()
    this.announce('game:stopped')
  }

  transferManagement(playerId) {
    if (this.stopped) {
      return
    }
    const oldManager = _.clone(this.manager)
    const newManager = this.getPlayer(playerId)
    if (newManager) {
      this.manager = newManager
    } else {
      [this.manager] = this.players
    }
    this.announce('game:transferred', { player: oldManager })
  }

  whisper(player, code, extraWords = {}) {
    const words = _.merge({
      game: this,
      player
    }, extraWords)
    this.whisperCallback(
      player.id,
      code,
      this.getPhrase(code, words),
      _.merge(words)
    )
  }

  whisperStats(playerId) {
    if (typeof playerId !== 'string') {
      throw new Error(`Expected player id to be a string, got ${playerId}`)
    }
    const player = this.getPlayer(playerId)
    if (player) {
      this.whisper(
        player,
        'player:stats',
        {
          cards: Language.printCards(player.hand, this.language)
        }
      )
    }
  }

}

function contact(player, target, cards, game) {
  cards[0].contact(
    player,
    target,
    cards,
    game
  )
  if (target) {
    target.afterContact.concat([
      () => {
        if (target.hp < 1) {
          game.announce('player:died', { player: target })
        }
      }
    ]).reduce(
      (bool, condition) => {
        return bool && condition(target, player, target.discard, game)
      },
      true
    )
  } else {
    player.afterContact.concat([
      () => {
        if (player.hp < 1) {
          game.announce('player:died', { player })
        }
      }
    ]).reduce(
      (bool, condition) => {
        return bool && condition(player, target, cards, game)
      },
      true
    )
  }
}

function maybeRemove(player, game) {
  if (player.hp < 1) {
    game.removePlayer(player.id, true)
    return true
  }
  return false
}

function shuffleDeck(game) {
  if (!game.discard.length) {
    game.deck = game.deck.concat(Deck.generate())
    game.announce('deck:increased')
    return
  }
  game.deck.concat(_.shuffle(game.discard))
  game.discard = []
  game.announce('deck:shuffled')
}
