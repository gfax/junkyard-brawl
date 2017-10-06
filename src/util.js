// JunkyardBrawl helper functions
const Util = module.exports = {
  assign: require('lodash.assign'),
  clone: require('lodash.clone'),
  find: require('lodash.find'),
  findIndex: require('lodash.findindex'),
  flow: require('lodash.flow'),
  last: require('lodash.last'),
  map: require('lodash.map'),
  merge: require('lodash.merge'),
  removeOnce,
  sample: require('lodash.sample'),
  shuffle: require('lodash.shuffle'),
  tail: require('lodash.tail'),
  template: require('lodash.template'),
  times: require('lodash.times'),
  uniq: require('lodash.uniq')
}

// Remove one copy of an item from an array. Similar to lodash's remove(), but
// we don't want to remove all copies a user may have of a card, for instance.
function removeOnce(array, predicate) {
  const idx = Util.findIndex(array, predicate)
  if (idx !== -1) {
    array.splice(idx, 1)
  }
}
