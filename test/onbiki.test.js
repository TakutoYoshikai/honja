const test = require("node:test");
const assert = require("node:assert/strict");

const onbiki = require("../onbiki");

test("onbiki", async (t) => {
  await t.test("extends the preceding vowel through a long-vowel mark", () => {
    assert.equal(onbiki("あー"), "ああ");
    assert.equal(onbiki("かー"), "かあ");
    assert.equal(onbiki("すー"), "すう");
    assert.equal(onbiki("せー"), "せえ");
    assert.equal(onbiki("そー"), "そお");
  });

  await t.test("only expands the mark adjacent to the resolved vowel, not a chain", () => {
    assert.equal(onbiki("こーー"), "こおー");
  });

  await t.test("leaves the mark alone when the preceding char has no vowel mapping", () => {
    assert.equal(onbiki("んー"), "んー");
    assert.equal(onbiki("ー"), "ー");
    assert.equal(onbiki("aー"), "aー");
  });

  await t.test("leaves text without a long-vowel mark unchanged", () => {
    assert.equal(onbiki("こんにちは"), "こんにちは");
    assert.equal(onbiki(""), "");
  });
});
