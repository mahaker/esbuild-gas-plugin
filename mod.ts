import type { PluginBuild } from "https://deno.land/x/esbuild@v0.12.15/mod.d.ts";
// @deno-types="./generate.d.ts"
import { generate } from "https://esm.sh/gas-entry-generator@2.1.0";

export default {
  name: "gas-plugin",
  setup(build: PluginBuild) {
    build.onEnd(async () => {
      if (build.initialOptions.outfile == undefined) {
        throw Error('"outfile" must be string, not undefined.');
      }
      const outfile = await Deno.readTextFile(build.initialOptions.outfile);
      const gas = generate(outfile, { comment: true });
      await Deno.writeTextFile(
        build.initialOptions.outfile,
        `let global = this;\n${gas.entryPointFunctions}\n${outfile}`,
      );
    });
  },
};
