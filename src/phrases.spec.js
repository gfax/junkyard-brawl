const Ava = require('ava')
const Phrases = require('./phrases')

Ava.test('Should return a function for the given code and language', (t) => {
  t.is(typeof Phrases.getPhrase('game:created', 'en'), 'function')
})

Ava.test('Should render a phrase from the template function', (t) => {
  const phrase = Phrases.getPhrase('game:created', 'en')({
    manager: 'Jay',
    title: 'Junkyard Brawl'
  })
  t.is(phrase, 'A new game of Junkyard Brawl has been created by Jay.')
})

Ava.test('Phrases should throw errors without adequate word key', (t) => {
  t.throws(() => {
    Phrases.getPhrase('game:created', 'en')()
  })
})
