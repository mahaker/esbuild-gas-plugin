const test = require('ava');
const fs = require('fs')
const esbuild = require('esbuild')
const { GasPlugin } = require('../../')

test.beforeEach(() => {
  fs.rmdirSync('./dist', { recursive: true })
})

test('declare global functions', async t => {
  await esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    logLevel: 'info',
    outfile: 'dist/bundle.js',
    target: ['node14'],
    plugins: [GasPlugin]
  })

  t.is(1, 1)
});
