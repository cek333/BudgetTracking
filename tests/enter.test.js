const transOrm = require('../orm/transOrm');
const store = require('../store/store');
const app = require('../app/app');
const request = require('supertest');
const {
  refreshStore,
  addAccount,
  rmvAccount,
  addGroup,
  rmvGroup,
  addTransaction,
  rmvTransaction,
  rmvTransactionsByGroup,
  copyAccount,
  mergeAccounts,
  applyFilter,
  // selectors
  getAccList,
  getAccGrpList,
} = require('../store/slices/enterSlice');
const BLANK_ACC_GRP = '--/--';

describe.skip('Testing the /enter endpoint', () => {
  beforeAll(async () => {
    await store.dispatch(applyFilter('enter'));
  });
  test('Add accounts', async () => {
    try {
      await request(app)
        .post('/enter/add_acc')
        .send({ new_acc: 'enter1' })
        .expect(302);
      await request(app)
        .post('/enter/add_acc')
        .send({ new_acc: 'enter2' })
        .expect(302);
      const state = store.getState();
      expect(state.enter.accList.length).toEqual(2);
      expect(state.enter.accGrpList.length).toEqual(0);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Add groups', async () => {
    const ENTER1_GRPS = ['clothes', 'food', 'electronics'];
    const ENTER2_GRPS = ['books', 'charity'];
    let state;
    try {
      for (let idx = 0; idx < ENTER1_GRPS.length; idx++) {
        await request(app)
          .post('/enter/add_grp')
          .send({ grp_acc: 'enter1', new_grp: ENTER1_GRPS[idx] })
          .expect(302);
        state = store.getState();
        expect(state.enter.error).toBeFalsy();
      }
      state = store.getState();
      expect(state.enter.accGrpList.length).toEqual(3);
      for (let idx = 0; idx < ENTER2_GRPS.length; idx++) {
        await request(app)
          .post('/enter/add_grp')
          .send({ grp_acc: 'enter2', new_grp: ENTER2_GRPS[idx] })
          .expect(302);
        state = store.getState();
        expect(state.enter.error).toBeFalsy();
      }
      state = store.getState();
      expect(state.enter.accGrpList.length).toEqual(5);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Add transactions', async () => {
    const TRANSACTIONS = [
      ['enter1/clothes', BLANK_ACC_GRP, '2020-01-01', 10],
      ['enter1/food', BLANK_ACC_GRP, '2020-02-02', 20],
      ['enter1/electronics', BLANK_ACC_GRP, '2020-03-03', 30],
      ['enter1/food', 'enter2/charity', '2020-04-04', 40],
      ['enter2/books', BLANK_ACC_GRP, '2020-05-05', 50]
    ];
    let state;
    try {
      for (let idx = 0; idx < TRANSACTIONS.length; idx++) {
        await request(app)
          .post('/enter/add_trans')
          .send({
            pri_acc: TRANSACTIONS[idx][0],
            link_acc: TRANSACTIONS[idx][1],
            date: TRANSACTIONS[idx][2],
            amt: TRANSACTIONS[idx][3],
            sign: '-',
            comments: ''
          })
          .expect(302);
        state = store.getState();
        expect(state.enter.error).toBeFalsy();
      }
      let cnt = await transOrm.getTransactionCount('enter1');
      expect(cnt).toEqual(4);
      cnt = await transOrm.getTransactionCount('enter2');
      expect(cnt).toEqual(2);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Copy transactions', async () => {
    try {
      await request(app)
        .post('/enter/cp_acc')
        .send({ old_acc: 'enter1', duplicate_acc: 'enter3', cp_acc_trans: 'YES' })
        .expect(302);
      // Check for errors
      const state = store.getState();
      expect(state.enter.error).toBeFalsy();
      // Check transaction count
      const cnt = await transOrm.getTransactionCount('enter3');
      expect(cnt).toEqual(4);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Error - Merge invalid account', async () => {
    try {
      await request(app)
        .post('/enter/merge')
        .send({ base_acc: 'enter4', sec_acc: 'enter2' })
        .expect(302);
      const state = store.getState();
      expect(state.enter.error).toMatch(/ERROR/);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Merge Accounts', async () => {
    try {
      await request(app)
        .post('/enter/merge')
        .send({ base_acc: 'enter3', sec_acc: 'enter2' })
        .expect(302);
      const state = store.getState();
      expect(state.enter.error).toBeFalsy();
      const cnt = await transOrm.getTransactionCount('enter3');
      expect(cnt).toEqual(6);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Remove Transactions by Group', async () => {
    try {
      await request(app)
        .post('/enter/rmv_trans_by_grp')
        .send({ rmv_grp: 'enter3/food' })
        .expect(302);
      // Check that acc/grp list is unchanged
      const state = store.getState();
      expect(state.enter.error).toBeFalsy();
      const singleAccGrpList = state.enter.accGrpList.filter(accGrp => accGrp.indexOf('enter3') === 0);
      expect(singleAccGrpList.length).toEqual(5); // clothes, food, electronics, books, charity
      // Check transaction account
      const cnt = await transOrm.getTransactionCount('enter3');
      expect(cnt).toEqual(4);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Remove Transactions', async () => {
    try {
      await request(app)
        .post('/enter/rmv_trans')
        .send({ trans_acc: 'enter3', trans_num: 1 }) // remove first transaction
        .expect(302);
      // Check if any error occurred
      const state = store.getState();
      expect(state.enter.error).toBeFalsy();
      // Check transaction count
      const cnt = await transOrm.getTransactionCount('enter3');
      expect(cnt).toEqual(3);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Remove Group', async () => {
    try {
      await request(app)
        .post('/enter/rmv_grp')
        .send({ rmv_grp: 'enter3/food' })
        .expect(302);
      // Check that acc/grp list doesn't contain 'food'
      const state = store.getState();
      expect(state.enter.error).toBeFalsy();
      const singleAccGrpList = state.enter.accGrpList.filter(accGrp => accGrp.indexOf('enter3') === 0);
      expect(singleAccGrpList.length).toEqual(4); // clothes, electronics, books, charity
      singleAccGrpList.forEach(accGrp => expect(accGrp).not.toMatch(/food/));
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Remove Account', async () => {
    try {
      await request(app)
        .post('/enter/rmv_acc')
        .send({ rmv_acc: 'enter3' })
        .expect(302);
      const state = store.getState();
      expect(state.enter.error).toBeFalsy();
      expect(state.enter.accList.length).toEqual(2); // enter1, enter2
      state.enter.accList.forEach(acc => expect(acc).not.toMatch(/enter3/));
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
});
