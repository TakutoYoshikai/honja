const test = require("node:test");
const assert = require("node:assert/strict");

const Transliterator = require("../transliterator");
const languages = require("../language");

test("replaceJoshi", async (t) => {
  const honja = new Transliterator();

  await t.test("rewrites known direction-particle spellings", () => {
    assert.equal(honja.replaceJoshi("えへと"), "ええと");
    assert.equal(honja.replaceJoshi("えへは"), "ええわ");
  });

  await t.test("leaves text with no matching pattern untouched", () => {
    assert.equal(honja.replaceJoshi("こんにちは"), "こんにちは");
  });
});

test("convertHiraganaPart", async (t) => {
  const honja = new Transliterator();

  await t.test("greedily matches the longest known sequence first", () => {
    assert.deepEqual(honja.convertHiraganaPart("あ", languages.Romaji, 1), {
      nextReadingPosition: 0,
      value: "a",
    });
    assert.deepEqual(honja.convertHiraganaPart("がっこう", languages.Romaji, 2), {
      nextReadingPosition: 2,
      value: "kkoo",
    });
  });

  await t.test("returns null when positioned directly on a lone sokuon", () => {
    assert.equal(honja.convertHiraganaPart("っ", languages.Romaji, 1), null);
  });

  await t.test("falls back to the raw character when nothing matches", () => {
    assert.deepEqual(honja.convertHiraganaPart("xyz", languages.Romaji, 1), {
      nextReadingPosition: 0,
      value: "x",
    });
  });
});

test("convertHiraganaToOtherLang", async (t) => {
  const honja = new Transliterator();

  await t.test("transliterates a hiragana word into Romaji", () => {
    assert.equal(honja.convertHiraganaToOtherLang("さようなら", languages.Romaji), "sayoonara");
    assert.equal(honja.convertHiraganaToOtherLang("がっこう", languages.Romaji), "gakkoo");
  });

  await t.test("trims and collapses trailing ideographic spaces", () => {
    assert.equal(honja.convertHiraganaToOtherLang("あ　", languages.Romaji), "a");
  });
});

test("convertNumberToHiragana", async (t) => {
  const honja = new Transliterator();

  await t.test("reads a bare number using the standard yomi", () => {
    assert.equal(honja.convertNumberToHiragana("5個"), "ご 個");
    assert.equal(honja.convertNumberToHiragana("10人"), "じゅう 人");
  });

  await t.test("uses the kun-yomi counter form before つ", () => {
    assert.equal(honja.convertNumberToHiragana("1つ"), "ひとつ");
    assert.equal(honja.convertNumberToHiragana("3つ"), "みっつ");
    assert.equal(honja.convertNumberToHiragana("9つ"), "ここのつ");
  });

  await t.test("falls back to the standard yomi before つ at 10 and above", () => {
    assert.equal(honja.convertNumberToHiragana("10つ"), "じゅう つ");
  });

  await t.test("applies counter-specific readings and consonant mutation", () => {
    assert.equal(honja.convertNumberToHiragana("1ほん"), "いっぽん");
    assert.equal(honja.convertNumberToHiragana("3ほん"), "さんぼん");
    assert.equal(honja.convertNumberToHiragana("6ほん"), "ろっぽん");
  });

  await t.test("reads decimal numbers digit by digit", () => {
    assert.equal(honja.convertNumberToHiragana("3.14"), "さんてん いち よん ");
  });
});

test("convertToHiragana", async (t) => {
  const honja = new Transliterator();

  await t.test("normalizes full-width katakana to hiragana", () => {
    assert.equal(honja.convertToHiragana("コンニチハ"), "こんにちわ");
  });

  await t.test("rewrites こんにちは/こんばんは endings to わ", () => {
    assert.equal(honja.convertToHiragana("こんにちは"), "こんにちわ");
    assert.equal(honja.convertToHiragana("こんばんは"), "こんばんわ");
  });

  await t.test("converts the object particle を to お", () => {
    assert.equal(honja.convertToHiragana("ほんをよむ"), "ほんおよむ");
  });

  await t.test("converts は before a non-hiragana character to わ", () => {
    assert.equal(honja.convertToHiragana("わたしは学生です"), "わたしわ学生です");
  });

  await t.test("leaves は before a hiragana character alone", () => {
    assert.equal(honja.convertToHiragana("わたしはがくせいです"), "わたしはがくせいです");
  });

  await t.test("extends long-vowel marks after normalizing katakana", () => {
    assert.equal(honja.convertToHiragana("スーパー"), "すうぱあ");
  });

  await t.test("weaves number conversion into the pipeline", () => {
    assert.equal(honja.convertToHiragana("1つ"), "ひとつ");
  });
});

test("convert", async (t) => {
  const honja = new Transliterator();

  await t.test("converts Japanese text end-to-end into a target language", () => {
    assert.equal(honja.convert("こんにちは", "Romaji"), "konnichiwa");
    assert.equal(honja.convert("ありがとう", "Thai"), "อาริกาโตโอะ");
  });
});

test("convertAll", async (t) => {
  const honja = new Transliterator();

  await t.test("returns a conversion for every language plus Hiragana", () => {
    const result = honja.convertAll("こんにちは");
    assert.equal(result.Romaji, "konnichiwa");
    assert.equal(result.Hiragana, "こんにちわ");
    assert.deepEqual(
      Object.keys(result).sort(),
      [...Object.keys(languages)].sort()
    );
  });
});
