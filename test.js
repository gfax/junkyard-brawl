/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.start()
const [player1, player2] = game.players
player1.hand.push(Deck.getCard('acid-coffee'))

game.play(player1.id, [Deck.getCard('acid-coffee')])
game.pass(player2.id)
game.incrementTurn()
