/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.addPlayer('player3', 'Jimbo')
game.start()

const [player1, player2, player3] = game.players
player1.hp = 1
player2.hp = 1
player3.hp = 1

player1.hand.push(Deck.getCard('earthquake'))
game.play(player1, Deck.getCard('earthquake'))
