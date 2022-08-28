const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

function loadLangDictionary(name, includesAdditionalDictionary, differentAtEndOfWord) {
  return require("./languages/dictionaries/" + name + ".dict.js");
}

function loadAllNumberWithNextCharDictionaries(fileName) {
  return require("./languages/dictionaries/number_and_nextchar.dict.js");
}

function loadNumberDictionary() {
  return require("./languages/dictionaries/number.dict.js");
}

function loadIntegerDictionary() {
  return require("./languages/dictionaries/integer.dict.js");
}
function loadOtherDictionary(fileName) {
  return require("./languages/dictionaries/" + fileName + ".dict.js");
}

module.exports = {
  loadLangDictionary,
  loadOtherDictionary,
  loadAllNumberWithNextCharDictionaries,
  loadNumberDictionary,
  loadIntegerDictionary,
}
