#!/usr/bin/env node

const Honja = require("../transliterator");
const lang = process.argv[2];
const text = process.argv[3];

const honja = new Honja();

if (lang === "All") {
  console.log(honja.convertAll(text));
} else {
  console.log(honja.convert(text, lang));
}
