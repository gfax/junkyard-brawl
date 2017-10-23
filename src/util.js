// JunkyardBrawl helper functions
const Util = module.exports = {
  assign: require('lodash.assign'),
  clone: require('lodash.clone'),
  find: require('lodash.find'),
  findIndex: require('lodash.findindex'),
  findNext,
  flow: require('lodash.flow'),
  map: require('lodash.map'),
  merge: require('lodash.merge'),
  removeOnce,
  sample: require('lodash.sample'),
  shuffle: require('lodash.shuffle'),
  template: require('lodash.template'),
  times: require('lodash.times'),
  uniq: require('lodash.uniq')
}

// Return the next item in an array. If there is no next, return the first.
function findNext(array, item) {
  return array[(Util.findIndex(array, el => el === item) + 1) % array.length]
}

// Remove one copy of an item from an array. Similar to lodash's remove(), but
// we don't want to remove all copies a user may have of a card, for instance.
function removeOnce(array, predicate) {
  const idx = Util.findIndex(array, predicate)
  if (idx !== -1) {
    array.splice(idx, 1)
  }
}
