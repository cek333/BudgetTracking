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

function csvToArray(dataIn) {
  return dataIn.map(csvRow => {
    // Replace any quoted text. Only expecting one quoted string per line.
    const quoteCheck = csvRow.match(/"(.*?)"/);
    // console.log(quoteCheck);
    let lineNoText;
    let text = null;
    if (quoteCheck) {
      text = quoteCheck[1];
      // Replace quoted string with placeholder string
      lineNoText = csvRow.replace(text, '###text###');
    } else {
      lineNoText = csvRow;
    }
    // Split by commas
    let csvArr = lineNoText.split(',');
    // Re-insert quoted text
    if (text !== null) {
      csvArr = csvArr.map(col => col.replace('###text###', text));
    }
    return csvArr;
  });
}

function csvArrToJson(arrOfRows, keys) {
  // arrOfRows = [ [a,b,c], [a,b,c] ]
  // keys: [ key1, key2, key3 ]
  // Check for mismatch in array lengths
  if (keys.length !== arrOfRows[0].length) {
    return [];
  }
  return arrOfRows.map(csvArr => {
    const asJson = { };
    for (let idx = 0; idx < keys.length; idx++) {
      asJson[keys[idx]] = csvArr[idx];
    }
    return asJson;
  });
}

function writeDataToFile(fileOut, data) {
  try {
    fs.writeFileSync(fileOut, data);
  } catch (err) {
    console.error(`Unable to write file: ${err}`);
  }
}

module.exports = { getDataFromFile, dataToRows, writeDataToFile, csvToArray, csvArrToJson };
