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
const uppercut = Deck.getCard('uppercut')
const insurance = Deck.getCard('insurance')
player1.hand.push(uppercut)
player1.hand.push(grab)
player2.hand.push(insurance)
player2.hp = 5
game.play(player1.id, [grab, uppercut])
game.play(player2.id, insurance)
