const store = require('../store/store');
const { clearMessages } = require('../store/slices/enterSlice');

module.exports = (req, res, next) => {
  store.dispatch(clearMessages());
  next();
};
