const test = require('ava');
const fs = require('fs')
const esbuild = require('esbuild')
const { GasPlugin } = require('../../');

test.beforeEach(() => {
  fs.rmdirSync('./dist', { recursive: true })
})

test('declare global functions', async t => {
  const outfilePath = 'dist/bundle.js'

  await esbuild.build({
    entryPoints: ['../fixtures/main.ts'],
    bundle: true,
    logLevel: 'info',
    outfile: outfilePath,
    target: ['node14'],
    plugins: [GasPlugin]
  })

  const outfile = fs.readFileSync(outfilePath, { encoding: 'utf8' })
  const expected = `var global = this;
function main1() {
}
function main2() {
}
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
