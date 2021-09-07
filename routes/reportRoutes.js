const express = require('express');
const router = express.Router();
const store = require('../store/store');
const {
  fetchReport,
  setError
} = require('../store/slices/reportSlice');
const {
  validateDate,
  validateAcc
} = require('./validateUtil');

router.get('/', async function (req, res) {
  let {
    start_date: startDate,
    end_date: endDate,
    rpt_acc: acc,
    rpt_type: type
  } = req.query;
  type = Number(type) === 1 ? 1 : 0;
  startDate = startDate === '0' ? 0 : startDate;
  endDate = endDate === '0' ? 0 : endDate;
  const allowZero = 1; // specifying 0 => all dates
  let state = store.getState();
  const accList = state.enter.accList;
  try {
    if (validateDate(startDate, allowZero) &&
        validateDate(endDate, allowZero) &&
        validateAcc(acc, accList)) {
      await store.dispatch(fetchReport({ acc, startDate, endDate, type }));
    }
  } catch (err) {
    store.dispatch(setError(err.message));
  }
  res.redirect('/enter');
  // state = store.getState();
  // res.render('report', { layout: 'report', ...state.report });
});

module.exports = router;
