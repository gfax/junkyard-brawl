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

// indexed = false - Guard Dog (-4), Sub (+2), Siphon (-1/+1)...
// indexed = true - 1.) Guard Dog (-4) 2.) Sub (+2) 3.) Siphon (-1/+1)...
function printCards(cards, language, indexed = false) {
  checkLanguage(language)
  // Ensure parameter is an array, even when one card is passed in
  const cardsToPrint = Array.isArray(cards) ? cards : [cards]
  if (!cardsToPrint.length) {
    return getPhrase('player:no-cards', language)()
  }
  if (indexed) {
    return cardsToPrint.map((card, idx) => {
      return `${idx + 1}) ${getCardName(card, language)}`
    }).join(' ')
  }
  return cardsToPrint.map((card) => {
    return getCardName(card, language)
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

function getCardName(card, language) {
  let name = getPhrase(`card:${card.id}`, language)()
  if (card.damage || card.hp || card.missTurns) {
    const stats = []
    if (card.damage) {
      stats.push(`-${card.damage}`)
    }
    if (card.hp) {
      stats.push(`+${card.hp}`)
    }
    if (card.missTurns) {
      stats.push(`~${card.missTurns}`)
    }
    name += ` (${stats.join('/')})`
  }
  return name
}
