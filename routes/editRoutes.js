const express = require('express');
const router = express.Router();
const store = require('../store/store');
const {
    refreshStore,
    addTransaction,
    rmvTransaction,
    updateTransaction,
    mvTransaction,
    clearMessages,
    setError,
    setEditId,
    getAccList,
    getAccGrpList
} = require('../store/slices/editSlice');
const {
  validateDate,
  validateAmt,
  validateAcc,
  validateAccGrp,
  validateNote,
  validateTransNum,
  getAccList,
  getAccGrpList
} = require('./validateUtil');

const transactions = [
  { date: '2010-10-10', id: 1000, category: 'mbna', note: 'paid balance', amount: 10, balance: 100 },
  { date: '2010-11-10', id: 1010, category: 'visa', note: 'paid balance', amount: 20, balance: 80 },
  { date: '2010-12-10', id: 1020, category: 'food', note: 'groceries', amount: 30, balance: 50 }
];
const accList = ['bank_2020', 'cash_2020', 'charity_2020'];
const accGrpList = [
  'bank_2020/mbna', 'bank_2020/visa', 'bank_2020/food',
  'cash_2020/food', 'cash_2020/charity',
  'charity_2020/africa', 'charity_2020/haiti'
];
const data = {
  msg: 'test',
  todaysDate: '2021-05-26',
  priAcc: 'bank_2020',
  priAccUrl: '/edit?edit_priacc=bank_2020',
  transactions,
  accList,
  accGrpList,
  editId: null
};

// Home page route
router.get('/edit', function (req, res) {
  console.log('get /edit');
  res.render('edit', { layout: 'edit', ...data });
});

router.post('/editing', async function (req, res) {
  const {
    date,
    amt,
    edit_priacc: priAcc,
    grp: accGrp,
    note: noteTmp,
    op,
    dstacc = '', // For mvTrans
    trans_num: transNum // For rmvTrans/mvTrans/updateTrans
  } = req.body;

  const allowZero = false;
  const state = store.getState();
  const accList = getAccList(state);
  const accGrpList = getAccGrpList(state);
  const note = noteTmp.trim().length === 0 ? 'n/a' : noteTmp.trim();

  try {
    // Clear previous error messages
    await store.dispatch(clearMessages());
    // Process post request
    switch(op) {
      case 'update': {
        if (validateDate(date, allowZero) &&
            validateAccGrp(accGrp, accGrpList) &&
            validateAmt(amt) &&
            validateNote(note) &&
            validateTransNum(transNum)) {
          const [acc, grp] = accGrp.split('/');
          await store.dispatch(updateTransaction({ acc, transNum, date, grp, amt, note }));
        }
        break;
      }
      case 'delete': {
        if (validateAcc(priAcc, accList) &&
            validateTransNum(transNum)) {
          await store.dispatch(rmvTransaction({ acc: priAcc, transNum }));
        }
        break;
      }
      case 'move': {
        if (validateDate(date, allowZero) &&
            validateAccGrp(accGrp, accGrpList) &&
            validateAmt(amt) &&
            validateNote(note) &&
            validateTransNum(transNum) &&
            validateAcc(dstacc, accList)) {
          const [acc, grp] = accGrp.split('/');
          await store.dispatch(mvTransaction({ frAcc: acc, transNum, toAcc: dstacc, date, grp, amt, note }));
        }
        break;
      }
      case 'add': {
        if (validateDate(date, allowZero) &&
            validateAccGrp(accGrp, accGrpList) &&
            validateAmt(amt) &&
            validateNote(note)) {
          const [acc, grp] = accGrp.split('/');
          await store.dispatch(updateTransaction({ acc, date, grp, amt, note }));
        }
        break;
      }
      default:
        await store.dispatch(setError(`ERROR: Unable to process operation (${op}).`));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect(`edit?edit_priacc=${priAcc}`);
});

router.post('/edit', function (req, res) {
  console.log(req.body);
  const { submit_edit_trans: editIdStr = null, go = null } = req.body;
  if (editIdStr !== null) {
    data.editId = Number(editIdStr);
  }
  if (go !== null) {
    data.editId = null;
  }
  res.redirect('edit?edit_priacc=bank_2020');
});

module.exports = router;
