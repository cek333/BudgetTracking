const store = require('../store/store');
const { resetState } = require('../store/slices/editSlice');

// Used to reset/invalidate edit slice data if post operation perfomed on 'enter' page.
// Post operation on 'enter' page means that account properties may have been updated.
module.exports = (req, res, next) => {
  store.dispatch(resetState());
  next();
};
