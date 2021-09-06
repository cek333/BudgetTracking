const db = require('../../models');
const testAccounts = [
  // attr test accounts
  'bank', 'wallet', 'pillow', 'cash',
  // report test accounts
  'main',
  // trans test accounts
  'cash_in_hand', 'cash_in_hand2',
  // enter endpoint accounts
  'enter1', 'enter2', 'enter3',
  // edit endpoint accounts
  'edit1', 'edit2'
];

module.exports = async () => {
  for (let idx = 0; idx < testAccounts.length; idx++) {
    await db.sequelize.query('DROP TABLE IF EXISTS :testAcc',
      { replacements: { testAcc: testAccounts[idx] } }
    );
  }
  await db.sequelize.sync({ force: true });
};
