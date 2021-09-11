const db = require('../models');
const { writeDataToFile } = require('./ioUtil');
const { getAccounts } = require('../orm/attrOrm');
const transOrm = require('../orm/transOrm');
const { currencyRound } = require('../util/mathUtil');

async function main() {
  if (process.argv.length < 3) {
    console.log('node exportTransactions.js accName');
    process.exit(1);
  }
  const acc = process.argv[2];
  const fileOut = `${acc}.acc`;

  // Connect to database
  await db.sequelize.sync();
  const existingAccounts = await getAccounts();
  if (existingAccounts.includes(acc)) {
    const transactionsJson = await transOrm.getTransactions(acc);
    // Convert json to array; also add balance info
    let bal = 0;
    let lastId = null;
    const transactionsArr = transactionsJson.map(trans => {
      bal = currencyRound(trans.amount + bal);
      lastId = trans.id;
      return [
        trans.date,
        trans.id,
        trans.category.toUpperCase(),
        `"${trans.note}"`,
        trans.amount.toFixed(2),
        bal.toFixed(2)
      ];
    });
    // Add lastId+1 to front of array
    transactionsArr.unshift(lastId + 1);
    const ret = writeDataToFile(fileOut, transactionsArr.join('\n'));
    if (ret) {
      console.log(`Account ${acc} exported.`);
    }
  } else {
    console.log(`Account ${acc} not found.`);
  }
  await db.sequelize.close();
}

main();
