import type { PluginBuild } from "https://deno.land/x/esbuild@v0.15.11/mod.d.ts";
// @deno-types="./generate.d.ts"
import { generate } from "https://esm.sh/gas-entry-generator@2.1.0";

export default {
  name: "gas-plugin",
  setup({ onEnd, initialOptions }: PluginBuild) {
    onEnd(async () => {
      if (initialOptions.outfile === undefined) {
        throw Error(
          '"outfile" is required. Note that "write: false" is not available.',
        );
      }
      const code = await Deno.readTextFile(initialOptions.outfile);
      const gas = generate(code, { comment: true });
      await Deno.writeTextFile(
        initialOptions.outfile,
        `let global = this;\n${gas.entryPointFunctions}\n${code}`,
      );
    });
  },
};
