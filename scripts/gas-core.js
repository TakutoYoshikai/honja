// onbiki.js / number/index.js / language.js / transliterator.js / index.js の
// ロジックをそのまま Apps Script (V8) 用に書き直したものです。
// このファイルは scripts/build-gas.js によって、辞書・言語設定データと
// 一緒に gas/Honja.gs へ結合されます (このファイル自体は手で編集してください)。

// --- languages/dictionaries の集約 (旧 makeDictionary.js) --------------

function honjaOtherDictionaries_() {
  return {
    "charToVowel.csv": HONJA_DICT_CHAR_TO_VOWEL,
    "float.csv": HONJA_DICT_FLOAT,
    "replacejoshi.csv": HONJA_DICT_REPLACE_JOSHI,
    "romajiHira.csv": HONJA_DICT_ROMAJI_HIRA,
  };
}

function honjaLanguageDictionaries_() {
  return {
    Thai: HONJA_DICT_THAI,
    Russian: HONJA_DICT_RUSSIAN,
    Arabic: HONJA_DICT_ARABIC,
    Korean: HONJA_DICT_KOREAN,
    Hindi: HONJA_DICT_HINDI,
    Tibetan: HONJA_DICT_TIBETAN,
    Hebrew: HONJA_DICT_HEBREW,
    Khmer: HONJA_DICT_KHMER,
    Amharic: HONJA_DICT_AMHARIC,
    Tamil: HONJA_DICT_TAMIL,
    Armenian: HONJA_DICT_ARMENIAN,
    Burmese: HONJA_DICT_BURMESE,
    Greek: HONJA_DICT_GREEK,
    Georgian: HONJA_DICT_GEORGIAN,
    Sinhalese: HONJA_DICT_SINHALESE,
    Romaji: HONJA_DICT_ROMAJI,
    Hiragana: HONJA_DICT_HIRAGANA,
  };
}

// --- language.js 相当 (config + dictionaries をまとめる) ----------------

var HONJA_LANGUAGE_NAMES_ = [
  "Thai", "Russian", "Arabic", "Korean", "Hindi", "Tibetan", "Hebrew",
  "Khmer", "Amharic", "Tamil", "Armenian", "Burmese", "Greek", "Georgian",
  "Sinhalese", "Romaji", "Hiragana",
];

var honjaLanguagesCache_ = null;

function honjaLanguages_() {
  if (honjaLanguagesCache_) {
    return honjaLanguagesCache_;
  }
  var configs = {
    Thai: HONJA_CONFIG_THAI,
    Russian: HONJA_CONFIG_RUSSIAN,
    Arabic: HONJA_CONFIG_ARABIC,
    Korean: HONJA_CONFIG_KOREAN,
    Hindi: HONJA_CONFIG_HINDI,
    Tibetan: HONJA_CONFIG_TIBETAN,
    Hebrew: HONJA_CONFIG_HEBREW,
    Khmer: HONJA_CONFIG_KHMER,
    Amharic: HONJA_CONFIG_AMHARIC,
    Tamil: HONJA_CONFIG_TAMIL,
    Armenian: HONJA_CONFIG_ARMENIAN,
    Burmese: HONJA_CONFIG_BURMESE,
    Greek: HONJA_CONFIG_GREEK,
    Georgian: HONJA_CONFIG_GEORGIAN,
    Sinhalese: HONJA_CONFIG_SINHALESE,
    Romaji: HONJA_CONFIG_ROMAJI,
    Hiragana: HONJA_CONFIG_HIRAGANA,
  };
  var dictionaries = honjaLanguageDictionaries_();
  var languages = {};
  for (var i = 0; i < HONJA_LANGUAGE_NAMES_.length; i++) {
    var name = HONJA_LANGUAGE_NAMES_[i];
    languages[name] = {
      config: configs[name],
      dictionaries: dictionaries[name],
    };
  }
  honjaLanguagesCache_ = languages;
  return honjaLanguagesCache_;
}

// --- onbiki.js ----------------------------------------------------------

function honjaReplaceAt_(text, index, replacement) {
  return text.substr(0, index) + replacement + text.substr(index + replacement.length);
}

