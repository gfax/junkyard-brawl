const Ava = require('ava')
const Language = require('./language')

Ava.test('Should return a function for the given code and language', (t) => {
  t.is(typeof Language.getPhrase('game:created', 'en'), 'function')
})

Ava.test('Should render a phrase from the template function', (t) => {
  const phrase = Language.getPhrase('game:created', 'en')({
    game: {
      manager: {
        name: 'Jay'
      },
      title: 'Junkyard Brawl'
    }
  })
  t.is(phrase, 'A new game of Junkyard Brawl has been created by Jay.')
})

Ava.test('Should throw errors without adequate word key', (t) => {
  t.throws(() => {
    Language.getPhrase('game:created', 'en')()
  })
})

Ava.test('Should throw errors when given an invalid code', (t) => {
  t.throws(() => {
    Language.getPhrase('foobar', 'en')({})
  })
})

Ava.test('Should pretty-print the given cards', (t) => {
  const cardString = Language.printCards({ id: 'gut-punch' }, 'en')
  t.is(cardString, 'Gut Punch')
  const cardString2 = Language.printCards([
    { id: 'gut-punch' },
    { id: 'neck-punch' }
  ], 'en')
  t.is(cardString2, 'Gut Punch, Neck Punch')
})
