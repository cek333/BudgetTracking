const { configureStore } = require('@reduxjs/toolkit');
const { reducer: enterReducer } = require('./slices/enterSlice');

const store = configureStore({
  reducer: {
    enter: enterReducer,
    // edit: editReducer,
    // report: reportReducer
  }
});

module.exports = store;
