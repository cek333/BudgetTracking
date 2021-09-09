const db = require('../models');
const transOrm = require('./transOrm');

const attrOrm = {
  addAccount: async function (acc) {
    const account = await db.Account.findOne({ where: { name: acc } });
    if (account) {
      return Promise.reject(new Error(`Account (${acc}) already exists`));
    } else {
      await db.Account.create({ name: acc });

      // Add account to database
      await transOrm.initAccount(acc);
    }
  },
  removeAccount: function (acc) {
    return db.Account.destroy({ where: { name: acc } });
  },
  getAccount: async function (acc) {
    const result = await db.Account.findOne({ where: { name: acc } });
    if (result) {
      // Return object data
      return result.get('name');
    } else {
      return Promise.reject(new Error(`Account (${acc}) not found`));
    }
  },
  getAccounts: async function () {
    const result = await db.Account.findAll({ order: [['name', 'ASC']] });
    return result.map(acc => acc.get('name'));
  },
  addGroupToAccount: async function (acc, grp) {
    const account = await db.Account.findOne({ where: { name: acc } });
    if (account) {
      // const group = await db.Category.findOrCreate({ where: { name: grp } }); // returns array with one element?!!?
      let group = await db.Category.findOne({ where: { name: grp } });
      if (!group) {
        await db.Category.create({ name: grp });
        group = await db.Category.findOne({ where: { name: grp } });
      }
      if (await account.hasCategory(group)) {
        return Promise.reject(new Error(`Account (${acc}) already has group (${grp})`));
      } else {
        // new group
        return account.addCategory(group);
      }
    } else {
      return Promise.reject(new Error(`Account (${acc}) not found`));
    }
  },
  removeGroupFromAccount: async function (acc, grp) {
    const group = await db.Category.findOne({ where: { name: grp } });
    const account = await db.Account.findOne({ where: { name: acc } });
    if (group && account) {
      return account.removeCategory(group);
    } else {
      return Promise.reject(new Error(`Account (${acc}) and/or Group (${grp}) not found`));
    }
  },
  getGroups: async function (acc) {
    const account = await db.Account.findOne({
      where: { name: acc },
      include: db.Category,
      order: [['name', 'ASC']]
    });
    if (account) {
      // console.log('getGroups:', account.toJSON(), account.Categories.toJSON());
      // transform array of Category objects to array of category data
      return account.Categories.map(grp => grp.get('name'));
    } else {
      return Promise.reject(new Error(`Account (${acc}) not found`));
    }
  },
  copyAccount: async function (frAcc, toAcc, cpTrans) {
    const frAccount = await db.Account.findOne({
      where: { name: frAcc },
      include: db.Category
    });
    if (!frAccount) {
      return Promise.reject(new Error(`Base account (${frAcc}) not found`));
    }
    let toAccount = await db.Account.findOne({ where: { name: toAcc } });
    if (toAccount) {
      return Promise.reject(new Error(`Target account (${toAcc}) already exists`));
    }
    await db.Account.create({ name: toAcc });
    toAccount = await db.Account.findOne({ where: { name: toAcc } });
    await toAccount.addCategories(frAccount.Categories);

    // Create actual account
    await transOrm.initAccount(toAcc);
    if (cpTrans) {
      await transOrm.copyTransactions(frAcc, toAcc);
    }
  },
  mergeAccounts: async function (frAcc, toAcc) {
    const frAccount = await db.Account.findOne({
      where: { name: frAcc },
      include: db.Category
    });
    if (!frAccount) {
      return Promise.reject(new Error(`Secondary account (${frAcc}) not found`));
    }
    const toAccount = await db.Account.findOne({
      where: { name: toAcc },
      include: db.Category
    });
    if (!toAccount) {
      return Promise.reject(new Error(`Base account (${toAcc}) not found`));
    }
    const frGroups = frAccount.Categories;
    const toGrpNames = toAccount.Categories.map(grp => grp.name);
    // Find frGroups not in toGroups
    const newGroups = frGroups.filter(grp => !toGrpNames.includes(grp.name));
    // Add newGroups to base account
    await toAccount.addCategories(newGroups);
    // Copy transactions
    await transOrm.copyTransactions(frAcc, toAcc);
  }
};
module.exports = attrOrm;
