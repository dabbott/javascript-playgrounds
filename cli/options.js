const program = require('commander')

const options = program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('-t, --title <n>', 'Title of the player')
  .option('-p, --panes <items>', 'Player panes', val => val.split(','))
  .option('-d, --display-only', `Display the url but don't open it.`)
  .parse(process.argv)

if (options.args.length === 0) {
  console.log('\nInvalid usage: No files given.')
  program.help()
}

module.exports = options
