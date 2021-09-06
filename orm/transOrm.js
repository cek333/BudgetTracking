const db = require('../models');
const TransactionFields = require('../models/TransactionFields');

const transOrm = {
  // loadTables: async function (tables, sync) {
  //   for (let idx = 0; idx < tables.length; idx++) {
  //     await this.initAccount(tables[idx], sync);
  //   }
  // },
  initAccount: async function (acc, sync = true) {
    if (db[acc]) {
      return Promise.reject(new Error(`Account ${acc} already initialized`));
    }
    db[acc] = db.sequelize.define(acc, TransactionFields, {
      freezeTableName: true
    });
    if (sync) {
      await db[acc].sync();
    }
  },
  copyTransactions: async function (frAcc, toAcc) {
    // Just-in-time account loading. Assume params are valid account.
    if (!db[frAcc]) {
      await this.initAccount(frAcc);
    }
    if (!db[toAcc]) {
      await this.initAccount(toAcc);
    }
    try {
      const trans = await this.getTransactions(frAcc);
      await db[toAcc].bulkCreate(trans, { fields: ['date', 'category', 'amount', 'note'] });
    } catch (err) {
      console.error('Error copying account transactions', err);
      return Promise.reject(new Error('Error copying account transactions'));
    }
  },
  addTransaction: async function (acc, date, grp, amt, note = 'n/a') {
    // Just-in-time account loading. Assume 'acc' is valid account.
    if (!db[acc]) {
      await this.initAccount(acc);
    }
    await db[acc].create({
      date, category: grp, amount: amt, note
    });
  },
  getTransaction: function (acc, transNum) {
    if (!db[acc]) {
      return Promise.reject(new Error(`Account ${acc} not initialized`));
    }
    return db[acc].findOne({ where: { id: transNum } });
  },
  getTransactions: async function (acc) {
    // Just-in-time account loading. Assume 'acc' is valid account.
    if (!db[acc]) {
      await this.initAccount(acc);
    }
    const result = await db[acc].findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order: [['date', 'ASC']]
    });
    // convert array of model instances to plain javascript object data
    return result.map(trans => trans.toJSON());
  },
  getTransactionCount: function (acc) {
    if (!db[acc]) {
      return Promise.reject(new Error(`Account ${acc} not initialized`));
    }
    return db[acc].count();
  },
  removeTransaction: function (acc, transNum) {
    if (!db[acc]) {
      return Promise.reject(new Error(`Account ${acc} not initialized`));
    }
    return db[acc].destroy({ where: { id: transNum } });
  },
  removeTransactionByGroup: function (acc, grp) {
    if (!db[acc]) {
      return Promise.reject(new Error(`Account ${acc} not initialized`));
    }
    return db[acc].destroy({ where: { category: grp } });
  },
  updateTransaction: async function (acc, transNum, date, grp, amt, note = 'n/a') {
    if (!db[acc]) {
      return Promise.reject(new Error(`Account ${acc} not initialized`));
    }
    const trans = await db[acc].findOne({ where: { id: transNum } });
    if (trans === null) {
      return Promise.reject(new Error(`Transaction ID ${transNum} not found in account ${acc}`));
    }
    // Assign updated values
    trans.date = date;
    trans.category = grp;
    trans.amount = amt;
    trans.note = note;
    await trans.save();
  }
};
module.exports = transOrm;
