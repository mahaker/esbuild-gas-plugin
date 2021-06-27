const GasPlugin = {
  name: 'gas-plugin',
  setup(build) {
    const fs = require('fs')
    const { generate } = require('gas-entry-generator')

    build.onEnd(result => {
      const outfile = fs.readFileSync(build.initialOptions.outfile, {encoding: 'utf8'});
      const gas = generate(outfile, { comment: true })
      fs.writeFileSync(build.initialOptions.outfile, 'var global = this;' + '\n' + gas.entryPointFunctions + '\n' + outfile)
    })
  }
}

exports.GasPlugin = GasPlugin
