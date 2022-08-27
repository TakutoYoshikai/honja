const {
  loadOtherDictionary,
  loadNumberDictionary,
  loadAllNumberWithNextCharDictionaries,
  loadIntegerDictionary,
} = require("../makeDictionary");

function toHankaku(text) {
  let result = text.slice();
  result = result.replaceAll("０", "0");
  result = result.replaceAll("１", "1");
  result = result.replaceAll("２", "2");
  result = result.replaceAll("３", "3");
  result = result.replaceAll("４", "4");
  result = result.replaceAll("５", "5");
  result = result.replaceAll("６", "6");
  result = result.replaceAll("７", "7");
  result = result.replaceAll("８", "8");
  result = result.replaceAll("９", "9");
  return result;
}

function numberToTsu(number) {
  if (n === 1) {
    return "ひと";
  }
  if (n === 2) {
    return "ふた";
  }
  if (n === 3) {
    return "みっ";
  }
  if (n === 4) {
    return "よっ";
  }
  if (n === 5) {
    return "いつ";
  }
  if (n === 6) {
    return "むっ";
  }
  if (n === 7) {
    return "なな";
  }
  if (n === 8) {
    return "やっ";
  }
  if (n === 9) {
    return "ここの";
  }
  return null;
}

const aList = ["あ", "い", "う", "え", "お"]
const kaList = ["か", "き", "く", "け", "こ"]
const saList = ["さ", "し", "す", "せ", "そ"]
const taList = ["た", "ち", "つ", "て", "と"]
const naList = ["な", "に", "ぬ", "ね", "の"]
const haList = ["は", "ひ", "ふ", "へ", "ほ"]
const maList = ["ま", "み", "む", "め", "も"]
const yaList = ["や", "ゆ", "よ"]
const raList = ["ら", "り", "る", "れ", "ろ"]
const waList = ["わ", "を", "ん"]
function toA(ch) {
  if (aList.includes(ch)) {
    return "あ";
  }
  if (kaList.includes(ch)) {
    return "か";
  }
  if (saList.includes(ch)) {
    return "さ";
  }
  if (taList.includes(ch)) {
    return "た";
  }
  if (naList.includes(ch)) {
    return "な";
  }
  if (haList.includes(ch)) {
    return "は";
  }
  if (maList.includes(ch)) {
    return "ま";
  }
  if (yaList.includes(ch)) {
    return "や";
  }
  if (raList.includes(ch)) {
    return "ら";
  }
  if (waList.includes(ch)) {
    return "わ";
  }
  return null;
}

function loadFloatDictionary() {
  const result = {}
  const dictionary = loadOtherDictionary("float.csv");
  return dictionary;
}


const integerDictionary = loadIntegerDictionary();
const floatDictionary = loadFloatDictionary();
const numberWithNextCharDictionaries = loadAllNumberWithNextCharDictionaries();
const numberDictionary = loadNumberDictionary();


function splitTextAndNumber(text) {
  let tempText = text.slice();
  const numbers = text.match(/\d{1,}\.\d{1,}|\d{1,}/gi);
  if (!numbers) {
    return [{
      type: "string",
      value: text
    }];
  }
  const result = [];
  for (const number of numbers) {
    const index = tempText.search(number);
    if (index === 0) {
      result.push({
        type: "number",
        value: number
      });
    } else {
      result.push({
        type: "string",
        value: tempText.slice(0, index)
      });
      result.push({
        type: "number",
        value: number
      });
    }
    tempText = tempText.slice(index + number.length);
  }
  if (tempText !== "") {
    result.push({
      type: "string",
      value: tempText,
    });
  }
  return result;
}

function getSen(number) {
  let result = "";
  let sen = number % 10000;
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(sen / (10 ** i)) * (10 ** i);
    if (String(n) in numberDictionary) {
      result += numberDictionary[n].yomi + " ";
    }
    sen -= n;
  }
  return result;
}
function getMan(number) {
  let result = "";
  let man = Math.floor(number / 10000.0) % 10000;
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(man / (10 ** i)) * (10 ** i);
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

function getOku(number) {
  let result = "";
  let oku = Math.floor(number / 100000000.0) % 10000;
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(oku / (10 ** i)) * (10 ** i);
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

function searchNextChar(n, ch) {
  if (!(ch in numberWithNextCharDictionaries) || !(String(n) in numberWithNextCharDictionaries[ch])) {
    return null;
  }
  return numberWithNextCharDictionaries[ch][n];
}
function getYomi(n, ch) {
  if (["は", "ひ", "ふ", "へ", "ほ", "じ", "な"].includes(ch)) {
    const record = searchNextChar(n, ch);
    if (record) {
      return record.yomi;
    }
    return null;
  }
  const vowel = toA(ch);
  const record = searchNextChar(n, vowel);
  if (record) {
    return record.yomi;
  }
  return null;
}

function getFloat(numberString) {
  const index = numberString.indexOf(".");
  if (index === -1) {
    return "";
  }
  let result = "";
  const floatPart = numberString.slice(index + 1);
  for (let i = 0; i < floatPart.length; i++) {
    const ch = floatPart[i];
    if (i !== 0 && floatPart.length - 1 === i && ch === "0") {
      continue;
    }
    result += floatDictionary[ch] + " ";
  }
  return result;
}
function getNextChar(n, ch) {
  if (toA(ch) === "は") {
    const row = searchNextChar(n, ch)
    if (row) {
      return row.nextChar;
    }
    return ch;
  }
}

function getSenFromFloat(floatText) {
  let result = "";
  let integer = parseInt(floatText) % 10000;
  let digit = 0;
  if (integer % 1000 === 0) {
    digit = 3;
  } else if (integer % 100 === 0) {
    digit = 2;
  } else if (integer % 10 === 0) {
    digit = 1;
  }
  for (let i = 3; i >= 0; i--) {
    const n = Math.floor(integer / (10 ** i)) * (10 ** i);
    if (!(n in integerDictionary)) {
      continue;
    }
    const record = integerDictionary[n];
    if (i == digit) {
      result += record.floatYomi + " ";
    } else {
      result += record.yomi + " ";
    }
    integer = integer - n;
  }
  return result;
}

function convert(numberString) {
  const text = toHankaku(numberString);
  const number = parseInt(text);
  let result = "";
  if (text.includes(".")) {
    if (number >= 1000000000000) {
      return text;
    }
    const dotIndex = text.indexOf(".");
    const oku = getOku(text.slice(0, dotIndex));
    const man = getMan(text.slice(0, dotIndex));
    const sen = getSenFromFloat(text.slice(0, dotIndex));
    result += oku + man + sen;
    if (sen === "" && man === "" && oku === "") {
      result += "れいてん ";
    } else if (sen === "" && (man !== "" || oku !== "")) {
      result += "てん ";
    }
    result += getFloat(text);
    return result;
  }

  if (number >= 1000000000000) {
    return text;
  }
  const oku = getOku(text)
  const man = getMan(text)
  const sen = getSen(text)

  result = oku + man + sen;
  return result;
}


module.exports = {
  convert,
  numberToTsu,
  toHankaku,
  splitTextAndNumber,
  getYomi,
  getNextChar,
}
