/* eslint no-console: off */
// const _ = require('lodash')
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.start()

const [player1, player2] = game.players
player1.hand.push(Deck.getCard('grab'))
player1.hand.push(Deck.getCard('gut-punch'))
player2.hand.push(Deck.getCard('dodge'))

game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
game.play(player2.id, [Deck.getCard('dodge')])
