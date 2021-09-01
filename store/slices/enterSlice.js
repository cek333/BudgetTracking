const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');
const transOrm = require('../../orm/transOrm');
const attrOrm = require('../../orm/attrOrm');

const refreshStore = createAsyncThunk(
  'enter/refreshStore',
  async () => {
    const accList = await attrOrm.getAccounts();
    const accGrpList = [];
    for (let idx = 0; idx < accList.length; idx++) {
      const acc = accList[idx];
      const groups = await attrOrm.getGroups(acc);
      for (const grp of groups) {
        accGrpList.push(`${acc}/${grp}`);
      }
    }
    return { accList, accGrpList };
  }
);

const addAccount = createAsyncThunk(
  'enter/addAccount',
  async (newAcc) => {
    await attrOrm.addAccount(newAcc);
    return newAcc;
  }
);

const rmvAccount = createAsyncThunk(
  'enter/rmvAccount',
  async (rmvAcc) => {
    await attrOrm.removeAccount(rmvAcc);
    return rmvAcc;
  }
);

const addGroup = createAsyncThunk(
  'enter/addGroup',
  async ({ acc, grp }) => {
    await attrOrm.addGroupToAccount(acc, grp);
    return { acc, grp };
  }
);

const rmvGroup = createAsyncThunk(
  'enter/rmvGroup',
  async ({ acc, grp }) => {
    await attrOrm.removeGroupFromAccount(acc, grp);
    return { acc, grp };
  }
);

const addTransaction = createAsyncThunk(
  'enter/addTransaction',
  async ({ acc, date, grp, amt, note }) => {
    await transOrm.addTransaction(acc, date, grp, amt, note);
    return { acc, date, grp, amt, note };
  }
);

const rmvTransaction = createAsyncThunk(
  'enter/rmvTransaction',
  async ({ acc, transNum }) => {
    await transOrm.removeTransaction(acc, transNum);
    return { acc, transNum };
  }
);

const rmvTransactionsByGroup = createAsyncThunk(
  'enter/rmvTransactionsByGroup',
  async ({ acc, grp }) => {
    const rmvCnt = await transOrm.removeTransactionByGroup(acc, grp);
    return { acc, grp, rmvCnt };
  }
);

const copyAccount = createAsyncThunk(
  'enter/copyAccount',
  async ({ frAcc, toAcc, cpTrans }, thunkAPI) => {
    await attrOrm.copyAccount(frAcc, toAcc, cpTrans);
    // Account attributes are update in the process. Re-fetch.
    await thunkAPI.dispatch(refreshStore());
    return { frAcc, toAcc, cpTrans };
  }
);

const mergeAccounts = createAsyncThunk(
  'enter/mergeAccounts',
  async ({ toAcc, frAcc }, thunkAPI) => {
    await attrOrm.mergeAccounts(frAcc, toAcc);
    // Account attributes may get updated in the process. Re-fetch.
    await thunkAPI.dispatch(refreshStore());
    return { frAcc, toAcc };
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
  accFilter: '',
  accList: [],
  accGrpList: []
};

function isRejectedAction(action) {
  return action.type.endsWith('rejected');
}

const enterSlice = createSlice({
  name: 'enter',
  initialState,
  reducers: {
    clearMessages: (state, action) => {
      state.msg = '';
    },
    setError: (state, action) => {
      state.msg = `${state.msg} ${action.payload}`.trim();
    },
    setFilter: (state, action) => {
      state.accFilter = action.payload;
    }
  },
  // Add logic for reducer actions generated by createAsyncThunk
  extraReducers: (builder) => {
    builder
      .addCase(refreshStore.fulfilled, (state, action) => {
        const { accList, accGrpList } = action.payload;
        const accFilter = state.accFilter;
        state.accList = accFilter
          ? accList.filter(acc => acc.indexOf(accFilter) >= 0)
          : accList;
        state.accGrpList = accFilter
          ? accGrpList.filter(accGrp => accGrp.indexOf(accFilter) >= 0)
          : accGrpList;
      })
      .addCase(addAccount.fulfilled, (state, action) => {
        const newAcc = action.payload;
        const accFilter = state.accFilter;
        state.msg = `${state.msg} Account(${newAcc}) created.`.trim();
        if (accFilter && (newAcc.indexOf(accFilter) >= 0)) {
          state.accList = state.accList.concat(newAcc).sort();
        }
      })
      .addCase(rmvAccount.fulfilled, (state, action) => {
        const rmvAcc = action.payload;
        state.accList = state.accList.filter(acc => acc !== rmvAcc);
        state.accGrpList = state.accGrpList.filter(accGrp => {
          const acc = accGrp.substr(0, accGrp.indexOf('/'));
          return acc !== rmvAcc;
        });
        state.msg = `${state.msg} Account(${rmvAcc}) and its associated groups were deleted.`.trim();
      })
      .addCase(addGroup.fulfilled, (state, action) => {
        const { acc, grp } = action.payload;
        const newAccGrp = `${acc}/${grp}`;
        state.accGrpList = state.accGrpList.concat(newAccGrp).sort();
        state.msg = `${state.msg} Group(${grp}) added to Account(${acc}).`.trim();
      })
      .addCase(rmvGroup.fulfilled, (state, action) => {
        const { acc, grp } = action.payload;
        const rmvAccGrp = `${acc}/${grp}`;
        state.accGrpList = state.accGrpList.filter(accGrp => accGrp !== rmvAccGrp);
        state.msg = `${state.msg} Group(${grp}) has been removed from Account(${acc}).`.trim();
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
      })
      .addCase(rmvTransactionsByGroup.fulfilled, (state, action) => {
        const { acc, grp, rmvCnt } = action.payload;
        state.msg = `${state.msg} ${rmvCnt} transactions from '${grp}' were removed from Account(${acc}).`.trim();
      })
      .addCase(copyAccount.fulfilled, (state, action) => {
        const { frAcc, toAcc, cpTrans } = action.payload;
        if (cpTrans) {
          state.msg = `${state.msg} Account attributes of ${frAcc} copied to ${toAcc}.`.trim();
        } else {
          state.msg = `${state.msg} Account ${frAcc} copied to ${toAcc}.`.trim();
        }
      })
      .addCase(mergeAccounts.fulfilled, (state, account) => {
        state.msg = `${state.msg} Merge Successful.`.trim();
      })
      .addMatcher(isRejectedAction, (state, action) => {
        // Handle all rejected actions
        state.msg = `${state.msg} ${action.error.message}`.trim();
      });
  }
});

const { clearMessages, setError, setFilter } = enterSlice.actions;

const getAccList = state => state.enter.accList;
const getAccGrpList = state => state.enter.accGrpList;

module.exports = {
  // async thunks
  refreshStore,
  addAccount,
  rmvAccount,
  addGroup,
  rmvGroup,
  addTransaction,
  rmvTransaction,
  rmvTransactionsByGroup,
  copyAccount,
  mergeAccounts,
  // (sync) actions
  clearMessages,
  setError,
  setFilter,
  // selectors
  getAccList,
  getAccGrpList,
  // reducer
  reducer: enterSlice.reducer
};
