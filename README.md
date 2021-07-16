# esbuild-gas-plugin

esbuild plugin for Google Apps Script.

This is inspired by [gas-webpack-plugin](https://github.com/fossamagna/gas-webpack-plugin).

## Install

```
npm install -D esbuild-gas-plugin
// or
yarn add -D esbuild-gas-plugin
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
}).catch(() => process.exit(1))
```

and

```sh
node build.js
```

### Deno

```ts
// build.ts
import { build, stop } from 'https://deno.land/x/esbuild@v0.12.15/mod.js'
import GasPlugin from 'https://esm.sh/esbuild-gas-plugin/mod.ts'
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
