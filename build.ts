import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  typeCheck: false,
  test: false,
  declaration: "separate",
  package: {
    name: "esbuild-gas-plugin",
    version: "0.7.0",
    description: "esbuild plugin for Google Apps Script.",
    license: "MIT",
    author: "Hideaki Matsunami <carbon0409@gmail.com>",
    repository: "https://github.com/mahaker/esbuild-gas-plugin",
    keywords: [
      "esbuild",
      "apps-script",
      "google-apps-script"
    ],
  },
  mappings: {
    "https://deno.land/x/esbuild@v0.18.4/mod.d.ts": {
      name: "esbuild",
      version: "0.18.4",
      peerDependency: false,
    },
    "https://esm.sh/gas-entry-generator@2.1.0": {
      name: "gas-entry-generator",
      version: "2.1.0",
      peerDependency: false,
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
    Deno.copyFileSync("mod.ts", "npm/mod.ts"); // Deno support via NPM
  },
});
