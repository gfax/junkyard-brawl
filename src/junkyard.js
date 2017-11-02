const Deck = require('./deck')
const Language = require('./language')
const Player = require('./player')
const {
  assign,
  clone,
  find,
  merge,
  removeOnce,
  shuffle,
  times
} = require('./util')


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
    this.discardPile = []
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
      merge(extraWords, { game: this })
    )
  }

  announcePlayed(player, target, cards) {
    this.announce('player:played', {
      cards: Language.printCards(cards, this.language),
      player,
      target
    })
    this.whisperStats(target)
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

  contact(player, target, cards, discarding = true) {
    if (typeof discarding !== 'boolean') {
      throw new Error(`Expected discarding to be boolean, got ${typeof discarding}`)
    }
    // Before-contact conditions (ie, Deflector)
    target.beforeContact
      .concat([
        () => {
          // Discard any cards returned. Some cards aren't discarded
          // when played so we only discard what we're given back.
          const discard = cards[0].contact(player, target, cards, this) || []
          // A few rare cases where we are duplicating an attack,
          // ie Mirror, we don't want to re-discard the cards.
          if (discarding === true) {
            discard.forEach(card => this.discardPile.push(card))
          }
        }
      ])
      .reduce((bool, condition) => {
        // 5th param is the boolean on whether or not to discard
        // Cards that are proxying contact like "Deflector" need
        // to carry over this information in the event a "Mirror"
        // is played and discarding again would create duplicates.
        return bool && condition(player, target, cards, this, discarding)
      }, true)
    // After-contact conditions (ie, Mirror)
    target.afterContact
      .reduce((bool, condition) => {
        return bool && condition(player, target, cards, this)
      }, true)
    this.cleanup()
  }

  deal(player, numberToDeal = player.maxHand - player.hand.length) {
    if (numberToDeal > 0) {
      times(numberToDeal, () => {
        if (this.deck.length < 1) {
          shuffleDeck(this)
        }
        player.hand.push(this.deck.pop())
      })
      // If the game hasn't started yet, then this is the initial
      // deal to all the players and we don't need to announce that.
      if (this.started) {
        this.announce('player:deal', { number: numberToDeal, player })
      }
    }
  }

  // Allow player to discard on their turn and get better cards.
  discard(playerId, cardRequest = []) {
    if (!this.started || this.stopped) {
      return
    }
    const player = this.getPlayer(playerId)
    // This person is not playing the game
    if (!player) {
      return
    }
    // Only the turn player can discard
    if (player !== this.players[0]) {
      this.whisper(player, 'player:not-turn')
      return
    }
    let cards = Deck.parseCards(player, cardRequest, true)
    if (!cards.length) {
      cards = clone(player.hand)
    }
    cards.forEach((card) => {
      removeOnce(player.hand, card)
      this.discardPile.push(card)
    })
    this.announce('player:discard', {
      cards: Language.printCards(cards, this.language),
      player
    })
    this.deal(player)
    this.incrementTurn()
  }

  getDropout(id) {
    if (typeof id === 'object') {
      return find(this.dropouts, id)
    }
    return find(this.dropouts, { id })
  }

  getPhrase(code, extraWords) {
    return Language.getPhrase(code, this.language)(
      assign({
        game: this,
        player: (this.players[0] || {}).name
      }, extraWords)
    )
  }

  getPlayer(id) {
    if (typeof id === 'object') {
      return find(this.players, id)
    }
    return find(this.players, { id })
  }

  incrementTurn() {
    if (this.stopped) {
      return
    }
    this.players[0].discard = []
    if (this.target) {
      this.target.discard = []
      // Silently prune dead player and return if the game stopped
      this.cleanup()
      if (this.stopped) {
        return
      }
      this.target = null
    }
    // Player probably played a card like spare bolts,
    // so they go again instead of rotating players.
    if (this.players[0].extraTurns) {
      this.players[0].extraTurns -= 1
    } else {
      // Otherwise, rotate the players array
      this.players = [...this.players.slice(1), this.players[0]]
    }
    this.cleanup()
    if (this.stopped) {
      return
    }
    this.turns += 1
    this.players[0].turns += 1
    this.announceStats()
    const [player] = this.players
    this.deal(player)
    // Condition callbacks should return true or false. If false, the
    // callback chain is interrupted (ie., perhaps the played died.)
    player.beforeTurn
      .reduce((bool, condition) => bool && condition(player, this), true)
    if (player.hp < 1) {
      this.cleanup()
      return
    }
    // Maybe skip this player
    if (player.missTurns) {
      player.missTurns -= 1
      this.announce('player:miss-turn', { player })
      this.incrementTurn()
    } else {
      this.announce('game:turn', { player })
      this.whisperStats(player.id)
    }
  }

  // Check for a game tie, otherwise clean up any dead players
  cleanup() {
    const survivors = this.players.filter(player => player.hp > 0).length
    if (survivors === 0) {
      this.stop(false)
      this.announce('game:no-survivors')
    }
    // Clone the player array, as it may
    // shift around when removing players
    clone(this.players).forEach((player) => {
      if (player.hp < 1) {
        this.removePlayer(player.id, true)
      }
    })
  }

  pass(playerId) {
    if (!playerId) {
      throw new Error(`Expected player or played id when passing, got ${playerId}`)
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
      return
    }
    // Turn player cannot pass without playing first
    if (!this.target) {
      this.whisper(player, 'player:no-passing')
      return
    }
    // Let the target pass, but only if he hasn't played an attack/counter
    if (player.discard.length) {
      this.whisper(player, 'player:already-played')
      return
    }
    if (player === this.target) {
      this.contact(turnPlayer, player, turnPlayer.discard)
    // The target must have played a counter like Grab
    } else {
      this.contact(this.target, turnPlayer, this.target.discard)
    }
    this.incrementTurn()
  }

  // This simply processes requests and
  // passes it to the appropriate method.
  play(playerId, cardRequest = [], targetId) {
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
      return false
    }
    const cards = Deck.parseCards(player, cardRequest)
    // Disaster can (only) be played when there is no target
    if (!this.target && cards[0].disaster) {
      return playDisaster(player, cards, this)
    }
    if (this.players[0] !== player && !this.target) {
      this.whisper(player, 'player:not-turn')
      return false
    }
    // Countering the first play
    if (this.target && this.target === player) {
      return playCounter(player, cards, this)
    }
    let target = null
    if (cards[0].type === 'support') {
      return playSupport(player, cards, this)
    }
    // Assume the target is the only other player
    if (this.players.length === 2) {
      [, target] = this.players
    } else {
      target = this.getPlayer(targetId)
    }
    // Make sure a target was specified
    if (!target) {
      this.whisper(player, 'player:invalid-target')
      return false
    }
    // Card can only be played if it has a play function.
    // This is typically an Attack or Unstoppable, but
    // could also be a "Grab" card.
    if (!cards[0].play) {
      this.whisper(player, 'player:invalid-play')
      return false
    }

    [
      // Pre-play check
      () => {
        if (cards[0].validatePlay) {
          return cards[0].validatePlay(player, target, cards, this)
        }
        return true
      },

      () => {
        this.target = target
        player.discard = cards
        cards.forEach(card => removeOnce(player.hand, { id: card.id }))
        cards[0].play(player, target, cards, this)
      }
    ].reduce((bool, fn) => bool && fn(), true)
  }

  removePlayer(id, died = false) {
    if (this.stopped) {
      return
    }
    const player = this.getPlayer(id)
    if (!player) {
      throw new Error('Cannot remove invalid player: ${id}')
    }
    const wasTurnPlayer = player === this.players[0]
    removeOnce(this.players, player)
    // Announce what cards the player had
    if (player.hand.length) {
      announceDiscard(player, this)
      this.discardPile = this.discardPile.concat(player.hand)
      player.hand = []
    }
    this.dropouts.push(player)
    // Relinquish all attached cards back to the discard
    this.discardPile = this.discardPile.concat(player.conditionCards)
    this.announce(`player:${died ? 'died' : 'dropped'}`, { player })
    // No more opponents left
    if (this.started && this.players.length < 2) {
      if (died) {
        this.announce('game:winner', { player: this.players[0] })
      }
      this.stop(!died)
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
    this.players = shuffle(this.players)
    this.players.forEach((player) => {
      this.deal(player)
      // Whisper everyone their stats, except the next player
      // in the array, because it's about to be their turn and
      // they will get whispered their cards when that happens.
      if (player !== this.players[1]) {
        this.whisperStats(player.id)
      }
    })
    this.incrementTurn()
    this.started = new Date()
  }

  stop(announce = true) {
    if (this.stopped) {
      return
    }
    this.stopped = new Date()
    if (announce) {
      this.announce('game:stopped')
    }
  }

  transferManagement(playerId) {
    if (this.stopped) {
      return
    }
    const oldManager = clone(this.manager)
    const newManager = this.getPlayer(playerId)
    if (newManager) {
      this.manager = newManager
    } else {
      [this.manager] = this.players
    }
    this.announce('game:transferred', { player: oldManager })
  }

  whisper(player, code, extraWords = {}) {
    const words = merge({
      game: this,
      player
    }, extraWords)
    this.whisperCallback(
      player.id,
      code,
      this.getPhrase(code, words),
      merge(words)
    )
  }

  whisperStats(playerId) {
    if (!playerId) {
      throw new Error(`Expected player or player id, got ${playerId}`)
    }
    const player = this.getPlayer(playerId)
    if (player) {
      this.whisper(
        player,
        'player:stats',
        {
          cards: Language.printCards(player.hand, this.language, true)
        }
      )
    }
  }

}

