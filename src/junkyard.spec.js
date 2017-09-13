const Ava = require('ava')
const Sinon = require('sinon')
const Junkyard = require('./junkyard')

Ava.test('Should allow instantiation', (t) => {
  const game = new Junkyard('player123', 'Jay')
  t.is(typeof game.manager, 'object')
  t.is('player123', game.manager.id)
})

Ava.test('Should throw an error if passed an invalid language', (t) => {
  t.throws(() => {
    const noop = () => {}
    new Junkyard('player123', 'Jay', noop, noop, 'xyz')
  })
})

Ava.test('Should announce when a game is created', (t) => {
  const announceCallback = Sinon.spy()
  new Junkyard('player123', 'Jay', announceCallback)
  t.true(announceCallback.calledOnce)
  t.true(announceCallback.alwaysCalledWithExactly(
    'game:created',
    Sinon.match.string
  ))
})