function honjaOnbiki_(text) {
  var dictionary = HONJA_DICT_CHAR_TO_VOWEL;
  var result = text.slice();
  for (var i = text.length; i >= 1; i--) {
    if (result[i] === "ー" && result[i - 1] in dictionary) {
      result = honjaReplaceAt_(result, i, dictionary[result[i - 1]]);
    }
  }
  return result;
}

// --- number/index.js ----------------------------------------------------

function honjaToHankaku_(text) {
  var result = text.slice();
  var zenkaku = "０１２３４５６７８９";
  for (var i = 0; i < 10; i++) {
    result = result.split(zenkaku[i]).join(String(i));
  }
  return result;
}

function honjaNumberToTsu_(number) {
  // 原作 (number/index.js) では `n` が未定義の typo でこの分岐に来ると必ず例外に
  // なっていたため、意図通り `number` を参照するように修正して移植しています。
  if (number === 1) return "ひと";
  if (number === 2) return "ふた";
  if (number === 3) return "みっ";
  if (number === 4) return "よっ";
  if (number === 5) return "いつ";
  if (number === 6) return "むっ";
  if (number === 7) return "なな";
  if (number === 8) return "やっ";
  if (number === 9) return "ここの";
  return null;
}

var honjaAList_ = ["あ", "い", "う", "え", "お"];
var honjaKaList_ = ["か", "き", "く", "け", "こ"];
var honjaSaList_ = ["さ", "し", "す", "せ", "そ"];
var honjaTaList_ = ["た", "ち", "つ", "て", "と"];
var honjaNaList_ = ["な", "に", "ぬ", "ね", "の"];
var honjaHaList_ = ["は", "ひ", "ふ", "へ", "ほ"];
var honjaMaList_ = ["ま", "み", "む", "め", "も"];
var honjaYaList_ = ["や", "ゆ", "よ"];
var honjaRaList_ = ["ら", "り", "る", "れ", "ろ"];
var honjaWaList_ = ["わ", "を", "ん"];

function honjaToA_(ch) {
  if (honjaAList_.indexOf(ch) !== -1) return "あ";
  if (honjaKaList_.indexOf(ch) !== -1) return "か";
  if (honjaSaList_.indexOf(ch) !== -1) return "さ";
  if (honjaTaList_.indexOf(ch) !== -1) return "た";
  if (honjaNaList_.indexOf(ch) !== -1) return "な";
  if (honjaHaList_.indexOf(ch) !== -1) return "は";
  if (honjaMaList_.indexOf(ch) !== -1) return "ま";
  if (honjaYaList_.indexOf(ch) !== -1) return "や";
  if (honjaRaList_.indexOf(ch) !== -1) return "ら";
  if (honjaWaList_.indexOf(ch) !== -1) return "わ";
  return null;
}

function honjaSplitTextAndNumber_(text) {
  var tempText = text.slice();
  var numbers = text.match(/\d+\.\d+|\d+/g);
  if (!numbers) {
    return [{ type: "string", value: text }];
  }
  var result = [];
  for (var i = 0; i < numbers.length; i++) {
    var number = numbers[i];
    var index = tempText.indexOf(number);
    if (index === 0) {
      result.push({ type: "number", value: number });
    } else {
      result.push({ type: "string", value: tempText.slice(0, index) });
      result.push({ type: "number", value: number });
    }
    tempText = tempText.slice(index + number.length);
  }
  if (tempText !== "") {
    result.push({ type: "string", value: tempText });
  }
  return result;
}

function honjaGetSen_(number) {
  var numberDictionary = HONJA_DICT_NUMBER;
  var result = "";
  var sen = number % 10000;
  for (var i = 3; i >= 0; i--) {
    var n = Math.floor(sen / Math.pow(10, i)) * Math.pow(10, i);
    if (String(n) in numberDictionary) {
      result += numberDictionary[n].yomi + " ";
    }
    sen -= n;
  }
  return result;
}

function honjaGetMan_(number) {
  var numberDictionary = HONJA_DICT_NUMBER;
  var result = "";
  var man = Math.floor(number / 10000.0) % 10000;
  for (var i = 3; i >= 0; i--) {
    var n = Math.floor(man / Math.pow(10, i)) * Math.pow(10, i);
    if (String(n) in numberDictionary) {
      result += numberDictionary[n].yomi + " ";
    }
    man -= n;
  }
  if (result !== "") {
    result += "まん ";
  }
  return result;
}

