const db = require('../models');
const {
  getDataFromFile,
  dataToRows
} = require('./ioUtil');
const {
  getAccounts,
  addAccount,
  addGroupToAccount
} = require('../orm/attrOrm');

async function main() {
  if (process.argv.length < 3) {
    console.log('node importAccountInfo.js accAttr.csv');
    process.exit(1);
  }
  const fileIn = process.argv[2];
  const dataIn = getDataFromFile(fileIn);
  if (dataIn.length === 0) {
    console.log('No usable data found.');
    process.exit(2);
  }
  let dataAsRows = dataToRows(dataIn, false);
  dataAsRows = dataAsRows.map(line => {
    // Remove trailing comma
    return line.replace(/,$/, '');
  });
  // Connect to database
  await db.sequelize.sync();
  const existingAccounts = await getAccounts();
  for (let idx = 0; idx < dataAsRows.length; idx++) {
    const accGrpInfo = dataAsRows[idx].split(',');
    const accName = accGrpInfo[0];
    if (existingAccounts.includes(accName)) {
      console.log(`Account ${accName} already exists. Skipping ...`);
      continue;
    } else {
      console.log(`Adding account ${accName}.`);
      await addAccount(accName);
    }
    for (let jdx = 1; jdx < accGrpInfo.length; jdx++) {
      const grpName = accGrpInfo[jdx];
      console.log(`  Adding group ${grpName} to ${accName}.`);
      await addGroupToAccount(accName, grpName);
    }
  }
}

main();
