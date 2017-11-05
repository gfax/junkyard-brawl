/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.start()

const [player1, player2] = game.players
const grab = Deck.getCard('grab')
const gutPunch = Deck.getCard('gut-punch')
const block = Deck.getCard('block')
player1.hand = [block, grab, gutPunch]
player2.hand = [grab, gutPunch]
game.play(player1, [grab, gutPunch])
game.play(player2, [grab, gutPunch])
game.play(player1, block)
