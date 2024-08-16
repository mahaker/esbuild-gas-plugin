# esbuild-gas-plugin

[![npm version](https://badge.fury.io/js/esbuild-gas-plugin.svg)](https://www.npmjs.com/package/esbuild-gas-plugin)
![test](https://github.com/mahaker/esbuild-gas-plugin/actions/workflows/test.yml/badge.svg)

esbuild plugin for Google Apps Script.

This is inspired by [gas-webpack-plugin](https://github.com/fossamagna/gas-webpack-plugin).

## Install

```
npm install -D esbuild-gas-plugin
// or
yarn add -D esbuild-gas-plugin
// or
pnpm add -D esbuild-gas-plugin
```

## Usage

Add this to Your build script file, and paste `dist/bundle.js` to script editor.

A simple example can be found in [here](https://github.com/mahaker/esbuild-tutorial).

### Node

```ts
// build.js
const { GasPlugin } = require('esbuild-gas-plugin');

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  plugins: [GasPlugin]
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
```

and

```sh
node build.js
```

### Deno

```ts
// build.ts
import { build, stop } from 'https://deno.land/x/esbuild@v0.12.15/mod.js'
import { GasPlugin } from 'npm:esbuild-gas-plugin@0.9.0'
import httpFetch from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.2/index.js'

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  plugins: [httpFetch, GasPlugin ]
})
stop()
```

and 

```sh
deno run --allow-read --allow-env --allow-run --allow-write build.ts
# or
deno run -A build.ts
```

### Multi Entry Points

When using the strategy of specifying multiple files in esbuild's entryPoints to split the output into multiple files to avoid GAS's file size limitations, the entry point in GAS (referred to here as the prime entry point) needs to be consolidated into a single file.

```ts
// build.js for Node
const { MultiEntryPointsGasPlugin } = require('esbuild-gas-plugin');

require('esbuild').build({
  entryPoints: ['src/**/*.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [MultiEntryPointsGasPlugin({ primeEntryPointJs: "dist/index.js" })]
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
```

or

```ts
// build.ts for Deno
import { build, stop } from 'https://deno.land/x/esbuild@v0.12.15/mod.js'
import { MultiEntryPointsGasPlugin } from 'npm:esbuild-gas-plugin@0.9.0'
import httpFetch from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.2/index.js'

await build({
  entryPoints: ['src/**/*.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [httpFetch, MultiEntryPointsGasPlugin({ primeEntryPointJs: "dist/index.js" })]
})
stop()
```
