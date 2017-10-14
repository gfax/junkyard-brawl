/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.start()

let [player1] = game.players
let player2 = null
const deflector = Deck.getCard('deflector')
const gutPunch = Deck.getCard('gut-punch')
const mirror = Deck.getCard('mirror')
player1.hand.push(deflector)
game.play(player1.id, deflector)
if (player1.conditionCards.length) {
  game.incrementTurn()
}
[player1, player2] = game.players
player1.hand.push(mirror)
player2.hand.push(gutPunch)
game.incrementTurn()
game.play(player2.id, gutPunch)
game.play(player1.id, mirror)
