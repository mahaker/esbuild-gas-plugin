require('esbuild').build({
  entryPoints: ['index.ts'],
  bundle: false,
  outfile: 'dist/index.js',
  platform: 'node'
}).catch(() => process.exit(1))
