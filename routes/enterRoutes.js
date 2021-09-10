const express = require('express');
const router = express.Router();
const store = require('../store/store');
const {
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
  setError,
  getAccList,
  getAccGrpList
} = require('../store/slices/enterSlice');
const {
  validateDate,
  validatePositiveAmt,
  validateAcc,
  validateAccGrp,
  validateName,
  validateNote,
  validateTransNum
} = require('./validateUtil');

/*
const transactions = [
  { date: '2010-10-10', transNum: 1000, group: 'mbna', comments: 'paid balance', amt: 10, balance: 100 },
  { date: '2010-11-10', transNum: 1010, group: 'visa', comments: 'paid balance', amt: 20, balance: 80 },
  { date: '2010-12-10', transNum: 1020, group: 'food', comments: 'groceries', amt: 30, balance: 50 }
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

router.get('/', function (req, res) {
  const state = store.getState();
  res.render('enter', { layout: 'enter', ...state.enter });
});

router.post('/add_trans', async function (req, res) {
  const { date, sign, amt, pri_acc: priAccGrp, comments, link_acc: linkAccGrp } = req.body;
  const allowZero = false;
  const BLANK_ACC_GRP = '--/--';
  const accGrpList = getAccGrpList(store.getState());
  const note = comments.trim().length === 0 ? 'n/a' : comments.trim();
  try {
    if (validateDate(date, allowZero) &&
        validatePositiveAmt(amt) &&
        validateAccGrp(priAccGrp, accGrpList) &&
        validateNote(note)) {
      const [acc, grp] = priAccGrp.split('/');
      const priAmt = Number(amt) * (sign === '-' ? -1 : 1);
      await store.dispatch(addTransaction({ acc, date, grp, amt: priAmt, note }));
      if (linkAccGrp !== BLANK_ACC_GRP && validateAccGrp(linkAccGrp, accGrpList)) {
        const linkAmt = priAmt * -1;
        const [acc, grp] = linkAccGrp.split('/');
        await store.dispatch(addTransaction({ acc, date, grp, amt: linkAmt, note }));
      }
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/merge', async function (req, res) {
  const { base_acc: baseAcc, sec_acc: secAcc } = req.body;
  const accList = getAccList(store.getState());
  try {
    if (validateAcc(baseAcc, accList) &&
        validateAcc(secAcc, accList)) {
      await store.dispatch(mergeAccounts({ toAcc: baseAcc, frAcc: secAcc }));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/add_acc', async function (req, res) {
  const { new_acc: newAcc } = req.body;
  try {
    if (validateName(newAcc)) {
      await store.dispatch(addAccount(newAcc));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/rmv_acc', async function (req, res) {
  const { rmv_acc: rmvAcc } = req.body;
  const accList = getAccList(store.getState());
  try {
    if (validateAcc(rmvAcc, accList)) {
      await store.dispatch(rmvAccount(rmvAcc));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/add_grp', async function (req, res) {
  const { grp_acc: grpAcc, new_grp: newGrp } = req.body;
  const accList = getAccList(store.getState());
  try {
    if (validateAcc(grpAcc, accList) &&
        validateName(newGrp)) {
      await store.dispatch(addGroup({ acc: grpAcc, grp: newGrp }));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/rmv_grp', async function (req, res) {
  const { rmv_grp: rmvAccGrp, submit_rmv_grp: op } = req.body;
  const accGrpList = getAccGrpList(store.getState());
  try {
    if (validateAccGrp(rmvAccGrp, accGrpList)) {
      const [acc, grp] = rmvAccGrp.split('/');
      if (op === 'Remove Group') {
        await store.dispatch(rmvGroup({ acc, grp }));
      } else {
        await store.dispatch(rmvTransactionsByGroup({ acc, grp }));
      }
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/rmv_trans', async function (req, res) {
  const { trans_acc: transAcc, trans_num: transNum } = req.body;
  const accList = getAccList(store.getState());
  try {
    if (validateAcc(transAcc, accList) &&
        validateTransNum(transNum)) {
      await store.dispatch(rmvTransaction({ acc: transAcc, transNum }));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/cp_acc', async function (req, res) {
  const { old_acc: frAcc, duplicate_acc: toAcc, cp_acc_trans: cpTrans = 'NO' } = req.body;
  const accList = getAccList(store.getState());
  try {
    if (validateAcc(frAcc, accList) &&
        validateName(toAcc)) {
      const cpTransBool = cpTrans === 'YES';
      await store.dispatch(copyAccount({ frAcc, toAcc, cpTrans: cpTransBool }));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

router.post('/filter', async function (req, res) {
  const { filter } = req.body;
  try {
    await store.dispatch(applyFilter(filter));
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/');
});

// router.post('/', function (req, res) {
//   console.log(req.body);
//   res.redirect('/');
// });

module.exports = router;
