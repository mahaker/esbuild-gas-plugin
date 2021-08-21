require('esbuild').build({
  entryPoints: ['index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node'
}).catch(() => process.exit(1))
