const Ava = require('ava')
const Util = require('./util')

Ava.test('findNext() should return the next item in an array', (t) => {
  const array = ['a', 'b', 'c', 'd', 'e']
  t.is(Util.findNext(array, 'a'), 'b')
  t.is(Util.findNext(array, 'c'), 'd')
})

Ava.test('findNext() should return the first item in an array if there is no next', (t) => {
  const array = ['a', 'b', 'c', 'd', 'e']
  t.is(Util.findNext(array, 'e'), 'a')
})

Ava.test('removeOnce() should remove only one copy of an item from an array', (t) => {
  const array = [1, 2, 3, 4, 5, 4]
  Util.removeOnce(array, el => el === 4)
  t.deepEqual(
    array,
    [1, 2, 3, 5, 4]
  )
})

Ava.test('removeOnce() shouldn\'t touch an array with a false predicate', (t) => {
  const array = [1, 2, 3]
  Util.removeOnce(array, el => el === 4)
  t.deepEqual(
    array,
    [1, 2, 3]
  )
})
