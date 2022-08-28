const fs = require("fs");
const path = require("path");

const numberAndNextCharDictionary = require("./languages/dictionaries/number_and_nextchar.dict.js");

const languageDictionary = {};
const numberDictionary = require("./languages/dictionaries/number.dict.js");
const integerDictionary = require("./languages/dictionaries/integer.dict.js");
const otherDictionary = {};

otherDictionary["charToVowel.csv"] = require("./languages/dictionaries/charToVowel.csv.dict.js");
otherDictionary["float.csv"] = require("./languages/dictionaries/float.csv.dict.js");
otherDictionary["replacejoshi.csv"] = require("./languages/dictionaries/replacejoshi.csv.dict.js");
otherDictionary["romajiHira.csv"] = require("./languages/dictionaries/romajiHira.csv.dict.js");
otherDictionary["charToVowel.csv"] = require("./languages/dictionaries/charToVowel.csv.dict.js");

languageDictionary["Thai"] = require("./languages/dictionaries/Thai.dict.js");
languageDictionary["Russian"] = require("./languages/dictionaries/Russian.dict.js");
languageDictionary["Arabic"] = require("./languages/dictionaries/Arabic.dict.js");
languageDictionary["Korean"] = require("./languages/dictionaries/Korean.dict.js");
languageDictionary["Hindi"] = require("./languages/dictionaries/Hindi.dict.js");
languageDictionary["Tibetan"] = require("./languages/dictionaries/Tibetan.dict.js");
languageDictionary["Hebrew"] = require("./languages/dictionaries/Hebrew.dict.js");
languageDictionary["Khmer"] = require("./languages/dictionaries/Khmer.dict.js");
languageDictionary["Amharic"] = require("./languages/dictionaries/Amharic.dict.js");
languageDictionary["Tamil"] = require("./languages/dictionaries/Tamil.dict.js");
languageDictionary["Armenian"] = require("./languages/dictionaries/Armenian.dict.js");
languageDictionary["Burmese"] = require("./languages/dictionaries/Burmese.dict.js");
languageDictionary["Greek"] = require("./languages/dictionaries/Greek.dict.js");
languageDictionary["Georgian"] = require("./languages/dictionaries/Georgian.dict.js");
languageDictionary["Sinhalese"] = require("./languages/dictionaries/Sinhalese.dict.js");
languageDictionary["Romaji"] = require("./languages/dictionaries/Romaji.dict.js");
languageDictionary["Hiragana"] = require("./languages/dictionaries/Hiragana.dict.js");


function loadLangDictionary(name, includesAdditionalDictionary, differentAtEndOfWord) {
  return languageDictionary[name];
}

function loadAllNumberWithNextCharDictionaries(fileName) {
  return numberAndNextCharDictionary;
}

function loadNumberDictionary() {
  return numberDictionary;
}

function loadIntegerDictionary() {
  return integerDictionary;
}
function loadOtherDictionary(fileName) {
  return otherDictionary[fileName];
}

module.exports = {
  loadLangDictionary,
  loadOtherDictionary,
  loadAllNumberWithNextCharDictionaries,
  loadNumberDictionary,
  loadIntegerDictionary,
}
