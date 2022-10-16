import { build, stop } from 'https://deno.land/x/esbuild@v0.15.11/mod.js'
import GasPlugin from '../../mod.ts'
import httpFetch from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.2/index.js'
import { assertStringIncludes, assertEquals } from "https://deno.land/std@0.101.0/testing/asserts.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";

Deno.test('declare global functions', async () => {
  // cleanup
  removeDistFolder()

  const outfilePath = './dist/bundle.js'
  await build({
      entryPoints: ['../fixtures/main.ts'],
      bundle: true,
      outfile: outfilePath,
      plugins: [httpFetch, GasPlugin ]
  })
  stop()

  const outfile = Deno.readTextFileSync(outfilePath)
  const expected = `let global = this;
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

  assertEquals(outfile, expected)
})

Deno.test('Throws error if "outfile" is not defined', async () => {
  // cleanup
  removeDistFolder()

  // TODO: Use assertThrows or assertThrowsAsync instead of try-catch
  try {
    await build({
      entryPoints: ['../fixtures/main.ts'],
      logLevel: 'silent', // To hide build error message.
      bundle: true,
      plugins: [httpFetch, GasPlugin ]
    }) 
  } catch(e) {
    assertStringIncludes(e.message, '"outfile" is required. Note that "write: false" is not available.')
  } finally {
    stop()
  }
})

const removeDistFolder = () => {
  const dist = './dist'
  if (existsSync(dist)) {
    Deno.removeSync(dist, { recursive: true })
  }
}
