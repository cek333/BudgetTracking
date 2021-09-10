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
  getAccList,
  getAccGrpList
} = require('../store/slices/editSlice');
const {
  validateDate,
  validateAmt,
  validateAcc,
  validateAccGrp,
  validateNote,
  validateTransNum
} = require('./validateUtil');

/*
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
  accGrpList
};
*/

// Home page route
router.get('/:id?', async function (req, res) {
  const { id = null } = req.params;
  const editId = (id === null) ? null : Number(id);
  const { edit_priacc: editAccQuery = '' } = req.query;
  let state = store.getState();
  if (editAccQuery !== '' && state.edit.editAcc !== editAccQuery) {
    // load specified acc
    await store.dispatch(refreshStore(editAccQuery));
    // Get updated state
    state = store.getState();
  }
  res.render('edit', { layout: 'edit', ...state.edit, editId });
});

router.post('/', async function (req, res) {
  const {
    date,
    amt,
    edit_priacc: priAcc,
    grp: accGrp,
    note: noteTmp = '',
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
    switch (op) {
      case 'update': {
        if (validateDate(date, allowZero) &&
            validateAccGrp(accGrp, accGrpList) &&
            validateAmt(amt) &&
            validateNote(note) &&
            validateTransNum(transNum)) {
          const [acc, grp] = accGrp.split('/');
          const amtVal = Number(amt);
          await store.dispatch(updateTransaction({ acc, transNum, date, grp, amt: amtVal, note }));
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
          const amtVal = Number(amt);
          await store.dispatch(mvTransaction({ frAcc: acc, transNum, toAcc: dstacc, date, grp, amt: amtVal, note }));
        }
        break;
      }
      case 'add': {
        if (validateDate(date, allowZero) &&
            validateAccGrp(accGrp, accGrpList) &&
            validateAmt(amt) &&
            validateNote(note)) {
          const [acc, grp] = accGrp.split('/');
          const amtVal = Number(amt);
          await store.dispatch(addTransaction({ acc, date, grp, amt: amtVal, note }));
        }
        break;
      }
      default:
        await store.dispatch(setError(`ERROR: Unable to process operation (${op}).`));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect(`/edit?edit_priacc=${priAcc}`);
});

module.exports = router;
