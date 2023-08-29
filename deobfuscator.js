"use strict";

const fs = require("fs");
const prettier = require("prettier");

const IN = "./script.js";
const OUT = "./output.js";

const deobfuscate = async () => {
  const ep = "=this||self,"; // entry point

  let window = { _cf_chl_opt: {} };
  let self = {};

  let script = fs.readFileSync(IN, "utf-8");

  // get data variable name
  let [_, name] = script.match(/~function\((\w+),/);

  let idx = -1;
  let data = [];

  if (script.indexOf(ep) === -1) {
    return console.log("Deobfuscation entry point not found");
  }

  // extract data
  try {
    eval(
      script.replace(
        ep,
        ep +
          `(${() => {
            while (eval(name)(++idx) === undefined);
            data = [...a()];
          }})(),`
      )
    );
  } catch {}

  if (idx <= 0 || data.length == 0) {
    return console.log("data extract failed");
  }
  console.log("data extracted!");

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
  console.log("deobfuscated!");
};
deobfuscate();
