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

const languages = {
  "Thai": require("./languages/thai"),
  "Russian": require("./languages/russian"),
  "Arabic": require("./languages/arabic"),
  "Korean": require("./languages/korean"),
  "Hindi": require("./languages/hindi"),
  "Tibetan": require("./languages/tibetan"),
  "Hebrew": require("./languages/hebrew"),
  "Khmer": require("./languages/khmer"),
  "Amharic": require("./languages/amharic"),
  "Tamil": require("./languages/tamil"),
  "Armenian": require("./languages/armenian"),
  "Burmese": require("./languages/burmese"),
  "Greek": require("./languages/greek"),
  "Georgian": require("./languages/georgian"),
  "Sinhalese": require("./languages/sinhalese"),
  "Romaji": require("./languages/romaji"),
  "Hiragana": require("./languages/hiragana"),
};

for (const languageName of languageNames) {
  languages[languageName] = {
    config: languages[languageName],
    dictionaries: loadLangDictionary(languageName),
  }
}

module.exports = languages;
