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
