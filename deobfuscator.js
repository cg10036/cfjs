"use strict";

const fs = require("fs");
const prettier = require("prettier");

const IN = "./script.js";
const OUT = "./output.js";

const deobfuscate = async () => {
  /**
   * =this||self,
   * = this || self,
   * = this || self),
   */
  const ep = / *= *this *\|\| *self\)*,/;

  let window = { _cf_chl_opt: {} }; // fix ReferenceError: window is not defined
  let self = {}; // fix ReferenceError: self is not defined

  let script = fs.readFileSync(IN, "utf-8");

  // get data variable name
  /**
   * ~function(a,
   *
   * ~(function (
   * a,
   */
  let [_, name] = script.match(/~\(*function\s*\(\s*(\w+),/);

  let idx = -1;
  let data = [];

  if (!script.match(ep)) {
    return console.log("[-] Deobfuscation entry point not found");
  }

  // extract data
  try {
    eval(
      script.replace(
        ep,
        (m) =>
          `${m}(${() => {
            while (eval(name)(++idx) === undefined);
            data = [...a()];
          }})(),`
      )
    );
  } catch (err) {
    console.log("[!] An error occurred while extracting data");
    console.log("[!] These are mostly ignorable errors");
    console.log("[!]", err);
  }

  if (idx <= 0 || data.length == 0) {
    return console.log("[-] Data extract failed");
  }
  console.log("[+] Data extracted!");

  script = await prettier.format(script, { parser: "babel" });

  // recover with extracted data
  script = script.replace(/[a-zA-Z_][a-zA-Z_0-9]*\((\d+)\)/g, (m, c) => {
    c -= idx;
    if (c < 0 || c >= data.length) {
      return `${m} /* error */`;
    }
    return JSON.stringify(data[c]);
  });

  script = script.replace(/\["([a-zA-Z_][a-zA-Z_0-9]*)"\]/g, (m, c) => {
    return `.${c}`;
  });

  script = await prettier.format(script, { parser: "babel" });
  fs.writeFileSync(OUT, script, "utf-8");
  console.log("[+] Deobfuscated!");
};
deobfuscate().catch((err) => {
  console.log("[-] An unknown error occurred");
  console.log("[-]", err);
});
