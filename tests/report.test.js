const attrOrm = require('../orm/attrOrm');
const transOrm = require('../orm/transOrm');
const reportOrm = require('../orm/reportOrm');
const { refreshStore } = require('../store/slices/enterSlice');
const store = require('../store/store');
const app = require('../app/app');
const request = require('supertest');

describe('Reporting', () => {
  const acc = 'main';
  const DATA_RAW = [
    [1000, '2008-02-15', 'travel', -47.00, 'gta pass', -47.00],
    [1001, '2008-03-15', 'charity', -16.00, 'daily bread', -63.00],
    [1002, '2008-04-15', 'pay', 2182.64, 'work', 2119.64],
    [1003, '2008-05-15', 'travel', -47.00, 'gta pass', 2072.64],
    [1004, '2008-06-15', 'electronics', -113.00, 'router', 1959.64],
    [1005, '2008-07-15', 'house', -400.00, 'n/a', 1559.64],
    [1006, '2008-08-15', 'charity', -20.00, 'visions of science', 1539.64],
    [1007, '2008-09-15', 'travel', -47.00, 'gta pass', 1492.64],
    [1008, '2008-10-15', 'electronics', -556.50, 'laptop', 936.14],
    [1009, '2008-11-15', 'ccard', -248.85, 'n/a', 687.29],
    [1010, '2008-12-15', 'pay', 2196.39, 'work', 2883.68],
    [1011, '2009-01-15', 'travel', -47.00, 'gta pass', 2836.68],
    [1012, '2009-02-15', 'family', -100.00, 'sister', 2736.68],
    [1013, '2009-03-15', 'travel', -47.00, 'gta pass', 2689.68],
    [1014, '2009-04-15', 'charity', -16.00, 'daily bread', 2673.68],
    [1015, '2009-05-15', 'charity', -250.00, 'visions of science', 2423.68],
    [1016, '2009-06-15', 'charity', -100.00, 'ballet creole', 2323.68]
  ];
  const DATA_RAW_200803_200812 = DATA_RAW.slice(1, 10);
  const DATA_BALANCESHEET = [
    ['ccard', -248.85],
    ['charity', -402.00],
    ['electronics', -669.50],
    ['family', -100.00],
    ['house', -400.00],
    ['pay', 4379.03],
    ['travel', -235.00]
  ];
  const DATA_BALANCESHEET_200803_200812 = [
    ['ccard', -248.85],
    ['charity', -36.00],
    ['electronics', -669.50],
    ['house', -400.00],
    ['pay', 2182.64],
    ['travel', -94.00]
  ];
  const DATA_BALANCESHEET_IN_OUT = {
    income: {
      data: [
        ['pay', 4379.03]
      ],
      total: 4379.03
    },
    expenditures: {
      data: [
        ['ccard', 248.85],
        ['charity', 402.00],
        ['electronics', 669.50],
        ['family', 100.00],
        ['house', 400.00],
        ['travel', 235.00]
      ],
      total: 2055.35
    }
  };

  beforeAll(async () => {
    await attrOrm.addAccount(acc);
    // reportRoutes reads accList from enter slice; so ensure enter slice is populated
    await store.dispatch(refreshStore());
    DATA_RAW.forEach(async (trans) => {
      await transOrm.addTransaction(acc, ...trans.slice(1));
    });
  });
  test('Full Raw Report', async () => {
    const startDate = 0;
    const endDate = 0;
    const type = 0; // raw
    try {
      const result = await reportOrm.getReport(acc, startDate, endDate, type);
      expect(result.length).toEqual(DATA_RAW.length);
      result.forEach((trans, idx) => {
        const [testId, expDate, expGrp, expAmt, expNote, expBal] = DATA_RAW[idx];
        // verify date
        expect(trans.date).toEqual(expDate);
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify amt
        expect(trans.amount).toEqual(expAmt);
        // verify note
        expect(trans.note).toEqual(expNote);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Partial Raw Report', async () => {
    const startDate = '2008-03';
    const endDate = '2008-12';
    const type = 0; // raw
    try {
      const result = await reportOrm.getReport(acc, startDate, endDate, type);
      expect(result.length).toEqual(DATA_RAW_200803_200812.length);
      result.forEach((trans, idx) => {
        const [testId, expDate, expGrp, expAmt, expNote, expBal] = DATA_RAW_200803_200812[idx];
        // verify date
        expect(trans.date).toEqual(expDate);
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify amt
        expect(trans.amount).toEqual(expAmt);
        // verify note
        expect(trans.note).toEqual(expNote);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Full Balance Sheet Report', async () => {
    const startDate = 0;
    const endDate = 0;
    const type = 1; // balance sheet
    try {
      const result = await reportOrm.getReport(acc, startDate, endDate, type);
      expect(result.length).toEqual(DATA_BALANCESHEET.length);
      result.forEach((trans, idx) => {
        const [expGrp, expSum] = DATA_BALANCESHEET[idx];
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify total
        expect(trans.sum).toEqual(expSum);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Partial Balance Sheet Report', async () => {
    const startDate = '2008-03';
    const endDate = '2008-12';
    const type = 1; // balance sheet
    try {
      const result = await reportOrm.getReport(acc, startDate, endDate, type);
      expect(result.length).toEqual(DATA_BALANCESHEET_200803_200812.length);
      result.forEach((trans, idx) => {
        const [expGrp, expSum] = DATA_BALANCESHEET_200803_200812[idx];
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify total
        expect(trans.sum).toEqual(expSum);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('/report Endpoint Full Raw Report', async () => {
    const startDate = 0;
    const endDate = 0;
    const type = 0; // raw
    try {
      await request(app)
        .get(`/report?start_date=${startDate}&end_date=${endDate}&rpt_type=${type}&rpt_acc=${acc}`)
        .expect(302);
      const state = store.getState();
      expect(state.report.error).toBeFalsy();
      expect(state.report.priAcc).toEqual(acc);
      expect(state.report.type).toEqual(type);
      expect(state.report.data.length).toEqual(DATA_RAW.length);
      state.report.data.forEach((trans, idx) => {
        const [testId, expDate, expGrp, expAmt, expNote, expBal] = DATA_RAW[idx];
        // verify date
        expect(trans.date).toEqual(expDate);
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify amt
        expect(trans.amount).toEqual(expAmt);
        // verify note
        expect(trans.note).toEqual(expNote);
        // verify balance
        expect(trans.balance).toEqual(expBal);
      });
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('/report Endpoint Full Balance Sheet Report', async () => {
    const startDate = 0;
    const endDate = 0;
    const type = 1; // balance sheet
    try {
      await request(app)
        .get(`/report?start_date=${startDate}&end_date=${endDate}&rpt_type=${type}&rpt_acc=${acc}`)
        .expect(302);
      const state = store.getState();
      expect(state.report.error).toBeFalsy();
      expect(state.report.priAcc).toEqual(acc);
      expect(state.report.type).toEqual(type);
      expect(state.report.data.income.data.length)
        .toEqual(DATA_BALANCESHEET_IN_OUT.income.data.length);
      expect(state.report.data.expenditures.data.length)
        .toEqual(DATA_BALANCESHEET_IN_OUT.expenditures.data.length);

      // Verify income sub totals
      state.report.data.income.data.forEach((trans, idx) => {
        const [expGrp, expSum] = DATA_BALANCESHEET_IN_OUT.income.data[idx];
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify total
        expect(trans.sum).toEqual(expSum);
      });
      expect(state.report.data.income.total)
        .toEqual(DATA_BALANCESHEET_IN_OUT.income.total);

      // Verify expenditure sub totals
      state.report.data.expenditures.data.forEach((trans, idx) => {
        const [expGrp, expSum] = DATA_BALANCESHEET_IN_OUT.expenditures.data[idx];
        // verify group
        expect(trans.category).toEqual(expGrp);
        // verify total
        expect(trans.sum).toEqual(expSum);
      });
      expect(state.report.data.expenditures.total)
        .toEqual(DATA_BALANCESHEET_IN_OUT.expenditures.total);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
});
