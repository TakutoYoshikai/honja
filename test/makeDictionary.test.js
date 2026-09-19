const test = require("node:test");
const assert = require("node:assert/strict");

const {
  loadLangDictionary,
  loadOtherDictionary,
  loadAllNumberWithNextCharDictionaries,
  loadNumberDictionary,
  loadIntegerDictionary,
} = require("../makeDictionary");

test("loadLangDictionary", async (t) => {
  await t.test("returns base/additional/endOfWord tables for a known language", () => {
    const dict = loadLangDictionary("Romaji");
    assert.ok(dict.base);
    assert.ok(dict.additional);
    assert.ok(dict.endOfWord);
    assert.equal(dict.base["あ"], "a");
  });

  await t.test("returns undefined for an unknown language", () => {
    assert.equal(loadLangDictionary("Klingon"), undefined);
  });
});

test("loadOtherDictionary", async (t) => {
  await t.test("returns the requested auxiliary dictionary", () => {
    assert.equal(loadOtherDictionary("float.csv")["3"], "さん");
    assert.equal(loadOtherDictionary("charToVowel.csv")["か"], "あ");
    assert.equal(loadOtherDictionary("replacejoshi.csv")["へは"], "えわ");
    assert.ok(loadOtherDictionary("romajiHira.csv")["ka"]);
  });

  await t.test("returns undefined for an unknown file name", () => {
    assert.equal(loadOtherDictionary("nonexistent.csv"), undefined);
  });
});

test("loadNumberDictionary", () => {
  const dict = loadNumberDictionary();
  assert.deepEqual(dict["10"], { yomi: "じゅう", floatYomi: "じゅってん" });
});

test("loadIntegerDictionary", () => {
  const dict = loadIntegerDictionary();
  assert.deepEqual(dict["10"], { yomi: "じゅう", floatYomi: "じゅってん" });
});

test("loadAllNumberWithNextCharDictionaries", () => {
  const dict = loadAllNumberWithNextCharDictionaries();
  assert.ok(dict["ほ"]);
  assert.equal(dict["ほ"]["1"].yomi, "いっ");
});
