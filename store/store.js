const { configureStore } = require('@reduxjs/toolkit');
const { reducer: enterReducer } = require('./slices/enterSlice');
const { reducer: editReducer } = require('./slices/editSlice');
const { reducer: reportReducer } = require('./slices/reportSlice');

const store = configureStore({
  reducer: {
    enter: enterReducer,
    edit: editReducer,
    report: reportReducer
  }
});

module.exports = store;
