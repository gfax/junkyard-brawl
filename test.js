/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.start()

const [player1, player2] = game.players
const tire = Deck.getCard('tire')
const tireIron = Deck.getCard('tire-iron')
player1.hand.push(tireIron)
player2.hand.push(tire)
game.play(player1.id, tireIron)
game.play(player2.id, tire)
