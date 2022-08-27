const {
  loadLangDictionary
} = require("./makeDictionary");

const languageNames = [
  "Thai",
  "Russian",
  "Arabic",
  "Korean",
  "Hindi",
  "Tibetan",
  "Hebrew",
  "Khmer",
  "Amharic",
  "Tamil",
  "Armenian",
  "Burmese",
  "Greek",
  "Georgian",
  "Sinhalese",
  "Romaji",
  "Hiragana",
];

const languages = {};

for (const languageName of languageNames) {
  const languageConfig = require("./languages/" + languageName.toLowerCase());
  let useAdditionalDictionary = false;
  let differentAtEndOfWord = false;
  if (languageConfig.useAdditionalDictionary) {
    useAdditionalDictionary = true;
  }
  if (languageConfig.differentAtEndOfWord) {
    differentAtEndOfWord = true;
  }
  languages[languageName] = {
    config: languageConfig,
    dictionaries: loadLangDictionary(languageName, useAdditionalDictionary, differentAtEndOfWord),
  }
}

module.exports = languages;
