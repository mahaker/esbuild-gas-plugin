const test = require('ava');
const fs = require('fs')
const esbuild = require('esbuild')
const { GasPlugin } = require('../../dist');

test('declare global functions. banner#js is not defined', async t => {
  const outfilePath = 'dist/test1.js'

  await esbuild.build({
    entryPoints: ['../fixtures/main.ts'],
    bundle: true,
    outfile: outfilePath,
    plugins: [GasPlugin]
  })

  const outfile = fs.readFileSync(outfilePath, { encoding: 'utf8' })
  const expected = `var global = this;
function main1() {
}
function main2() {
}
"use strict";
(() => {
  // ../fixtures/util.ts
  var add = (n1, n2) => n1 + n2;
  var sub = (n1, n2) => n1 - n2;
  var util_default = {
    add,
    sub
  };

  // ../fixtures/main.ts
  var greet = (name) => {
    console.log("Hello " + name);
  };
  var main1 = () => {
    greet("mahaker");
    console.log(util_default.add(2, 3));
    console.log(util_default.sub(0, 5));
  };
  var main2 = () => {
    greet("world!");
    console.log(util_default.add(10, 5));
    console.log(util_default.sub(10, 5));
  };
  global.main1 = main1;
  global.main2 = main2;
})();
`

  t.is(outfile, expected)
});


test('declare global functions. banner#js is defined', async t => {
  const outfilePath = 'dist/test2.js'

  await esbuild.build({
    entryPoints: ['../fixtures/main.ts'],
    bundle: true,
    outfile: outfilePath,
    banner: {
      js: `/**
 * This is banner
 * This is banner
 * This is banner
 */
`
    },
    plugins: [GasPlugin]
  })

  const outfile = fs.readFileSync(outfilePath, { encoding: 'utf8' })
  const expected = `/**
 * This is banner
 * This is banner
 * This is banner
 */
var global = this;
function main1() {
}
function main2() {
}
"use strict";
(() => {
  // ../fixtures/util.ts
  var add = (n1, n2) => n1 + n2;
  var sub = (n1, n2) => n1 - n2;
  var util_default = {
    add,
    sub
  };

  // ../fixtures/main.ts
  var greet = (name) => {
    console.log("Hello " + name);
  };
  var main1 = () => {
    greet("mahaker");
    console.log(util_default.add(2, 3));
    console.log(util_default.sub(0, 5));
  };
  var main2 = () => {
    greet("world!");
    console.log(util_default.add(10, 5));
    console.log(util_default.sub(10, 5));
  };
  global.main1 = main1;
  global.main2 = main2;
})();
`

  t.is(outfile, expected)
});
