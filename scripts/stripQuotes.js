const { hideBin } = require('yargs/helpers');
const yargs = require('yargs');
const {
  getDataFromFile,
  dataToRows,
  writeDataToFile
} = require('./ioUtil');

// Program options
const argv = yargs(hideBin(process.argv))
  .option('input', {
    description: 'input filename',
    type: 'string'
  })
  .option('output', {
    description: 'output filename',
    type: 'string'
  })
  .demandOption(['input', 'output'])
  .version(false)
  .argv;

function main() {
  const fileIn = argv.input;
  const fileOut = argv.output;
  console.log(`Processing ${fileIn} ...`);
  const dataIn = getDataFromFile(fileIn);
  if (dataIn.length === 0) {
    console.log('No usable data found.');
    process.exit(2);
  }
  const dataAsRows = dataToRows(dataIn, false);
  const rowsWithoutQuotes = dataAsRows.map(row => row.replace(/"/g, ''));
  writeDataToFile(fileOut, rowsWithoutQuotes.join('\n') + '\n');
}

main();
