const Junkyard = require('./src/junkyard')

const announceCallback = (code, text) => console.log(text)
const whisperCallback = (player, code, text) => console.log(`<${player}> ${text}`)

const game = new Junkyard('user1', 'Jay', announceCallback, whisperCallback)
game.addPlayer('user2', 'Kevin')
game.start()
game.transferManagement('user2')
const [player1] = game.players
game.whisperStats(player1.id)
game.play(player1.id, [game.players[0].hand[0]])
