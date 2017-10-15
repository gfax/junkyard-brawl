/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.start()

const [player1, player2] = game.players
const uppercut = Deck.getCard('uppercut')
const mattress = Deck.getCard('mattress')
player1.hand.push(uppercut)
player2.hand.push(mattress)
player2.hp = player2.maxHp + 6
game.play(player1.id, uppercut)
game.play(player2.id, mattress)
