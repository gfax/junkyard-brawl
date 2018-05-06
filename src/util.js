// JunkyardBrawl helper functions
const Util = module.exports = {
  assign: require('lodash.assign'),
  clone: require('lodash.clone'),
  baseWeight,
  find: require('lodash.find'),
  findIndex: require('lodash.findindex'),
  findNext,
  flow: require('lodash.flow'),
  getAttackResults,
  getCardWeight,
  getPlayerCounters,
  getPlayerDisasters,
  getPlayerPlays,
  merge: require('lodash.merge'),
  remove,
  sample: require('lodash.sample'),
  shuffle: require('lodash.shuffle'),
  template: require('lodash.template'),
  times: require('lodash.times'),
  uniq: require('lodash.uniq'),
  uuid: require('uuid/v4')
}

// Calculate the base weight for a card play
function baseWeight(player, target, card, game) {
  let weight = card.damage || 0
  weight += Math.min(player.maxHp - player.hp, (parseInt(card.hp) || 0))
  weight += card.missTurns / 2 || 0

  // Prefer to contact weaker targets
  weight += ((target.maxHp - player.hp) / 10)

  // Unstoppable cards are instantly more valuable
  if (card.type === 'unstoppable') {
    weight += 3
  }

  // Try to avoid contacting a target with a deflector
  if (Util.find(target.conditionCards, { id: 'deflector' })) {
    weight = -weight
  }

  return weight
}

// Return the next item in an array. If there is no next, return the first.
function findNext(array, item) {
  return array[(Util.findIndex(array, el => el === item) + 1) % array.length]
}

// Determine an attack's damages by simulating playing it
function getAttackResults(_cards) {
  // Force the cards into an array. Clone is too
  // to avoid side effects from the simulation.
  const cards = Util.clone(Array.isArray(_cards) ? _cards : [_cards])
  const Junkyard = require('./junkyard')
  const game = new Junkyard('1', '')
  game.addPlayer('2', '')
  game.addPlayer('3', '')
  game.start()
  const [p1, , p3] = game.players
  p1.hand = cards
  game.play(p1, [...cards], p3.id)
  game.pass(p3)
  return {
    damage: p3.maxHp - p3.hp,
    missTurns: p3.missTurns
  }
}

// Return a cards best weight
function getCardWeight(player, target, card, game) {
  let moves = []
  if (card.validPlays) {
    moves = card.validPlays(player, target, game)
  }
  if (card.validCounters && target.discard.length) {
    moves = card.validCounters(player, target, game)
  }
  if (card.validDisasters) {
    moves = card.validDisasters(player, game)
  }
  // Pick out the highest weight of those moves
  return moves.reduce((acc, move) => {
    return move.weight > acc ? move.weight : acc
  }, 0)
}

// Get a list of possible counter moves, sorted by best option
function getPlayerCounters(player, attacker, game) {
  return player.hand
    .map((card) => {
      return card.validCounters ? card.validCounters(player, attacker, game) : []
    })
    .reduce((acc, array) => {
      return acc.concat(array)
    }, [])
    .sort((counterA, counterB) => counterB.weight - counterA.weight)
}

// Get a list of possible disaster moves, sorted by best option
function getPlayerDisasters(player, game) {
  return player.hand
    .map((card) => {
      return card.validDisasters ? card.validDisasters(player, game) : []
    })
    .reduce((acc, array) => {
      return acc.concat(array)
    }, [])
    .sort((disasterA, disasterB) => disasterB.weight - disasterA.weight)
}

// Get a list of possible moves a player can play, sorted by best option
function getPlayerPlays(player, game) {
  // Shuffle so that equal-weighted players aren't
  // always prioritized by their turn order
  return Util.shuffle(game.players)
    .reduce((plays, target) => {
      if (player === target) {
        return plays
      }
      return plays.concat(
        player.hand
          .map((card) => {
            return card.validPlays ? card.validPlays(player, target, game) : []
          })
          .reduce((acc, array) => {
            return acc.concat(array)
          }, [])
      )
    }, [])
    .sort((playA, playB) => playB.weight - playA.weight)
}

// Remove one copy of a matched item from an array given a predicate function
function remove(array, fn) {
  const idx = array.findIndex(fn)
  if (idx !== -1) {
    array.splice(idx, 1)
  }
}
