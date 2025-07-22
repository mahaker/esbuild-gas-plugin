const test = require('ava');
const fs = require('fs')
const esbuild = require('esbuild')
const { GasPlugin } = require('../../npm');

test('[TS] declare global functions. banner#js is not defined', async t => {
  const outfilePath = 'dist/test1.js'

  await esbuild.build({
    target: 'ES2020',
    entryPoints: ['../fixtures/ts/main.ts'],
    bundle: true,
    outfile: outfilePath,
    plugins: [GasPlugin]
  })

  const outfile = fs.readFileSync(outfilePath, { encoding: 'utf8' })
  const expected = `var global = this;
/**
 * A sample function
 * @param name Name to greet
 * @customfunction
 */
function main1(name) {}

function main2() {}
(() => {
  // ../fixtures/ts/util.ts
  var add = (n1, n2) => n1 + n2;
  var sub = (n1, n2) => n1 - n2;
  var util_default = {
    add,
    sub
  };

  // ../fixtures/ts/main.ts
  var greet = (name) => {
    console.log("Hello " + name);
  };
  var main1 = (name) => {
    greet("Hello " + name);
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


test('[TS] declare global functions. banner#js is defined', async t => {
  const outfilePath = 'dist/test2.js'

  await esbuild.build({
    target: 'ES2020',
    entryPoints: ['../fixtures/ts/main.ts'],
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
/**
 * A sample function
 * @param name Name to greet
 * @customfunction
 */
function main1(name) {}

function main2() {}
(() => {
  // ../fixtures/ts/util.ts
  var add = (n1, n2) => n1 + n2;
  var sub = (n1, n2) => n1 - n2;
  var util_default = {
    add,
    sub
  };

  // ../fixtures/ts/main.ts
  var greet = (name) => {
    console.log("Hello " + name);
  };
  var main1 = (name) => {
    greet("Hello " + name);
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

test('[JS] declare global functions. banner#js is not defined', async t => {
  const outfilePath = 'dist/test3.js'

  await esbuild.build({
    target: 'ES2020',
    entryPoints: ['../fixtures/js/main.js'],
    bundle: true,
    outfile: outfilePath,
    plugins: [GasPlugin]
  })

  const outfile = fs.readFileSync(outfilePath, { encoding: 'utf8' })
  const expected = `var global = this;
/**
 * A sample function
 * @param name Name to greet
 * @customfunction
 */
function main1(name) {}

function main2() {}
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // ../fixtures/js/util.js
  var require_util = __commonJS({
    "../fixtures/js/util.js"(exports) {
      var add = (n1, n2) => n1 + n2;
      var sub = (n1, n2) => n1 - n2;
      exports.default = {
        add,
        sub
      };
    }
  });

  // ../fixtures/js/main.js
  var Utils = require_util().default;
  var greet = (name) => {
    console.log("Hello " + name);
  };
  var main1 = (name) => {
    greet("Hello " + name);
    console.log(Utils.add(2, 3));
    console.log(Utils.sub(0, 5));
  };
  var main2 = () => {
    greet("world!");
    console.log(Utils.add(10, 5));
    console.log(Utils.sub(10, 5));
  };
  global.main1 = main1;
  global.main2 = main2;
})();
`

  t.is(outfile, expected)
});


test('[JS] declare global functions. banner#js is defined', async t => {
  const outfilePath = 'dist/test4.js'

  await esbuild.build({
    target: 'ES2020',
    entryPoints: ['../fixtures/js/main.js'],
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
/**
 * A sample function
 * @param name Name to greet
 * @customfunction
 */
function main1(name) {}

function main2() {}
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // ../fixtures/js/util.js
  var require_util = __commonJS({
    "../fixtures/js/util.js"(exports) {
      var add = (n1, n2) => n1 + n2;
      var sub = (n1, n2) => n1 - n2;
      exports.default = {
        add,
        sub
      };
    }
  });

  // ../fixtures/js/main.js
  var Utils = require_util().default;
  var greet = (name) => {
    console.log("Hello " + name);
  };
  var main1 = (name) => {
    greet("Hello " + name);
    console.log(Utils.add(2, 3));
    console.log(Utils.sub(0, 5));
  };
  var main2 = () => {
    greet("world!");
    console.log(Utils.add(10, 5));
    console.log(Utils.sub(10, 5));
  };
  global.main1 = main1;
  global.main2 = main2;
})();
`

  t.is(outfile, expected)
});