import { build, stop } from 'https://deno.land/x/esbuild@v0.12.15/mod.js';
import GasPlugin from "../mod.ts";
import httpFetch from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.2/index.js';

await build({
entryPoints: ['main.ts'],
bundle: true,
outfile: 'dist/bundle.js',
plugins: [httpFetch, GasPlugin],
});
stop();