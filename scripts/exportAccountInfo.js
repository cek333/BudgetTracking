const db = require('../models');
const {
  writeDataToFile
} = require('./ioUtil');
const {
  getAccounts,
  getGroups
} = require('../orm/attrOrm');

async function main() {
  if (process.argv.length < 3) {
    console.log('node importAccountInfo.js out.csv');
    process.exit(1);
  }
  const fileOut = process.argv[2];
  const accInfo = [];
  // Connect to database
  await db.sequelize.sync();
  const accounts = await getAccounts();
  for (let idx = 0; idx < accounts.length; idx++) {
    const acc = accounts[idx];
    const groups = await getGroups(acc);
    accInfo.push(`${acc},${groups}${groups.length >= 1 ? ',' : ''}`);
  }
  writeDataToFile(fileOut, accInfo.join('\n'));
  console.log(`${fileOut} generated.`);
}

main();
