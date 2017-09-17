const Junkyard = require('./junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`${player}: ${text}`)

const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('user2', 'Kevin')
game.start()
game.play('user1', 'user2', [game.players[0].hand[0]])
