const program = require('commander')

const options = program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('--preset <n>', 'Web player preset')
  .option('-e, --environment <n>', 'Web player environment')
  .option('-t, --title <n>', 'Title of the player')
  .option('--json', 'Output as JSON (only when -d is enabled)')
  .option('--panes <items>', 'Player panes', val => val.split(','))
  .option('-d, --display-only', `Display the url but don't open it.`)
  .option('-v, --vendor [value]', 'Vendor components', (val, memo) => [...memo, val], [])
  .option('-s, --script [value]', 'Script to include', (val, memo) => [...memo, val], [])
  .option('-b, --base-url [value]', 'Base url')
  .parse(process.argv)

if (options.args.length === 0) {
  console.log('\nInvalid usage: No files given.')
  program.help()
}

module.exports = options
