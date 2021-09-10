const fs = require('fs');

// INPUT FUNCTIONS
function getDataFromFile(fileIn) {
  let dataIn;
  try {
    dataIn = fs.readFileSync(fileIn, 'utf8');
  } catch (err) {
    console.error(`Unable to read file: ${err}`);
    dataIn = '';
  }
  return dataIn.trim();
}

function dataToRows(dataIn, removeHdr) {
  const dataAsRows = dataIn.split(/\s*\n/);
  if (removeHdr) {
    dataAsRows.shift(); // remove header row
  }
  return dataAsRows;
}

function writeDataToFile(fileOut, data) {
  try {
    fs.writeFileSync(fileOut, data);
  } catch (err) {
    console.error(`Unable to write file: ${err}`);
  }
}

module.exports = { getDataFromFile, dataToRows, writeDataToFile };
