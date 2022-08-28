const {
  loadOtherDictionary,
} = require("./makeDictionary");

const dictionary = loadOtherDictionary("charToVowel.csv");

function replace(text, index, replacement) {
  return text.substr(0, index) + replacement+ text.substr(index + replacement.length);
}

function Onbiki(text) {

  let result = text.slice();
  for (let i = text.length; i >= 1; i--) {
    if ((result[i] === "ー" || result[i] === "ー") && result[i-1] in dictionary) {
      result = replace(result, i, dictionary[result[i-1]]);
    }
  }
  return result;
}

module.exports = Onbiki;
