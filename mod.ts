import type { PluginBuild } from "https://deno.land/x/esbuild@v0.18.4/mod.d.ts";
import { StringReader, readLines } from "https://deno.land/std@0.190.0/io/mod.ts";
import { generateGlobalFunctionStubs } from "./lib.ts";

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

export const GasPlugin = {
  name: "gas-plugin",
  setup({ onEnd, initialOptions }: PluginBuild) {
    onEnd(async () => {
      if (initialOptions.outfile === undefined) {
        throw Error(
          '"outfile" is required. Note that "write: false" is not available.',
        );
      }

      if (
        initialOptions.entryPoints === undefined
        || !Array.isArray(initialOptions.entryPoints)
        || !initialOptions.entryPoints.every(_ => typeof _ === "string")
      ) {
        throw new Error('"entryPoints" is required and must be an array of strings.');
      }

      const jsBanner = initialOptions.banner?.js;
      const code = await Deno.readTextFile(initialOptions.outfile);
      const gas = generateGlobalFunctionStubs(initialOptions.entryPoints[0]);

      if (jsBanner === undefined) {
        await Deno.writeTextFile(
          initialOptions.outfile,
          `var global = this;\n${gas}\n${code}`,
        );
      } else {
        const bannerDeleted = await deleteBanner(code, jsBanner);
        await Deno.writeTextFile(
          initialOptions.outfile,
          `${jsBanner}\nvar global = this;\n${gas}${bannerDeleted}`,
        );
      }
    });
  },
};
