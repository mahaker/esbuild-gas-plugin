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

```javascript
const { GasPlugin } = require('esbuild-gas-plugin'); // Add

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  plugins: [GasPlugin]         // Add
}).catch(() => process.exit(1))
```
