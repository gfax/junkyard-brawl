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
const deflector = Deck.getCard('deflector')
const gutPunch = Deck.getCard('gut-punch')
player1.beforeContact.push(deflector.beforeContact)
player2.beforeContact.push(deflector.beforeContact)
player3.beforeContact.push(deflector.beforeContact)
player1.hand.push(gutPunch)
game.play(player1.id, [gutPunch], player2.id)
game.pass(player2.id)
