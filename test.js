/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.addPlayer('player3', 'Jimbo')
game.addPlayer('player4', 'Dark')
game.start()

const [, player2] = game.players
const reverse = Deck.getCard('reverse')
player2.hand.push(reverse)
game.play(player2, reverse)
