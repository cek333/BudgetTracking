const db = require('../models');
const {
  getDataFromFile,
  dataToRows,
  csvToArray
} = require('./ioUtil');
const {
  getAccounts,
  addAccount,
  addGroupToAccount,
  getGroups
} = require('../orm/attrOrm');
const { addTransaction } = require('../orm/transOrm');

async function main() {
  if (process.argv.length < 3) {
    console.log('node importAccountInfo.js accName.acc');
    process.exit(1);
  }
  const fileIn = process.argv[2];
  const accIn = fileIn.replace('.acc', '');

  // Connect to database
  await db.sequelize.sync();
  const existingAccounts = await getAccounts();
  let existingGroups;
  if (existingAccounts.includes(accIn)) {
    existingGroups = await getGroups(accIn);
  } else {
    await addAccount(accIn);
    existingGroups = [];
  }
  // Get transactions from file
  const dataIn = getDataFromFile(fileIn);
  if (dataIn.length === 0) {
    console.log('No usable data found.');
    process.exit(2);
  }
  const dataAsRows = dataToRows(dataIn, true);
  const dataAsArr = csvToArray(dataAsRows);
  const newGroupsSet = new Set();
  for (let idx = 0; idx < dataAsArr.length; idx++) {
    let [date, id, grp, note, amt, bal] = dataAsArr[idx];
    grp = grp.toLowerCase();
    await addTransaction(accIn, date, grp, Number(amt), note);
    if (!(existingGroups.includes(grp) || newGroupsSet.has(grp))) {
      newGroupsSet.add(grp);
    }
  }
  const newGroupsArr = [...newGroupsSet];
  // Update account attributes to include new groups
  for (let idx = 0; idx < newGroupsArr.length; idx++) {
    await addGroupToAccount(accIn, newGroupsArr[idx]);
  }
  await db.sequelize.close();
  console.log(`Account ${accIn} added.`);
}

main();
