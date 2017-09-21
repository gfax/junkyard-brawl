/* eslint no-console: off */
// const _ = require('lodash')
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('user2', 'Kevin')
game.start()

const [player1, player2] = game.players
player1.hand.push(Deck.getCard('grab'))

game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
game.play(player2.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
game.play(player1.id, [Deck.getCard('grab'), Deck.getCard('gut-punch')])
game.pass(player2.id)