/* *** Private Functions *** */

function announceDiscard(player, game) {
  game.announce('player:discard', {
    cards: Language.printCards(player.hand, game.language),
    player
  })
}

function playCounter(player, cards, game) {
  if (!cards) {
    throw new Error(`Expected cards, got: ${cards}`)
  }
  if (!cards[0].counter) {
    game.whisper(player, 'player:invalid-counter')
    return
  }
  let attacker = game.target
  if (player === game.target) {
    [attacker] = game.players
  }
  if (cards[0].validateCounter) {
    if (!cards[0].validateCounter(player, attacker, cards, game)) {
      return
    }
  }
  // Take the cards out of the player's hand and put
  // any previous discard into the main discard pile
  cards.forEach(card => removeOnce(player.hand, card))
  // player.discard.forEach(card => game.discardPile.push(card))
  player.discard = cards
  // Discard any cards returned. Some cards aren't discarded
  // when played so we only discard what we're given back.
  const discard = cards[0].counter(player, attacker, cards, game) || []
  discard.forEach(card => game.discardPile.push(card))
}

function playDisaster(player, cards, game) {
  cards.forEach(card => removeOnce(player.hand, card))
  // Discard any cards returned. Some cards aren't discarded
  // when played so we only discard what we're given back.
  const discard = cards[0].disaster(player, cards, game) || []
  discard.forEach(card => game.discardPile.push(card))
}

function playSupport(player, cards, game) {
  if (cards[0].validateContact) {
    // Check the validity of playing this card, for example,
    // a player's hp must be exactly 1 to play Surgery.
    if (!cards[0].validateContact(player, player, cards, game)) {
      return
    }
  }
  cards.forEach(card => removeOnce(player.hand, card))
  // Discard any cards returned. Some cards aren't discarded
  // when played so we only discard what we're given back.
  const discard = game.contact(player, player, cards) || []
  discard.forEach(card => game.discardPile.push(card))
  game.incrementTurn()
}

function shuffleDeck(game) {
  if (!game.discardPile.length) {
    game.deck = game.deck.concat(Deck.generate())
    game.announce('deck:increased')
    return
  }
  game.deck = game.deck.concat(shuffle(game.discardPile))
  game.discardPile = []
  game.announce('deck:shuffled')
}
