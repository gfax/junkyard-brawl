/* eslint no-console: off */
const Deck = require('./src/deck')
const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('player1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('player2', 'Kevin')
game.start()

const [player1] = game.players
const grab = Deck.getCard('grab')
const sleep = Deck.getCard('sleep')
const avalanche = Deck.getCard('avalanche')
player1.hp = 2
player1.hand.push(grab)
player1.hand.push(sleep)
player1.hand.push(avalanche)
game.play(player1.id, [grab, sleep, avalanche])
