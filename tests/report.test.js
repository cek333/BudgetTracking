const attrOrm = require('../orm/attrOrm');
const transOrm = require('../orm/transOrm');
const reportOrm = require('../orm/reportOrm');

describe.skip('Reporting', () => {
  const acc = 'main';
  const DATA_RAW = [
    [1000, '2008-02-15', 'travel', -47.00, 'gta pass'],
    [1001, '2008-03-15', 'charity', -16.00, 'daily bread'],
    [1002, '2008-04-15', 'pay', 2182.64, 'work'],
    [1003, '2008-05-15', 'travel', -47.00, 'gta pass'],
    [1004, '2008-06-15', 'electronics', -113.00, 'router'],
    [1005, '2008-07-15', 'house', -400.00, 'n/a'],
    [1006, '2008-08-15', 'charity', -20.00, 'visions of science'],
    [1007, '2008-09-15', 'travel', -47.00, 'gta pass'],
    [1008, '2008-10-15', 'electronics', -556.50, 'laptop'],
    [1009, '2008-11-15', 'ccard', -248.85, 'n/a'],
    [1010, '2008-12-15', 'pay', 2196.39, 'work'],
    [1011, '2009-01-15', 'travel', -47.00, 'gta pass'],
    [1012, '2009-02-15', 'family', -100.00, 'sister'],
    [1013, '2009-03-15', 'travel', -47.00, 'gta pass'],
    [1014, '2009-04-15', 'charity', -16.00, 'daily bread'],
    [1015, '2009-05-15', 'charity', -250.00, 'visions of science'],
    [1016, '2009-06-15', 'charity', -100.00, 'ballet creole']
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

  beforeAll(async () => {
    await attrOrm.addAccount(acc);
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
        const [testId, expDate, expGrp, expAmt, expNote] = DATA_RAW[idx];
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
        const [testId, expDate, expGrp, expAmt, expNote] = DATA_RAW_200803_200812[idx];
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
});
