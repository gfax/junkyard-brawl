const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

let phrases = null

// Get phrases document, or throw exception on error
try {
  const file = fs.readFileSync(path.join(__dirname, 'phrases.yml'), 'utf8')
  phrases = yaml.safeLoad(file)
} catch (err) {
  throw new Error(err)
}

module.exports = {
  getPhrase,
  getSupportedLanguages,
  printCards
}

function getPhrase(code, language) {
  checkLanguage(language)
  if (!phrases[code]) {
    throw new Error(`Code not found in language file: ${code}`)
  }
  return _.template(phrases[code][language])
}

function getSupportedLanguages() {
  return ['en']
}

function printCards(cards, language) {
  checkLanguage(language)
  // Ensure parameter is an array, even when one card is passed in
  const cardsToPrint = Array.isArray(cards) ? cards : [cards]
  return _.map(cardsToPrint, (card) => {
    return getPhrase(`card:${card.id}`, language)()
  }).join(', ')
}

function checkLanguage(language) {
  const languages = getSupportedLanguages()
  if (languages.indexOf(language) === -1) {
    throw new Error(
      `Language "${language}" not supported. Use one of: ${languages}`
    )
  }
}
