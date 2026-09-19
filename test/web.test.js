const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

test("web.js", async (t) => {
  await t.test("exports the Transliterator constructor and attaches it to window", () => {
    const script = `
      global.window = {};
      const Honja = require(${JSON.stringify(path.join(__dirname, "..", "web.js"))});
      const Transliterator = require(${JSON.stringify(path.join(__dirname, "..", "transliterator.js"))});
      if (Honja !== Transliterator) throw new Error("module.exports mismatch");
      if (global.window.Transliterator !== Transliterator) throw new Error("window.Transliterator not attached");
      console.log("ok");
    `;
    const output = execFileSync(process.execPath, ["-e", script], { encoding: "utf8" });
    assert.equal(output.trim(), "ok");
  });

  await t.test("throws when no browser-like window global is present", () => {
    assert.throws(() => {
      execFileSync(process.execPath, ["-e", `require(${JSON.stringify(path.join(__dirname, "..", "web.js"))})`], {
        encoding: "utf8",
      });
    }, /window is not defined/);
  });
});
