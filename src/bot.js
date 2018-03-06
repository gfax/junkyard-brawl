const {
  getPlayerCounters,
  getPlayerDisasters,
  getPlayerPlays
} = require('./util')

module.exports = class Bot {

  constructor(name, game) {
    if (typeof name !== 'string') {
      throw new Error(`Invalid bot name provided: ${name}`)
    }
    if (!game || typeof game !== 'object' || !game.players) {
      throw new Error(`Invalid game object provided: ${game}`)
    }

    // Give the bot a unique ID
    while (!isUnique(this.id, game)) {
      this.id = generateId()
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
    // Player gets to go again if they have any extra turns
    this.extraTurns = 0
    // Reference to the game instance object
    this.game = game
    // Cards in hand
    this.hand = []
    // Starting health
    this.hp = game.maxHp
    // Max number of cards to deal up to
    this.maxHand = 5
    // Maximum hp the player is allowed to accumulate
    this.maxHp = game.maxHp
    // Tracker for determining how many turns will be missed
    this.missTurns = 0
    // Display name for the bot
    this.name = name
    // Flag so applications can check if this user is a bot
    this.robot = true
    // Turns spent playing this game
    this.turns = 0
    // Event hook listener for bot-relevant game events
    this.announceCallback = generateAnnounceCallback(this, game)
  }

}

function isUnique(id, game) {
  if (!id) {
    return false
  }
  return game.players.reduce((acc, player) => {
    return id !== player.id
  }, true)
}

function generateId() {
  return (new Date()).getTime().toString() + Math.floor(Math.random() * 1e3)
}

function generateAnnounceCallback(bot, game) {
  return (code, messageProps) => {
    const methods = {
      'card:dodge:new-target': counter,
      'card:grab:play': counter,
      'game:turn': play,
      'player:played': counter
    }
    if (methods[code]) {
      methods[code](messageProps)
    }
  }

  function counter(messageProps) {
    if (messageProps.target !== bot) {
      return
    }
    const moves = getPlayerCounters(bot, messageProps.attacker || messageProps.player, game)
    /*
    console.log('valid counters: ', moves.map((move) => {
      const cards = move.cards.map(card => card.id).join(', ')
      return `${cards} - ${move.weight}`
    }))
    */
    if (moves.length && moves[0].weight >= 1) {
      game.play(bot, moves[0].cards)
      return
    }
    game.pass(bot)
  }

  function play(messageProps) {
    const disasters = getPlayerDisasters(bot, game)
    /*
    console.log('valid disasters: ', disasters.map((disaster) => {
      const cards = disaster.cards.map(card => card.id).join(', ')
      return `${cards} - ${disaster.weight}`
    }))
    */
    if (disasters.length && disasters[0].weight > 2) {
      game.play(bot, disasters[0].cards)
      play(messageProps)
      return
    }

    if (messageProps.player !== bot) {
      return
    }

    const plays = getPlayerPlays(bot, game)
    /*
    console.log('valid plays: ', plays.map((move) => {
      const cards = move.cards.map(card => card.id).join(', ')
      return `${cards} - ${move.target.name} - ${move.weight}`
    }))
    */
    if (plays.length && plays[0].weight >= 2) {
      game.play(bot, plays[0].cards, plays[0].target)
      return
    }
    game.discard(bot, bot.hand)
  }
}
