const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const transOrm = require('../../orm/transOrm');
const attrOrm = require('../../orm/attrOrm');

const refreshStore = createAsyncThunk(
  'edit/refreshStore',
  async (editAcc, thunkAPI) => {
    const accList = await attrOrm.getAccounts();
    const groups = await attrOrm.getGroups(editAcc);
    const accGrpList = groups.map(grp => `${editAcc}/${grp}`);
    await thunkAPI.dispatch(refreshTransactions(editAcc));
    return { accList, accGrpList, editAcc };
  }
);

const refreshTransactions = createAsyncThunk(
  'edit/refreshTransactions',
  async (editAcc) => {
    const trans = await transOrm.getTransactions(editAcc);
    // Add balance info
    let bal = 0;
    const transBal = trans.map(tr => {
      bal += tr.amount;
      return { ...tr, balance: bal };
    });
    return transBal;
  }
);

const addTransaction = createAsyncThunk(
  'edit/addTransaction',
  async ({ acc, date, grp, amt, note }, thunkAPI) => {
    await transOrm.addTransaction(acc, date, grp, amt, note);
    await thunkAPI.dispatch(refreshTransactions(acc));
    return { acc, date, grp, amt, note };
  }
);

const rmvTransaction = createAsyncThunk(
  'edit/rmvTransaction',
  async ({ acc, transNum }, thunkAPI) => {
    await transOrm.removeTransaction(acc, transNum);
    await thunkAPI.dispatch(refreshTransactions(acc));
    return { acc, transNum };
  }
);

const updateTransaction = createAsyncThunk(
  'edit/updateTransaction',
  async ({ acc, transNum, date, grp, amt, note }, thunkAPI) => {
    await transOrm.updateTransaction(acc, transNum, date, grp, amt, note);
    await thunkAPI.dispatch(refreshTransactions(acc));
    return { acc, transNum };
  }
);

const mvTransaction = createAsyncThunk(
  'edit/mvTransaction',
  async ({ frAcc, transNum, toAcc, date, grp, amt, note }, thunkAPI) => {
    await transOrm.removeTransaction(frAcc, transNum);
    await transOrm.addTransaction(toAcc, date, grp, amt, note);
    const toGrps = await attrOrm.getGroups(toAcc);
    if (!toGrps.includes(grp)) {
      await attrOrm.addGroupToAccount(toAcc, grp);
    }
    await thunkAPI.dispatch(refreshTransactions(frAcc));
    return { frAcc, transNum, toAcc };
  }
);

const initialState = {
  lastTransaction: {
    date: new Date().toLocaleDateString(),
    amt: null,
    accGrp: null,
    note: null
  },
  msg: '',
  error: '',
  accList: [],
  accGrpList: [],
  transactions: [],
  editAcc: '',
  editAccUrl: '',
  editId: null
};

function isRejectedAction(action) {
  return action.type.endsWith('rejected');
}

const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    clearMessages: (state, action) => {
      state.msg = '';
      state.error = '';
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setEditId: (state, action) => {
      const editId = action.payload;
      if (editId === null) {
        state.editId = null;
      } else {
        state.editId = Number(editId);
      }
    }
  },
  // Add logic for reducer actions generated by createAsyncThunk
  extraReducers: (builder) => {
    builder
      .addCase(refreshStore.fulfilled, (state, action) => {
        const { accList, accGrpList, editAcc } = action.payload;
        state.accList = accList;
        state.accGrpList = accGrpList;
        state.editAcc = editAcc;
        state.editAccUrl = `/edit?edit_priacc=${editAcc}`;
        state.editId = null;
      })
      .addCase(refreshTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        const { acc, date, grp, amt, note } = action.payload;
        state.msg = `${state.msg} Account(${acc}) Updated.`.trim();
        state.lastTransaction.date = date;
        state.lastTransaction.amt = amt;
        state.lastTransaction.accGrp = `${acc}/${grp}`;
        state.lastTransaction.note = note;
      })
      .addCase(rmvTransaction.fulfilled, (state, action) => {
        const { acc, transNum } = action.payload;
        state.msg = `${state.msg} Transaction ${transNum} has been removed from Account(${acc}).`.trim();
        state.editId = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const { acc, transNum } = action.payload;
        state.msg = `${state.msg} Transaction ${transNum} from Account ${acc} has been updated.`.trim();
        state.editId = null;
      })
      .addCase(mvTransaction.fulfilled, (state, action) => {
        const { frAcc, transNum, toAcc } = action.payload;
        let newMsg = `Transaction ${transNum} has been removed from Account(${frAcc}).`;
        newMsg += ` Account(${toAcc}) Updated.`;
        state.msg = `${state.msg} ${newMsg}).`.trim();
        state.editId = null;
      })
      .addMatcher(isRejectedAction, (state, action) => {
        // Handle all rejected actions
        state.error = `ERROR: ${action.error.message}`;
      });
  }
});

const { clearMessages, setError, setEditId } = editSlice.actions;

const getAccList = state => state.edit.accList;
const getAccGrpList = state => state.edit.accGrpList;

module.exports = {
  // async thunks
  refreshStore,
  addTransaction,
  rmvTransaction,
  updateTransaction,
  mvTransaction,
  // (sync) actions
  clearMessages,
  setError,
  setEditId,
  // selectors
  getAccList,
  getAccGrpList,
  // reducer
  reducer: editSlice.reducer
};
