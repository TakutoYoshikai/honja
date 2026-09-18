#!/usr/bin/env node
/**
 * Honja を Google Apps Script (スプレッドシートのカスタム関数) 用の
 * 1ファイル (gas/Honja.gs) に変換するビルドスクリプト。
 *
 * languages/dictionaries/*.dict.js, languages/*.js の中身は require/module.exports を
 * 使わないただの JS オブジェクトリテラルなので、"module.exports = " を
 * "var <NAME> = " に置き換えるだけで Apps Script にそのまま持ち込める。
 * 実行ロジック(onbiki.js, number/index.js, transliterator.js, language.js の移植)は
 * scripts/gas-core.js に手で書いてあり、それをそのまま末尾に連結する。
 *
 * 実行: node scripts/build-gas.js
 * 出力: gas/Honja.gs (このファイル1つだけを Apps Script プロジェクトに追加すれば使える)
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dictDir = path.join(root, "languages", "dictionaries");
const langDir = path.join(root, "languages");
const outDir = path.join(root, "gas");
const outFile = path.join(outDir, "Honja.gs");
const coreFile = path.join(__dirname, "gas-core.js");

fs.mkdirSync(outDir, { recursive: true });

function moduleExportsToVar(filePath, varName) {
  const src = fs.readFileSync(filePath, "utf8").trim();
  if (!/^module\.exports\s*=/.test(src)) {
    throw new Error(`unexpected format (no module.exports): ${filePath}`);
  }
  let body = src.replace(/^module\.exports\s*=\s*/, "");
  body = body.replace(/;\s*$/, "");
  return `var ${varName} = ${body};\n`;
}

// --- 辞書ファイル -----------------------------------------------------

const dictFiles = [
  ["Amharic.dict.js", "HONJA_DICT_AMHARIC"],
  ["Arabic.dict.js", "HONJA_DICT_ARABIC"],
  ["Armenian.dict.js", "HONJA_DICT_ARMENIAN"],
  ["basic.dict.js", "HONJA_DICT_BASIC"],
  ["Burmese.dict.js", "HONJA_DICT_BURMESE"],
  ["charToVowel.csv.dict.js", "HONJA_DICT_CHAR_TO_VOWEL"],
  ["float.csv.dict.js", "HONJA_DICT_FLOAT"],
  ["Georgian.dict.js", "HONJA_DICT_GEORGIAN"],
  ["Greek.dict.js", "HONJA_DICT_GREEK"],
  ["Hebrew.dict.js", "HONJA_DICT_HEBREW"],
  ["Hindi.dict.js", "HONJA_DICT_HINDI"],
  ["Hiragana.dict.js", "HONJA_DICT_HIRAGANA"],
  ["integer.dict.js", "HONJA_DICT_INTEGER"],
  ["Khmer.dict.js", "HONJA_DICT_KHMER"],
  ["Korean.dict.js", "HONJA_DICT_KOREAN"],
  ["number_and_nextchar.dict.js", "HONJA_DICT_NUMBER_AND_NEXTCHAR"],
  ["number.dict.js", "HONJA_DICT_NUMBER"],
  ["replacejoshi.csv.dict.js", "HONJA_DICT_REPLACE_JOSHI"],
  ["Romaji.dict.js", "HONJA_DICT_ROMAJI"],
  ["romajiHira.csv.dict.js", "HONJA_DICT_ROMAJI_HIRA"],
  ["Russian.dict.js", "HONJA_DICT_RUSSIAN"],
  ["Sinhalese.dict.js", "HONJA_DICT_SINHALESE"],
  ["Tamil.dict.js", "HONJA_DICT_TAMIL"],
  ["Thai.dict.js", "HONJA_DICT_THAI"],
  ["Tibetan.dict.js", "HONJA_DICT_TIBETAN"],
];

let dictSection = "";
for (const [file, varName] of dictFiles) {
  dictSection += moduleExportsToVar(path.join(dictDir, file), varName);
}

// --- 言語設定ファイル (languages/*.js) ---------------------------------

const langConfigFiles = [
  ["amharic.js", "HONJA_CONFIG_AMHARIC"],
  ["arabic.js", "HONJA_CONFIG_ARABIC"],
  ["armenian.js", "HONJA_CONFIG_ARMENIAN"],
  ["burmese.js", "HONJA_CONFIG_BURMESE"],
  ["georgian.js", "HONJA_CONFIG_GEORGIAN"],
  ["greek.js", "HONJA_CONFIG_GREEK"],
  ["hebrew.js", "HONJA_CONFIG_HEBREW"],
  ["hindi.js", "HONJA_CONFIG_HINDI"],
  ["hiragana.js", "HONJA_CONFIG_HIRAGANA"],
  ["khmer.js", "HONJA_CONFIG_KHMER"],
  ["korean.js", "HONJA_CONFIG_KOREAN"],
  ["romaji.js", "HONJA_CONFIG_ROMAJI"],
  ["russian.js", "HONJA_CONFIG_RUSSIAN"],
  ["sinhalese.js", "HONJA_CONFIG_SINHALESE"],
  ["tamil.js", "HONJA_CONFIG_TAMIL"],
  ["thai.js", "HONJA_CONFIG_THAI"],
  ["tibetan.js", "HONJA_CONFIG_TIBETAN"],
];

let configSection = "";
for (const [file, varName] of langConfigFiles) {
  configSection += moduleExportsToVar(path.join(langDir, file), varName) + "\n";
}

// --- 実行ロジック (手書き, scripts/gas-core.js) --------------------------

const coreSection = fs.readFileSync(coreFile, "utf8");

// --- 1ファイルに結合して出力 ---------------------------------------------

const header =
  "// このファイルは scripts/build-gas.js によって自動生成されました。手で編集しないでください。\n" +
  "// 生成元: languages/dictionaries/*.dict.js, languages/*.js, scripts/gas-core.js\n" +
  "// 再生成するには: npm run build:gas\n" +
  "//\n" +
  "// Honja (https://github.com/TakutoYoshikai/honja) を Google スプレッドシートの\n" +
  "// カスタム関数として使えるようにした、1ファイルだけで完結する Apps Script 版です。\n" +
  "// このファイル (Honja.gs) だけを Apps Script プロジェクトに追加すれば\n" +
  "// =HONJA(...) / =HONJA_ALL(...) / =HONJA_LANGUAGES() が使えます。\n\n";

const content =
  header +
  "// ==== 辞書データ ====\n\n" +
  dictSection +
  "\n// ==== 言語設定 ====\n\n" +
  configSection +
  "// ==== 実行ロジック ====\n\n" +
  coreSection;

fs.writeFileSync(outFile, content, "utf8");
console.log(`wrote gas/Honja.gs (${(content.length / 1024).toFixed(1)} KB)`);
