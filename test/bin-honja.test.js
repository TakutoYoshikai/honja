const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const binPath = path.join(__dirname, "..", "bin", "honja.js");

test("bin/honja.js CLI", async (t) => {
  await t.test("converts to a single requested language", () => {
    const output = execFileSync(process.execPath, [binPath, "Romaji", "こんにちは"], { encoding: "utf8" });
    assert.equal(output.trim(), "konnichiwa");
  });

  await t.test("prints every language when given All", () => {
    const output = execFileSync(process.execPath, [binPath, "All", "こんにちは"], { encoding: "utf8" });
    assert.match(output, /Romaji: 'konnichiwa'/);
    assert.match(output, /Hiragana: 'こんにちわ'/);
  });
});
