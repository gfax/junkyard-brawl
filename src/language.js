const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { template } = require('./util')

let phrases = null

// Get phrases document, or throw exception on error
const file = fs.readFileSync(path.join(__dirname, 'phrases.yml'), 'utf8')
phrases = yaml.safeLoad(file)

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
  return template(phrases[code][language])
}

function getSupportedLanguages() {
  return ['en']
}

// indexed = false - Earthquake, Block, Grab...
// indexed = true - 1.) Earthquake 2.) Block 3.) Grab...
function printCards(cards, language, indexed = false) {
  checkLanguage(language)
  // Ensure parameter is an array, even when one card is passed in
  const cardsToPrint = Array.isArray(cards) ? cards : [cards]
  if (!cardsToPrint.length) {
    return getPhrase('player:no-cards', language)()
  }
  if (indexed) {
    return cardsToPrint.map((card, idx) => {
      const cardName = getPhrase(`card:${card.id}`, language)()
      return `${idx + 1}) ${cardName}`
    }).join(' ')
  }
  return cardsToPrint.map((card) => {
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
