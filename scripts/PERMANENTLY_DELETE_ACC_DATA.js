
const db = require('../models');
const {
  getAccounts,
  removeAccount
} = require('../orm/attrOrm');

async function main() {
  if (process.argv.length < 3) {
    console.log('node PERMANENTLY_DELETE_ACC_DATA.js accName');
    process.exit(1);
  }
  const acc = process.argv[2];

  // Connect to database
  await db.sequelize.sync();
  const existingAccounts = await getAccounts();
  if (existingAccounts.includes(acc)) {
    await removeAccount(acc);
    await db.sequelize.query('DROP TABLE IF EXISTS :acc',
      { replacements: { acc } }
    );
    console.log(`Account ${acc} permanently deleted.`);
  } else {
    console.log(`Account ${acc} not found.`);
  }
  await db.sequelize.close();
}

main();