function honjaGetOku_(number) {
  var numberDictionary = HONJA_DICT_NUMBER;
  var result = "";
  var oku = Math.floor(number / 100000000.0) % 10000;
  for (var i = 3; i >= 0; i--) {
    var n = Math.floor(oku / Math.pow(10, i)) * Math.pow(10, i);
    if (String(n) in numberDictionary) {
      result += numberDictionary[n].yomi + " ";
    }
    oku -= n;
  }
  if (result !== "") {
    result += "おく ";
  }
  return result;
}

function honjaSearchNextChar_(n, ch) {
  var dict = HONJA_DICT_NUMBER_AND_NEXTCHAR;
  if (!(ch in dict) || !(String(n) in dict[ch])) {
    return null;
  }
  return dict[ch][n];
}

function honjaGetYomi_(n, ch) {
  var directChars = ["は", "ひ", "ふ", "へ", "ほ", "じ", "な"];
  if (directChars.indexOf(ch) !== -1) {
    var record = honjaSearchNextChar_(n, ch);
    return record ? record.yomi : null;
  }
  var vowel = honjaToA_(ch);
  var record2 = honjaSearchNextChar_(n, vowel);
  return record2 ? record2.yomi : null;
}

function honjaGetFloat_(numberString) {
  var floatDictionary = HONJA_DICT_FLOAT;
  var index = numberString.indexOf(".");
  if (index === -1) {
    return "";
  }
  var result = "";
  var floatPart = numberString.slice(index + 1);
  for (var i = 0; i < floatPart.length; i++) {
    var ch = floatPart[i];
    if (i !== 0 && floatPart.length - 1 === i && ch === "0") {
      continue;
    }
    result += floatDictionary[ch] + " ";
  }
  return result;
}

function honjaGetNextChar_(n, ch) {
  if (honjaToA_(ch) === "は") {
    var row = honjaSearchNextChar_(n, ch);
    if (row) {
      return row.nextChar;
    }
    return ch;
  }
  return undefined;
}

function honjaGetSenFromFloat_(floatText) {
  var integerDictionary = HONJA_DICT_INTEGER;
  var result = "";
  var integer = parseInt(floatText, 10) % 10000;
  var digit = 0;
  if (integer % 1000 === 0) {
    digit = 3;
  } else if (integer % 100 === 0) {
    digit = 2;
  } else if (integer % 10 === 0) {
    digit = 1;
  }
  for (var i = 3; i >= 0; i--) {
    var n = Math.floor(integer / Math.pow(10, i)) * Math.pow(10, i);
    if (!(n in integerDictionary)) {
      continue;
    }
    var record = integerDictionary[n];
    if (i === digit) {
      result += record.floatYomi + " ";
    } else {
      result += record.yomi + " ";
    }
    integer = integer - n;
  }
  return result;
}

function honjaConvertNumber_(numberString) {
  var text = honjaToHankaku_(numberString);
  var number = parseInt(text, 10);
  var result = "";
  if (text.indexOf(".") !== -1) {
    if (number >= 1000000000000) {
      return text;
    }
    var dotIndex = text.indexOf(".");
    var oku = honjaGetOku_(text.slice(0, dotIndex));
    var man = honjaGetMan_(text.slice(0, dotIndex));
    var sen = honjaGetSenFromFloat_(text.slice(0, dotIndex));
    result += oku + man + sen;
    if (sen === "" && man === "" && oku === "") {
      result += "れいてん ";
    } else if (sen === "" && (man !== "" || oku !== "")) {
      result += "てん ";
    }
    result += honjaGetFloat_(text);
    return result;
  }

  if (number >= 1000000000000) {
    return text;
  }
  var oku2 = honjaGetOku_(text);
  var man2 = honjaGetMan_(text);
  var sen2 = honjaGetSen_(text);
  result = oku2 + man2 + sen2;
  return result;
}

// --- transliterator.js ---------------------------------------------------

