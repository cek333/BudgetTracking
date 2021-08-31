const attrOrm = require('../orm/attrOrm');
const transOrm = require('../orm/transOrm');

describe.skip('Performing Account Transactions', () => {
  const acc = 'cash_in_hand';
  let numTrans = 0;
  // Variables to store transaction numbers of transactions to remove
  let firstTrans, lastTrans, middleTrans;

  const TRANS_7 = [
    [1002, '2008-02-15', 'bank', 50, 'n/a'],
    [1000, '2008-03-01', 'bank', 10, 'n/a'],
    [1003, '2008-03-05', 'travel', -20, 'n/a'],
    [1004, '2008-03-08', 'personal', -2.00, 'n/a'],
    [1005, '2008-03-08', 'food', -10.00, 'n/a'],
    [1001, '2008-03-15', 'food', -10.00, 'n/a'],
    [1006, '2008-03-20', 'bank', 12.00, 'n/a']
  ];
  const TRANS_4 = [
    [1000, '2008-03-01', 'bank', 10, 'n/a'],
    [1003, '2008-03-05', 'travel', -20, 'n/a'],
    [1005, '2008-03-08', 'food', -10.00, 'n/a'],
    [1001, '2008-03-15', 'food', -10.00, 'n/a']
  ];

  beforeAll(async () => {
    await attrOrm.addAccount(acc);
  });
  async function doTrans(acc, date, grp, amt, transCnt) {
    try {
      await transOrm.addTransaction(acc, date, grp, amt);
      const count = await transOrm.getTransactionCount(acc);
      expect(count).toEqual(transCnt);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  }
  async function rmvTrans(acc, transNum, transCnt) {
    try {
      await transOrm.removeTransaction(acc, transNum);
      const count = await transOrm.getTransactionCount(acc);
      expect(count).toEqual(transCnt);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  }
  test('Add transaction', async () => {
    const date = '2008-03-01';
    const grp = 'bank';
    const amt = 10;
    numTrans++;
    await doTrans(acc, date, grp, amt, numTrans);
  });
  test('Add transaction (to end)', async () => {
    const date = '2008-03-15';
    const grp = 'food';
    const amt = -10;
    numTrans++;
    await doTrans(acc, date, grp, amt, numTrans);
  });
  test('Add transaction (to top)', async () => {
    const date = '2008-02-15';
    const grp = 'bank';
    const amt = 50;
    numTrans++;
    await doTrans(acc, date, grp, amt, numTrans);
  });
  test('Add transaction (to middle)', async () => {
    const date = '2008-03-05';
    const grp = 'travel';
    const amt = -20;
    numTrans++;
    await doTrans(acc, date, grp, amt, numTrans);
  });
  test('Add transaction (to middle)', async () => {
    const date = '2008-03-08';
    const grp = 'personal';
    const amt = -2;
    numTrans++;
    await doTrans(acc, date, grp, amt, numTrans);
  });
  test('Add transaction (with same date as existing transaction)', async () => {
    const date = '2008-03-08';
    const grp = 'food';
    const amt = -10;
    numTrans++;
    await doTrans(acc, date, grp, amt, numTrans);
  });
  test('Add transaction (to end)', async () => {
    const date = '2008-03-20';
    const grp = 'bank';
    const amt = 12;
    numTrans++;
    await doTrans(acc, date, grp, amt, numTrans);
    // Detail check of transactions so far
    try {
      const result = await transOrm.getTransactions(acc);
      // For later: Save transaction numbers of transactions to delete
      firstTrans = result[0].id;
      lastTrans = result[result.length - 1].id;

      result.forEach((trans, idx) => {
        // Get transaction number of transaction in the middle
        if (trans.category === 'personal') {
          middleTrans = trans.id;
        }
        const [testId, expDate, expGrp, expAmt, expNote] = TRANS_7[idx];
        // verify date
        expect(trans.date).toEqual(expDate);
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify amt
        expect(trans.amount).toEqual(expAmt);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Error - Remove non-existent transaction', async () => {
    const transNum = 3000;
    try {
      await transOrm.removeTransaction(acc, transNum);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
  test('Copy account and transactions', async () => {
    const toAcc = 'cash_in_hand2';
    const cpTrans = true;
    try {
      await attrOrm.copyAccount(acc, toAcc, cpTrans);
    } catch (err) {
      expect(err).toBeFalsy();
    }
    // Check the transactions
    try {
      const result = await transOrm.getTransactions(toAcc);
      result.forEach((trans, idx) => {
        const [testId, expDate, expGrp, expAmt, expNote] = TRANS_7[idx];
        // verify date
        expect(trans.date).toEqual(expDate);
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify amt
        expect(trans.amount).toEqual(expAmt);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Update transaction', async () => {
    const newDate = '2008-02-20';
    const newGrp = 'books';
    const newAmt = 70;
    const newNote = 'update';
    await transOrm.updateTransaction(
      acc, firstTrans, newDate, newGrp, newAmt, newNote
    );
    const transRb = await transOrm.getTransaction(acc, firstTrans);
    expect(transRb.id).toEqual(firstTrans);
    expect(transRb.date).toEqual(newDate);
    expect(transRb.category).toEqual(newGrp);
    expect(transRb.amount).toEqual(newAmt);
    expect(transRb.note).toEqual(newNote);
  });
  test('Remove first transaction', async () => {
    numTrans--;
    await rmvTrans(acc, firstTrans, numTrans);
  });
  test('Remove middle transaction', async () => {
    numTrans--;
    await rmvTrans(acc, middleTrans, numTrans);
  });
  test('Remove last transaction', async () => {
    numTrans--;
    await rmvTrans(acc, lastTrans, numTrans);
    // Check the transactions
    try {
      const result = await transOrm.getTransactions(acc);
      result.forEach((trans, idx) => {
        const [testId, expDate, expGrp, expAmt, expNote] = TRANS_4[idx];
        // verify date
        expect(trans.date).toEqual(expDate);
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify amt
        expect(trans.amount).toEqual(expAmt);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Remove transactions by group', async () => {
    const rmvGrp = 'food';
    numTrans = numTrans - 2;
    try {
      await transOrm.removeTransactionByGroup(acc, rmvGrp);
      const result = await transOrm.getTransactions(acc);
      expect(result.length).toEqual(2);
      result.forEach(trans => {
        // verify group
        expect(trans.category).not.toEqual(rmvGrp);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
});
