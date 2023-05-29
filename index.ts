import type { Plugin, PluginBuild } from 'esbuild'
const readline = require('node:readline')
const { Readable } = require('node:stream')
const fs = require('node:fs')
const { generate } = require('gas-entry-generator')

async function countLines(s: string): Promise<number> {
  return new Promise(resolve => {
    let count = 0
    const input = Readable.from([s])
    const rl = readline.createInterface({ input })

    rl.on('line', () => {
      count++
    })

    rl.on('close', () => {
      resolve(count)
    })
  })
}

async function deleteBanner(code: string, jsBanner: string): Promise<string> {
  const input = Readable.from([code])
  const bannerLines = await countLines(jsBanner)

  return new Promise(resolve => {
    let _count = 0
    let _code = ''
    const rl = readline.createInterface({ input })

    rl.on('line', (data: string) => {
      _count++
      if(_count <= bannerLines) return

      _code += `${data}\n`
    })

    rl.on('close', () => {
      resolve(_code)
    })
  })
}

const GasPlugin: Plugin = {
  name: 'gas-plugin',
  setup(build: PluginBuild) {
    build.onEnd(async () => {
      const esbuildOptions = build.initialOptions
      const jsBanner = esbuildOptions.banner?.js
      const code = fs.readFileSync(esbuildOptions.outfile, {encoding: 'utf8'});
      const gas = generate(code, { comment: true })

      if (jsBanner === undefined) {
        fs.writeFileSync(esbuildOptions.outfile, 'var global = this;' + '\n' + gas.entryPointFunctions + '\n' + code)
      } else {
        const bannerDeleted = await deleteBanner(code, jsBanner)
        fs.writeFileSync(esbuildOptions.outfile, jsBanner + '\n' + 'var global = this;' + '\n' + gas.entryPointFunctions + bannerDeleted)
      }
    })
  }
}

export = { GasPlugin }
