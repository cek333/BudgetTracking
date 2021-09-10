const { getDataFromFile, dataToRows } = require('./ioUtil');

function countCommas(line) {
  // Replace any quoted text. Only expecting one quoted string per line.
  const quoteCheck = line.match(/"(.*?)"/);
  // console.log(quoteCheck);
  let lineNoText;
  let text = null;
  if (quoteCheck) {
    text = quoteCheck[1];
    // Replace quoted string with placeholder string
    lineNoText = line.replace(text, '###text###');
  } else {
    lineNoText = line;
  }
  return Array.from(lineNoText.matchAll(',')).length;
}

function main() {
  if (process.argv.length < 3) {
    console.log('node checkAccFile.js <file>');
    process.exit(1);
  }
  const fileIn = process.argv[2];
  process.stdout.write(`${fileIn}: `);
  const dataIn = getDataFromFile(fileIn);
  if (dataIn.length === 0) {
    console.log('No usable data found.');
    process.exit(2);
  }
  const dataAsRows = dataToRows(dataIn, true);

  // Get number of commas in first row
  const numCommas = countCommas(dataAsRows[0]);
  // Check that all rows have the same number of commas
  const result = dataAsRows.every(row => {
    if (countCommas(row) === numCommas) {
      return true;
    } else {
      console.log(`Error @ ${row}`);
      return false;
    }
  });
  if (result) {
    console.log('OK');
  }
}

main();
