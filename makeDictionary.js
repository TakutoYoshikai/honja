const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

function loadLangDictionary(name, includesAdditionalDictionary, differentAtEndOfWord) {
  const source = path.join(__dirname, "languages", "dictionaries", name.toLowerCase() + ".csv");
  const buffer = fs.readFileSync(source);
  let rows;
  try {
    rows = parse(buffer, { escape: "\\" })
  } catch(err) {
    console.log(err);
    throw new Error("Failed to load language dictionary: " + source);
  }
  const result = {};
  const additionalDictionary = {};
  const dictionary = {};
  const endOfWordDictionary = {};
  for (const row of rows) {
    if (includesAdditionalDictionary) {
       additionalDictionary[row[0]] = row[3];
    }
    if (differentAtEndOfWord) {
      endOfWordDictionary[row[0]] = row[2];
    }
    dictionary[row[0]] = row[1];
  }
  return {
    base: dictionary,
    additional: additionalDictionary,
    endOfWord: endOfWordDictionary,
  }
}

function loadNumberWithNextCharDictionary(fileName) {
  const source = path.join(__dirname, "languages", "dictionaries", fileName);
  const buffer = fs.readFileSync(source);
  let rows;
  try {
    rows = parse(buffer, { escape: "\\" })
  } catch(err) {
    throw new Error("Failed to load language dictionary: " + source);
  }
  const dictionary = {};
  for (const row of rows) {
    if (row.length >= 3) {
      dictionary[row[0]] = {
        yomi: row[1],
        nextChar: row[2],
      }
    } else {
      dictionary[row[0]] = {
        yomi: row[1],
        nextChar: null,
      }
    }
  }
  return dictionary;
}
function loadAllNumberWithNextCharDictionaries(fileName) {
  const dictionaries = {};
  dictionaries["か"] = loadNumberWithNextCharDictionary("ka.csv")
  dictionaries["さ"] = loadNumberWithNextCharDictionary("sa.csv")
  dictionaries["た"] = loadNumberWithNextCharDictionary("ta.csv")
  dictionaries["な"] = loadNumberWithNextCharDictionary("na.csv")
  dictionaries["じ"] = loadNumberWithNextCharDictionary("ji.csv")
  dictionaries["は"] = loadNumberWithNextCharDictionary("ha.csv")
  dictionaries["ひ"] = loadNumberWithNextCharDictionary("hi.csv")
  dictionaries["ふ"] = loadNumberWithNextCharDictionary("fu.csv")
  dictionaries["へ"] = loadNumberWithNextCharDictionary("he.csv")
  dictionaries["ほ"] = loadNumberWithNextCharDictionary("ho.csv")
  return dictionaries;
}

function loadNumberDictionary() {
  const source = path.join(__dirname, "languages", "dictionaries", "basic.csv");
  const buffer = fs.readFileSync(source);
  let rows;
  try {
    rows = parse(buffer, { escape: "\\" })
  } catch(err) {
    throw new Error("Failed to load language dictionary: " + source);
  }
  const dictionary = {};
  for (const row of rows) {
    dictionary[row[0]] = {
      yomi: row[1],
      floatYomi: row[2],
    }
  }
  return dictionary;
}

function loadIntegerDictionary() {
  const source = path.join(__dirname, "languages", "dictionaries", "basic.csv");
  const buffer = fs.readFileSync(source);
  let rows;
  try {
    rows = parse(buffer, { escape: "\\" })
  } catch(err) {
    throw new Error("Failed to load language dictionary: " + source);
  }
  const dictionary = {};
  for (const row of rows) {
    dictionary[row[0]] = {
      yomi: row[1],
      floatYomi: row[2],
    }
  }
  return dictionary;
}
function loadOtherDictionary(fileName) {
  const source = path.join(__dirname, "languages", "dictionaries", fileName);
  const buffer = fs.readFileSync(source);
  let rows;
  try {
    rows = parse(buffer, { escape: "\\" })
  } catch(err) {
    throw new Error("Failed to load language dictionary: " + source);
  }
  const dictionary = {};
  for (const row of rows) {
    dictionary[row[0]] = row[1];
  }
  return dictionary;
}

module.exports = {
  loadLangDictionary,
  loadOtherDictionary,
  loadAllNumberWithNextCharDictionaries,
  loadNumberDictionary,
  loadIntegerDictionary,
}
