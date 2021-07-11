import type { PluginBuild } from "https://deno.land/x/esbuild@v0.12.15/mod.d.ts";
// @deno-types="./generate.d.ts"
import { generate } from "https://esm.sh/gas-entry-generator@2.1.0";

export default {
  name: "gas-plugin",
  setup({ onEnd, initialOptions }: PluginBuild) {
    onEnd(async ({ outputFiles }) => {
      let code = undefined;
      if (initialOptions.outfile !== undefined) {
        code = await Deno.readTextFile(initialOptions.outfile);
      } else {
        code = outputFiles?.[0].text;
      }
      if (code === undefined) {
        throw Error(
          "Neither an output file nor output text is found.",
        );
      }
      const gas = generate(code, { comment: true });
      await Deno.writeTextFile(
        code,
        `let global = this;\n${gas.entryPointFunctions}\n${code}`,
      );
    });
  },
};
