const test = require("node:test");
const assert = require("node:assert/strict");

test("index.js", async (t) => {
  await t.test("exports the Transliterator constructor", () => {
    const Honja = require("../index");
    const Transliterator = require("../transliterator");
    assert.equal(Honja, Transliterator);
    const honja = new Honja();
    assert.equal(honja.convert("こんにちは", "Romaji"), "konnichiwa");
  });
});