function honjaConvertSpecialJoshi_(text) {
  // 原作 (transliterator.js) は \p{Hiragana} に u フラグを付けておらず、
  // 実際には Unicode プロパティエスケープとしては働かず「p,{,H,i,r,a,g,n,}」という
  // リテラル文字集合の否定として解釈されている(README の変換例もこの挙動を前提にしている)。
  // u フラグを付けて「本来の意図通り」に直すと出力が変わってしまうため、
  // 挙動を完全に一致させるためにあえて同じ書き方のまま移植している。
  if (text === "こんにちは") {
    return "こんにちわ";
  }
  var result = text.slice();
  var tmp = text.slice();
  var matched = tmp.match(/[へは][^\p{Hiragana}]/gi);
  while (matched) {
    tmp = tmp.replace(matched[0], "");
    if (matched[0][0] === "へ") {
      result = result.replace(matched[0], "え" + matched[0][1]);
    }
    if (matched[0][0] === "は") {
      result = result.replace(matched[0], "わ" + matched[0][1]);
    }
    matched = tmp.match(/[へは][^\p{Hiragana}]/gi);
  }
  result = result.split("を").join("お");
  return result;
}

function honjaHiraganaToKatakana_(text) {
  return text.replace(/[ァ-ヶ]/g, function (match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function HonjaTransliterator_() {
  var maxPrecedingCheckJP = 10;
  var joshiDictionary = honjaOtherDictionaries_()["replacejoshi.csv"];

  this.replaceJoshi = function (text) {
    var result = text.slice();
    for (var key in joshiDictionary) {
      result = result.split(key).join(joshiDictionary[key]);
    }
    return result;
  };

  this.convertHiraganaPart = function (text, language, readingPosition) {
    var remainTextLength = text.length - readingPosition + 1;
    var tempChar;
    var numLoop = remainTextLength;
    if (maxPrecedingCheckJP < remainTextLength) {
      numLoop = maxPrecedingCheckJP;
    }
    for (var i = numLoop; i >= 1; i--) {
      tempChar = text.slice(readingPosition - 1, readingPosition - 1 + i);
      if (tempChar === "っ") {
        return null;
      }
      var convertedChar = language.dictionaries.base[tempChar];
      if (!convertedChar) {
        continue;
      }
      if (readingPosition + i - 1 < text.length) {
        var nextChar = text.slice(readingPosition + i - 1, readingPosition + i);
        if (language.config.differentAtEndOfWord) {
          if (nextChar === " " || nextChar === "　") {
            convertedChar = language.dictionaries.endOfWord[tempChar];
          }
        } else {
          // 原作 (transliterator.js) も language.config.name ではなく language.name を
          // 参照しており、常に undefined になってこの分岐に入らない。挙動を完全に
          // 一致させるため、あえてそのまま移植している。
          if (language.name === "Thai") {
            if (nextChar === "っ" || nextChar === "ん") {
              convertedChar = language.dictionaries.additional[tempChar];
            }
          } else if (language.name === "Korean") {
            if (
              nextChar === "あ" || nextChar === "い" || nextChar === "う" ||
              nextChar === "え" || nextChar === "お"
            ) {
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
      };
    }
    return {
      nextReadingPosition: 0,
      value: tempChar,
    };
  };

  this.convertHiraganaToOtherLang = function (text, language) {
    var result = "";
    var tempChar;
    var i = 1;
    while (i <= text.length) {
      tempChar = this.convertHiraganaPart(text, language, i);
      if (tempChar) {
        result = result + tempChar.value;
        i += tempChar.nextReadingPosition;
      }
      i++;
    }
    result = result.trim();
    result = result.split("　").join(" ");
    return result;
  };

  this.convertNumberToHiragana = function (text) {
    var splitted = honjaSplitTextAndNumber_(text);
    var words = splitted.map(function (word, index) {
      if (word.type === "number") {
        var numberString = word.value.toString();
        if (index < splitted.length - 1) {
          var nextWord = splitted[index + 1];
          var nextChar = nextWord.value[0];
          if (Number(word.value) === 0) {
            return { value: "ぜろ" };
          }
          if (nextChar === "つ") {
            if (Number(word.value) === 0 || Number(word.value) >= 10) {
              return { value: honjaConvertNumber_(word.value.toString()) };
            }
            var tsuWord = honjaNumberToTsu_(Number(word.value));
            return { value: tsuWord };
          }
          for (var i = numberString.length - 1; i >= 0; i--) {
            var n = Math.pow(10, numberString.length - 1 - i);
            if (numberString[i] !== "0") {
              var differentYomi = honjaGetYomi_(parseInt(numberString[i], 10) * n, nextChar);
              if (!differentYomi) {
                return { value: honjaConvertNumber_(numberString) };
              }
              return {
                value: differentYomi,
                next: honjaGetNextChar_(numberString, nextChar),
              };
            }
          }
        }
        return { value: honjaConvertNumber_(numberString) };
      }
      return word;
    });

    words = words.map(function (word, index) {
      if (word.type !== "string") {
        return word;
      }
      if (index === 0) {
        return word;
      }
      var value = words[index].value;
      if (words[index - 1].next) {
        value = honjaReplaceAt_(value, 0, words[index - 1].next);
        return { type: "string", value: value };
      }
      return word;
    });

    return words.reduce(function (a, b) {
      return a + b.value;
    }, "");
  };

  this.convertToHiragana = function (text) {
    var hiragana = honjaToHankaku_(text);
    hiragana = honjaHiraganaToKatakana_(hiragana);
    hiragana = honjaConvertSpecialJoshi_(hiragana);
    hiragana = this.convertNumberToHiragana(hiragana);
    hiragana = honjaOnbiki_(hiragana);
    hiragana = this.replaceJoshi(hiragana);
    return hiragana;
  };

  this.convert = function (text, languageId) {
    var hiragana = this.convertToHiragana(text);
    var languages = honjaLanguages_();
    if (!languages[languageId]) {
      throw new Error("未対応の言語です: " + languageId);
    }
    return this.convertHiraganaToOtherLang(hiragana, languages[languageId]);
  };

  this.convertAll = function (text) {
    var hiragana = this.convertToHiragana(text);
    var languages = honjaLanguages_();
    var result = {};
    for (var languageId in languages) {
      result[languageId] = this.convertHiraganaToOtherLang(hiragana, languages[languageId]);
    }
    result["Hiragana"] = hiragana;
    return result;
  };
}

var honjaTransliteratorInstance_ = null;

function honjaTransliterator_() {
  if (!honjaTransliteratorInstance_) {
    honjaTransliteratorInstance_ = new HonjaTransliterator_();
  }
  return honjaTransliteratorInstance_;
}

// --- スプレッドシートから呼び出すカスタム関数 -----------------------------

function honjaMapOverRange_(input, fn) {
  if (Array.isArray(input)) {
    return input.map(function (row) {
      return honjaMapOverRange_(row, fn);
    });
  }
  return fn(input);
}

/**
 * ひらがな・カタカナの文字列を指定した言語の発音でそのまま翻字します。
 * 例: =HONJA("こんにちは", "Korean") -> "콘니치하"
 *
 * @param {string} text 翻字したい文字列 (ひらがな・カタカナ)。セル範囲も可。
 * @param {string} language 変換先の言語名。HONJA_LANGUAGES() で一覧を確認できます。
 * @return 翻字後の文字列。
 * @customfunction
 */
function HONJA(text, language) {
  if (text === "" || text === null || typeof text === "undefined") {
    return "";
  }
  var transliterator = honjaTransliterator_();
  return honjaMapOverRange_(text, function (value) {
    if (value === "" || value === null || typeof value === "undefined") {
      return "";
    }
    return transliterator.convert(String(value), language);
  });
}

/**
 * ひらがな・カタカナの文字列を、対応している全ての言語にまとめて翻字します。
 * 1行目に言語名、2行目に翻字結果が並んだ表を返すので、スピル(自動拡張)されます。
 *
 * @param {string} text 翻字したい文字列 (ひらがな・カタカナ)。
 * @return {Array<Array<string>>} 言語名と翻字結果の2行の表。
 * @customfunction
 */
function HONJA_ALL(text) {
  var transliterator = honjaTransliterator_();
  var result = transliterator.convertAll(String(text));
  var languageIds = Object.keys(result);
  var names = [];
  var values = [];
  for (var i = 0; i < languageIds.length; i++) {
    names.push(languageIds[i]);
    values.push(result[languageIds[i]]);
  }
  return [names, values];
}

/**
 * HONJA関数が対応している言語名の一覧を返します。
 *
 * @return {Array<Array<string>>} 言語名の一覧(1列)。
 * @customfunction
 */
function HONJA_LANGUAGES() {
  var names = HONJA_LANGUAGE_NAMES_.slice();
  return names.map(function (name) {
    return [name];
  });
}
