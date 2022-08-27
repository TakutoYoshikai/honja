

const onbiki = require("./onbiki");
const languages = require("./language");
const {
  loadOtherDictionary,
} = require("./makeDictionary");

const {
  convert,
  numberToTsu,
  splitTextAndNumber,
  getYomi,
  getNextChar,
  toHankaku,
} = require("./number");

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

function convertSpecialJoshi(text) {
  let result = text.slice();
  let tmp = text.slice();
  let matched = tmp.match(/[へは][^\p{Hiragana}]/gi);
  while (matched) {
    tmp = tmp.replace(matched[0], "");
    if (matched[0][0] === "へ") {
      result = result.replace(matched[0], "え" + matched[0][1]);
    }
    if (matched[0][0] === "は") {
      result = result.replace(matched[0], "わ" + matched[0][1]);
    }
    matched = tmp.match(/[へは][^\p{Hiragana}]/gi)
  }
  result = result.replaceAll("を", "お");
  return result;
}

function isNumberCharacter(ch) {
  return ch === "." || ch === "1" || ch === "2" || ch === "3" || ch === "4" || ch === "5" || ch === "6" || ch === "7" || ch === "8" || ch === "9" || ch === "0" || ch === "１" || ch === "２" || ch === "３" || ch === "４" || ch === "５" || ch === "６" || ch === "７" || ch === "８" || ch === "９" || ch === "０";
}


function Transliterator() {
  const maxPrecedingCheckJP = 10;
	const maxPrecedingCheckOther = 8;
  const hiragana = languages.Hiragana;
  const joshiDictionary = loadOtherDictionary("replacejoshi.csv");
  const languageIds = Object.keys(languages);
  const sokuonLangs = languageIds.filter(languageId => {
    return languages[languageId].config.distinguishSokuon;
  });
  const romajiToHira = loadOtherDictionary("romajiHira.csv");
  const charToVowel = loadOtherDictionary("charToVowel.csv");
  this.replaceJoshi = function(text) {
    let result = text.slice();
    for (const key in joshiDictionary) {
      result = result.replaceAll(key, joshiDictionary[key]);
    }
    return result;
  }

  this.convertHiraganaToOtherLang = function(text, language) {
    let result = "";
    let tempChar = "";
    let i = 1;
    while (i <= text.length) {
      tempChar = this.convertHiraganaPart(text, language, i);
      if (tempChar) {
        result = result + tempChar.value;
        i += tempChar.nextReadingPosition;
      }
      i++;
    }
    result = result.trim();
    result = result.replaceAll("　", " ");
    return result;
  }

  this.convertHiraganaPart = function(text, language, readingPosition) {
    const remainTextLength = text.length - readingPosition + 1;
    const remainText = text.slice(readingPosition - 1, readingPosition - 1 + remainTextLength);
    let tempChar;
    let numLoop = remainTextLength;
    if (maxPrecedingCheckJP < remainTextLength) {
      numLoop = maxPrecedingCheckJP;
    }
    for (let i = numLoop; i >= 1; i--) {
      tempChar = text.slice(readingPosition - 1, readingPosition - 1 + i);
      if (tempChar === "っ") {
        return null;
      }
      let convertedChar = language.dictionaries.base[tempChar];
      if (!convertedChar) {
        continue;
      }
      if (readingPosition + i - 1 < text.length) {
        const nextChar = text.slice(readingPosition + i - 1, readingPosition + i);
        if (language.config.differentAtEndOfWord) {
          if (nextChar === " " || nextChar === "　") {
            convertedChar = language.dictionaries.endOfWord[tempChar];
          }
        } else {
          if (language.name === "Thai") {
            if (nextChar === "っ" || nextChar === "ん") {
              convertedChar = language.dictionaries.additional[tempChar];
            }
          } else if (language.name === "Korean") {
            if (nextChar === "あ" || nextChar === "い" || nextChar === "う" || nextChar === "え" || nextChar === "お") {
              convertedChar = language.dictionaries.additional[tempChar];
            }
          }
        }
      } else {
        if (language.config.differentAtEndOfWord) {
          convertedChar = language.dictionaries.endOfWord[tempChar]; 
        }
      }
      return {
        nextReadingPosition: i - 1,
        value: convertedChar,
      }
    }
    return {
      nextReadingPosition: 0,
      value: tempChar,
    }
  }
  this.convertNumberToHiragana = function(text) {
    const splitted = splitTextAndNumber(text);
    let words = splitted.map((word, index) => {
      if (word.type === "number") {
        const numberString = word.value.toString();
        if (index < splitted.length - 1) {
          const nextWord = splitted[index + 1];
          const nextChar = nextWord.value[0];
          if (word.value === 0) {
            return {
              value: "ぜろ"
            };
          }
          if (nextChar === "つ") {
            if (word.value === 0 || word.value >= 10) {
              return {
                value: convert(word.value.toString())
              }
            }
            const tsuWord = numberToTsu(word.value);
            return {
              value: tsuWord
            };
          }
          for (let i = numberString.length - 1; i >= 0; i--) {
            const n = 10 ** (numberString.length - 1 - i);
            if (numberString[i] !== "0") {
              const differentYomi = getYomi(parseInt(numberString[i]) * n, nextChar);
              if (!differentYomi) {
                return {
                  value: convert(numberString)
                };
              }
              return {
                value: differentYomi,
                next: getNextChar(numberString, nextChar),
              }
              
              break;
            }
          }
        }
        return {
          value: convert(numberString),
        }
      }
      return word;
    })

    words = words.map((word, index) => {
      if (word.type !== "string") {
        return word;
      }
      if (index === 0) {
        return word;
      }
      let value = words[index].value;
      if (words[index - 1].next) {
        value = value.replaceAt(0, words[index - 1].next);
        return {
          type: "string",
          value,
        }
      }
      return word;
    });
    return words.reduce((a, b) => {
      return a + b.value;
    }, "");
  }
  this.convertToHiragana = function(text) {
    let hiragana = toHankaku(text);
    hiragana = convertSpecialJoshi(hiragana);
    hiragana = this.convertNumberToHiragana(hiragana);
    hiragana = onbiki(hiragana);
    hiragana = this.replaceJoshi(hiragana);
    return hiragana;
  }
  this.convert = function(text, languageId) {
    const hiragana = this.convertToHiragana(text);
    const result = this.convertHiraganaToOtherLang(hiragana, languages[languageId]);
    return result;
  }
  this.convertAll = function(text) {
    const hiragana = this.convertToHiragana(text);
    const result = {};
    for (const languageId in languages) {
      result[languageId] = this.convertHiraganaToOtherLang(hiragana, languages[languageId]);
    }
    result["Hiragana"] = hiragana;
    return result;
  }

}

module.exports = Transliterator;
