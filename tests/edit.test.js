const attrOrm = require('../orm/attrOrm');
const store = require('../store/store');
const app = require('../app/app');
const request = require('supertest');
const EDIT_ENDPT_URL1 = '/edit?edit_priacc=edit1';
const EDIT_ENDPT_URL2 = '/edit?edit_priacc=edit2';

describe('Testing the /edit endpoint', () => {
  beforeAll(async () => {
    const EDIT_ACCS = ['edit1', 'edit2'];
    for (let idx = 0; idx < EDIT_ACCS.length; idx++) {
      await attrOrm.addAccount(EDIT_ACCS[idx]);
    }
    const EDIT1_GRPS = ['clothes', 'food', 'electronics'];
    for (let idx = 0; idx < EDIT1_GRPS.length; idx++) {
      await attrOrm.addGroupToAccount('edit1', EDIT1_GRPS[idx]);
    }
  });
  test('Populate edit store', async () => {
    try {
      await request(app)
        .get(EDIT_ENDPT_URL1)
        .expect(200);
      const state = store.getState();
      expect(state.edit.error).toBeFalsy();
      expect(state.edit.accGrpList.length).toEqual(3);
      expect(state.edit.transactions.length).toEqual(0);
      expect(state.edit.editAcc).toEqual('edit1');
      expect(state.edit.editAccUrl).toEqual(EDIT_ENDPT_URL1);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Add transactions', async () => {
    const TRANS_ACC = 'edit1';
    const TRANSACTIONS = [
      // accGrp, date, amt, bal
      [`${TRANS_ACC}/clothes`, '2020-01-01', 10, 10],
      [`${TRANS_ACC}/food`, '2020-02-02', 20, 30],
      [`${TRANS_ACC}/electronics`, '2020-03-03', 30, 60]
    ];
    let state;
    try {
      for (let idx = 0; idx < TRANSACTIONS.length; idx++) {
        await request(app)
          .post(EDIT_ENDPT_URL1)
          .send({
            edit_priacc: TRANS_ACC,
            grp: TRANSACTIONS[idx][0],
            date: TRANSACTIONS[idx][1],
            amt: TRANSACTIONS[idx][2],
            note: '',
            op: 'add'
          })
          .expect(302);
        state = store.getState();
        expect(state.edit.error).toBeFalsy();
      }
      state = store.getState();
      const transLen = state.edit.transactions.length;
      expect(transLen).toEqual(3);
      // Verify last transaction FROM transactions array
      let lastTrans = state.edit.transactions[transLen - 1];
      expect(TRANSACTIONS[2][0]).toMatch(lastTrans.category);
      expect(lastTrans.date).toEqual(TRANSACTIONS[2][1]);
      expect(lastTrans.amount).toEqual(TRANSACTIONS[2][2]);
      expect(lastTrans.balance).toEqual(TRANSACTIONS[2][3]);
      // Verify last cached transaction
      lastTrans = state.edit.lastTransaction;
      expect(lastTrans.accGrp).toEqual(TRANSACTIONS[2][0]);
      expect(lastTrans.date).toEqual(TRANSACTIONS[2][1]);
      expect(lastTrans.amt).toEqual(TRANSACTIONS[2][2]);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Update transactions', async () => {
    const TRANS_ACC = 'edit1';
    const TRANSACTIONS = [
      // accGrp, date, amt, bal
      [`${TRANS_ACC}/clothes`, '2020-01-15', 20, 20], // UPDATED
      [`${TRANS_ACC}/food`, '2020-02-02', 20, 40],
      [`${TRANS_ACC}/electronics`, '2020-03-03', 30, 70]
    ];
    try {
      await request(app)
        .post(EDIT_ENDPT_URL1)
        .send({
          edit_priacc: TRANS_ACC,
          grp: TRANSACTIONS[0][0],
          date: TRANSACTIONS[0][1],
          amt: TRANSACTIONS[0][2],
          note: '',
          op: 'update',
          trans_num: 1 // update first transaction
        })
        .expect(302);
      const state = store.getState();
      expect(state.edit.error).toBeFalsy();
      // Verify updated transaction
      const firstTrans = state.edit.transactions[0];
      expect(TRANSACTIONS[0][0]).toMatch(firstTrans.category);
      expect(firstTrans.date).toEqual(TRANSACTIONS[0][1]);
      expect(firstTrans.amount).toEqual(TRANSACTIONS[0][2]);
      expect(firstTrans.balance).toEqual(TRANSACTIONS[0][3]);
      // Check that the balance in the last transaction is updated
      const transLen = state.edit.transactions.length;
      const lastTrans = state.edit.transactions[transLen - 1];
      expect(lastTrans.balance).toEqual(TRANSACTIONS[2][3]);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('ERROR - Update transaction with invalid transaction number', async () => {
    const TRANS_ACC = 'edit1';
    const TRANSACTIONS = [
      // accGrp, date, amt, bal
      [`${TRANS_ACC}/clothes`, '2020-01-15', 20, 20], // UPDATED
      [`${TRANS_ACC}/food`, '2020-02-02', 20, 40],
      [`${TRANS_ACC}/electronics`, '2020-03-03', 30, 70]
    ];
    try {
      await request(app)
        .post(EDIT_ENDPT_URL1)
        .send({
          edit_priacc: TRANS_ACC,
          grp: TRANSACTIONS[0][0],
          date: TRANSACTIONS[0][1],
          amt: TRANSACTIONS[0][2],
          note: '',
          op: 'update',
          trans_num: 12 // invalid transaction number
        })
        .expect(302);
      const state = store.getState();
      expect(state.edit.error).toMatch(/ERROR: Transaction ID .* not found/);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Move transactions', async () => {
    const TRANS_ACC = 'edit1';
    const DST_ACC = 'edit2';
    const TRANSACTIONS = [
      // accGrp, date, amt, bal
      [`${TRANS_ACC}/clothes`, '2020-01-20', 30, 30], // MOVE (and MODIFY)
      [`${TRANS_ACC}/food`, '2020-02-02', 20, 20], // Re-compute balance ignoring first transaction
      [`${TRANS_ACC}/electronics`, '2020-03-03', 30, 50]
    ];
    try {
      await request(app)
        .post(EDIT_ENDPT_URL1)
        .send({
          edit_priacc: TRANS_ACC,
          grp: TRANSACTIONS[0][0],
          date: TRANSACTIONS[0][1],
          amt: TRANSACTIONS[0][2],
          note: '',
          op: 'move',
          dstacc: DST_ACC,
          trans_num: 1 // move 1st transaction
        })
        .expect(302);
      let state = store.getState();
      expect(state.edit.error).toBeFalsy();
      // Check that the balance in the last transaction is updated
      const transLen = state.edit.transactions.length;
      const lastTrans = state.edit.transactions[transLen - 1];
      expect(lastTrans.balance).toEqual(TRANSACTIONS[2][3]);

      // Check that transaction was moved to new account
      await request(app)
        .get(EDIT_ENDPT_URL2)
        .expect(200);
      state = store.getState();
      expect(state.edit.error).toBeFalsy();
      expect(state.edit.accGrpList.length).toEqual(1);
      expect(state.edit.transactions.length).toEqual(1);
      expect(state.edit.editAcc).toEqual('edit2');
      expect(state.edit.editAccUrl).toEqual(EDIT_ENDPT_URL2);
      // Verify moved transaction
      const firstTrans = state.edit.transactions[0];
      expect(TRANSACTIONS[0][0]).toMatch(firstTrans.category);
      expect(firstTrans.date).toEqual(TRANSACTIONS[0][1]);
      expect(firstTrans.amount).toEqual(TRANSACTIONS[0][2]);
      expect(firstTrans.balance).toEqual(TRANSACTIONS[0][3]);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Delete transaction', async () => {
    const TRANS_ACC = 'edit2';
    try {
      await request(app)
        .post(EDIT_ENDPT_URL2)
        .send({
          edit_priacc: TRANS_ACC,
          op: 'delete',
          trans_num: 1 // delete first transaction
        })
        .expect(302);
      const state = store.getState();
      expect(state.edit.error).toBeFalsy();
      // Verify transaction deleted
      expect(state.edit.accGrpList.length).toEqual(1);
      expect(state.edit.transactions.length).toEqual(0);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
});
