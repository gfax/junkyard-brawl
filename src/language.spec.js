const Ava = require('ava')
const Language = require('./language')

Ava.test('getPhrase() Should return a function for the given code and language', (t) => {
  t.is(typeof Language.getPhrase('game:created', 'en'), 'function')
})

Ava.test('getPhrase() Should render a phrase from the template function', (t) => {
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

Ava.test('getPhrase() Should throw errors without adequate word key', (t) => {
  t.throws(() => {
    Language.getPhrase('game:created', 'en')()
  })
})

Ava.test('getPhrase() Should throw errors when given an invalid code', (t) => {
  t.throws(() => {
    Language.getPhrase('foobar', 'en')({})
  })
})

Ava.test('printCards() Should pretty-print the given cards', (t) => {
  const cardString = Language.printCards({ id: 'gut-punch' }, 'en')
  t.is(cardString, 'Gut Punch')
  const cardString2 = Language.printCards([
    { id: 'gut-punch' },
    { id: 'neck-punch' }
  ], 'en')
  t.is(cardString2, 'Gut Punch, Neck Punch')
})

Ava.test('printCards() Should index cards when specified', (t) => {
  const cardString = Language.printCards({ id: 'gut-punch' }, 'en')
  t.is(cardString, 'Gut Punch')
  const cardString2 = Language.printCards([
    { id: 'gut-punch' },
    { id: 'neck-punch' }
  ], 'en', true)
  t.is(cardString2, '1) Gut Punch 2) Neck Punch')
})
