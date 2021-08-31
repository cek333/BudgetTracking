const db = require('../models');
const transOrm = require('./transOrm');

const reportOrm = {
  getReport: async function (acc, startDate, endDate, type) {
    // Just-in-time account loading. Assume 'acc' is valid account.
    if (!db[acc]) {
      await transOrm.initAccount(acc);
    }
    let whereClause = '';
    if (startDate && endDate) {
      whereClause = 'WHERE date >= :startDate AND date <= :endDate';
    } else if (startDate) {
      whereClause = 'WHERE date >= :startDate';
    } else if (endDate) {
      whereClause = 'WHERE date <= :endDate';
    }
    let selectClause;
    let groupClause = '';
    let orderClause;
    if (type) {
      // Balance Sheet Report
      selectClause = 'category, sum(amount) as sum';
      groupClause = 'GROUP BY category';
      orderClause = 'ORDER BY category';
    } else {
      // Raw Report
      selectClause = 'date, category, amount, note';
      orderClause = 'ORDER BY date';
    }
    const query = `SELECT ${selectClause} FROM :acc ${whereClause} ${groupClause} ${orderClause}`;
    return db.sequelize.query(
      query,
      {
        replacements: { acc, startDate, endDate },
        type: db.Sequelize.QueryTypes.SELECT
      }
    );
  }
};

module.exports = reportOrm;
