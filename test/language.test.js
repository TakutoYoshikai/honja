const test = require("node:test");
const assert = require("node:assert/strict");

const languages = require("../language");

test("language registry", async (t) => {
  await t.test("exposes every configured language plus Hiragana", () => {
    const expected = [
      "Thai", "Russian", "Arabic", "Korean", "Hindi", "Tibetan", "Hebrew",
      "Khmer", "Amharic", "Tamil", "Armenian", "Burmese", "Greek", "Georgian",
      "Sinhalese", "Romaji", "Hiragana",
    ];
    assert.deepEqual(Object.keys(languages).sort(), expected.sort());
  });

  await t.test("attaches config and dictionaries to each language", () => {
    for (const id of Object.keys(languages)) {
      const language = languages[id];
      assert.ok(language.config, `${id} is missing config`);
      assert.equal(language.config.name, id);
      assert.ok(language.dictionaries, `${id} is missing dictionaries`);
      assert.ok(language.dictionaries.base, `${id} is missing a base dictionary`);
    }
  });
});
