const {
  loadOtherDictionary,
} = require("./makeDictionary");

const dictionary = loadOtherDictionary("charToVowel.csv");

function Onbiki(text) {
  const len = text.length;
  const result = text.slice();
  for (let i = len; i <= 1; i--) {
    if (result[i] === "ー" || result[i] == "ー") {
      result[i] = dictionary[result[i-1]];
    }
  }
  return result;
}

module.exports = Onbiki;
