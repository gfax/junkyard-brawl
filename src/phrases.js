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
  getSupportedLanguages
}

function getPhrase(code, language) {
  return _.template(phrases[code][language])
}

function getSupportedLanguages() {
  return ['en']
}
