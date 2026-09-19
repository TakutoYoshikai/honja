const test = require("node:test");
const assert = require("node:assert/strict");

const {
  convert,
  numberToTsu,
  toHankaku,
  splitTextAndNumber,
  getYomi,
  getNextChar,
} = require("../number");

test("toHankaku", async (t) => {
  await t.test("converts full-width digits to half-width", () => {
    assert.equal(toHankaku("０１２３４５６７８９"), "0123456789");
    assert.equal(toHankaku("１２３．４５"), "123．45");
  });

  await t.test("leaves already half-width text unchanged", () => {
    assert.equal(toHankaku("123abc"), "123abc");
  });
});

test("numberToTsu", async (t) => {
  await t.test("maps 1-9 to their kun-yomi counter form", () => {
    assert.equal(numberToTsu(1), "ひと");
    assert.equal(numberToTsu(2), "ふた");
    assert.equal(numberToTsu(3), "みっ");
    assert.equal(numberToTsu(4), "よっ");
    assert.equal(numberToTsu(5), "いつ");
    assert.equal(numberToTsu(6), "むっ");
    assert.equal(numberToTsu(7), "なな");
    assert.equal(numberToTsu(8), "やっ");
    assert.equal(numberToTsu(9), "ここの");
  });

  await t.test("returns null outside of 1-9", () => {
    assert.equal(numberToTsu(0), null);
    assert.equal(numberToTsu(10), null);
  });
});

test("splitTextAndNumber", async (t) => {
  await t.test("splits a string that starts, ends, or is bordered by digits", () => {
    assert.deepEqual(splitTextAndNumber("abc123def"), [
      { type: "string", value: "abc" },
      { type: "number", value: "123" },
      { type: "string", value: "def" },
    ]);
  });

  await t.test("handles text made only of digits", () => {
    assert.deepEqual(splitTextAndNumber("123"), [
      { type: "number", value: "123" },
    ]);
  });

  await t.test("handles text with no digits", () => {
    assert.deepEqual(splitTextAndNumber("hello"), [
      { type: "string", value: "hello" },
    ]);
  });

  await t.test("handles decimal numbers", () => {
    assert.deepEqual(splitTextAndNumber("value 3.14 end"), [
      { type: "string", value: "value " },
      { type: "number", value: "3.14" },
      { type: "string", value: " end" },
    ]);
  });

  await t.test("handles multiple numbers in one string", () => {
    assert.deepEqual(splitTextAndNumber("1と2"), [
      { type: "number", value: "1" },
      { type: "string", value: "と" },
      { type: "number", value: "2" },
    ]);
  });
});

test("convert", async (t) => {
  await t.test("reads zero as an empty string", () => {
    assert.equal(convert("0"), "");
  });

  await t.test("reads two-digit and three-digit integers", () => {
    assert.equal(convert("15"), "じゅう ご ");
    assert.equal(convert("100"), "ひゃく ");
  });

  await t.test("reads man (10,000) and oku (100,000,000) place values", () => {
    assert.equal(convert("12345"), "いち まん にせん さんびゃく よんじゅう ご ");
    assert.equal(convert("100000000"), "いち おく ");
  });

  await t.test("passes through numbers of 1 trillion or more unread", () => {
    assert.equal(convert("1000000000000"), "1000000000000");
  });

  await t.test("reads decimals digit-by-digit after the decimal point", () => {
    assert.equal(convert("3.14"), "さんてん いち よん ");
    assert.equal(convert("0.5"), "れいてん ご ");
  });

  await t.test("drops a trailing zero in the fractional part", () => {
    assert.equal(convert("3.0"), "さんてん ぜろ ");
  });
});

test("getYomi", async (t) => {
  await t.test("returns the counter-specific reading for は-row counters", () => {
    assert.equal(getYomi(1, "ほ"), "いっ");
    assert.equal(getYomi(3, "は"), "さん");
  });

  await t.test("returns null when there is no special reading for the vowel/count", () => {
    assert.equal(getYomi(1, "あ"), null);
  });
});

test("getNextChar", async (t) => {
  await t.test("returns the mutated counter character for は-row counters", () => {
    assert.equal(getNextChar("1", "ほ"), "ぽ");
    assert.equal(getNextChar("3", "は"), "ば");
  });
});
