import type { PluginBuild } from "https://deno.land/x/esbuild@v0.18.4/mod.d.ts";
import { StringReader, readLines } from "https://deno.land/std@0.190.0/io/mod.ts";
// @deno-types="./generate.d.ts"
import { generate } from "https://esm.sh/gas-entry-generator@2.1.0";

async function countLines(s: string) {
  const reader = new StringReader(s)
  let count = 0
  for await (const _ of readLines(reader, { encoding: 'utf8' })) {
    count++
  }
  return count
}


async function deleteBanner(code: string, banner: string) {
  const bannerCount = await countLines(banner);

  const reader = new StringReader(code)
  let _count = 0
  let _code = ''
  for await (const line of readLines(reader, { encoding: 'utf8' })) {
    _count++
    if (_count <= bannerCount) continue
    _code += `${line}\n`
  }
  return _code
}

const addEntryPoint = async (jsBanner: string | undefined, code: string) => {
  const gas = generate(code, { comment: true });
  if (jsBanner === undefined) {
    return `let global = this;\n${gas.entryPointFunctions}\n${code}`;
  }
  const bannerDeleted = await deleteBanner(code, jsBanner);
  return `${jsBanner}\nlet global = this;\n${gas.entryPointFunctions}${bannerDeleted}`;
}

export const GasPlugin = {
  name: "gas-plugin",
  setup({ onEnd, initialOptions }: PluginBuild) {
    onEnd(async () => {
      if (initialOptions.outfile === undefined) {
        throw Error(
          '"outfile" is required. Note that "write: false" is not available.',
        );
      }

      const jsBanner = initialOptions.banner?.js;
      const code = await Deno.readTextFile(initialOptions.outfile);
      await Deno.writeTextFile(
        initialOptions.outfile,
        await addEntryPoint(jsBanner, code),
      );
    });
  },
};

export const MultiEntryPointsGasPlugin = ({ primeEntryPointJs }: { primeEntryPointJs: string }) => ({
  name: "multi-entry-points-gas-plugin",
  setup({ onEnd, initialOptions }: PluginBuild) {
    onEnd(async () => {
      const jsBanner = initialOptions.banner?.js;
      const code = await Deno.readTextFile(primeEntryPointJs);
      await Deno.writeTextFile(
        primeEntryPointJs,
        await addEntryPoint(jsBanner, code),
      );
    });
  },
});
