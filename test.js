/* eslint no-console: off */
// const _ = require('lodash')
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.addPlayer('player3', 'Jimbo')
game.removePlayer('player2')
game.addPlayer('player2', 'Kevin')
const [player1, player2] = game.players
player1.hp = 2
player2.hp = 2

game.start()
game.players[0].hand.push(Deck.getCard('the-bees'))
game.play(game.players[0].id, [Deck.getCard('the-bees')])
game.incrementTurn()
game.incrementTurn()
game.incrementTurn()
game.incrementTurn()
game.incrementTurn()
game.incrementTurn()
