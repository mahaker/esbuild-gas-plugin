import { build, stop } from 'https://deno.land/x/esbuild@v0.18.4/mod.js'
import { GasPlugin } from '../../mod.ts'
import httpFetch from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.2/index.js'
import { assertStringIncludes, assertEquals } from "https://deno.land/std@0.101.0/testing/asserts.ts";

Deno.test('[TS] declare global functions. banner#js is not defined', async () => {
  const outfilePath = './dist/test1.js'
  await build({
      target: 'ES2020',
      entryPoints: ['../fixtures/ts/main.ts'],
      bundle: true,
      outfile: outfilePath,
      plugins: [httpFetch, GasPlugin ]
  })
  stop()

  const outfile = Deno.readTextFileSync(outfilePath)
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

  assertEquals(outfile, expected)
})

Deno.test('[TS] declare global functions. banner#js is defined', async () => {
  const outfilePath = './dist/test2.js'
  await build({
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
      plugins: [httpFetch, GasPlugin ]
  })
  stop()

  const outfile = Deno.readTextFileSync(outfilePath)
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

  assertEquals(outfile, expected)
})

Deno.test('[JS] declare global functions. banner#js is not defined', async () => {
  const outfilePath = './dist/test3.js'
  await build({
      target: 'ES2020',
      entryPoints: ['../fixtures/js/main.js'],
      bundle: true,
      outfile: outfilePath,
      plugins: [httpFetch, GasPlugin ]
  })
  stop()

  const outfile = Deno.readTextFileSync(outfilePath)
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

  assertEquals(outfile, expected)
})

Deno.test('[JS] declare global functions. banner#js is defined', async () => {
  const outfilePath = './dist/test4.js'
  await build({
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
      plugins: [httpFetch, GasPlugin ]
  })
  stop()

  const outfile = Deno.readTextFileSync(outfilePath)
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

  assertEquals(outfile, expected)
})

Deno.test('Throws error if "outfile" is not defined', async () => {
  // TODO: Use assertThrows or assertThrowsAsync instead of try-catch
  try {
    await build({
      target: 'ES2020',
      entryPoints: ['../fixtures/ts/main.ts'],
      logLevel: 'silent', // To hide build error message.
      bundle: true,
      plugins: [httpFetch, GasPlugin ]
    }) 
  } catch(e: any) {
    assertStringIncludes(e.message, '"outfile" is required. Note that "write: false" is not available.')
  } finally {
    stop()
  }
})

Deno.test('Throws error if "entryPoints" is not defined', async () => {
  // TODO: Use assertThrows or assertThrowsAsync instead of try-catch
  try {
    await build({
      target: 'ES2020',
      logLevel: 'silent', // To hide build error message.
      bundle: true,
      outfile: './dist/tmp.js',
      plugins: [httpFetch, GasPlugin ]
    }) 
  } catch(e: any) {
    assertStringIncludes(e.message, '"entryPoints" is required and must be an array of strings.')
  } finally {
    stop()
  }
})

Deno.test('Throws error if "entryPoints" is Array of Object', async () => {
  // TODO: Use assertThrows or assertThrowsAsync instead of try-catch
  try {
    await build({
      target: 'ES2020',
      entryPoints: [{in: '../fixtures/ts/main.ts', out: 'out.ts'}],
      logLevel: 'silent', // To hide build error message.
      bundle: true,
      outfile: './dist/tmp.js',
      plugins: [httpFetch, GasPlugin ]
    }) 
  } catch(e: any) {
    assertStringIncludes(e.message, '"entryPoints" is required and must be an array of strings.')
  } finally {
    stop()
  }
})

Deno.test('Throws error if "entryPoints" is Record', async () => {
  // TODO: Use assertThrows or assertThrowsAsync instead of try-catch
  try {
    await build({
      target: 'ES2020',
      entryPoints: {out1: '../fixtures/ts/main.ts'},
      logLevel: 'silent', // To hide build error message.
      bundle: true,
      outfile: './dist/tmp.js',
      plugins: [httpFetch, GasPlugin ]
    }) 
  } catch(e: any) {
    assertStringIncludes(e.message, '"entryPoints" is required and must be an array of strings.')
  } finally {
    stop()
  }
})
