const path = require('path');

module.exports = {
  development: {
    storage: path.join(__dirname, '..', 'db', 'budget.sqlite'),
    dialect: 'sqlite'
  },
  test: {
    storage: path.join(__dirname, '..', 'db', 'budget_test.sqlite'),
    dialect: 'sqlite',
    logging: false // supress logs
  },
  // test: {
  //   dialect: 'sqlite', // in-memory db is the default
  //   logging: false // supress logs from cluttering test reports. Comment this line for debugging.
  // },
  production: {
    storage: path.join(__dirname, '..', 'db', 'budget.sqlite'),
    dialect: 'sqlite'
  }
};
