function validateDate(choice, allowZero = false) {
  const validDate = /^(\d{4}(-\d{2}(-\d{2})?)?)$/;
  if (allowZero && Number(choice) === 0) {
    return true;
  }
  if (validDate.test(choice)) {
    return true;
  } else {
    throw new Error('ERROR: Please enter a valid date!');
  }
}

function validatePositiveAmt(choice) {
  if (choice[0] === '-') {
    throw new Error("ERROR: Don't enter sign with amt, please use checkbox!");
  } else {
    return validateAmt(choice);
  }
}

function validateAmt(choice) {
  const validNum = /^((-?)((\d+)|(\d*\.\d{1,2})))$/;
  if (validNum.test(choice)) {
    return true;
  } else {
    throw new Error('ERROR: Please enter a valid amount!');
  }
}

function validateAcc(choice, accList) {
  if (accList.includes(choice)) {
    return true;
  } else {
    throw new Error('ERROR: Please select a valid account!');
  }
}

function validateAccGrp(choice, accGrpList) {
  if (accGrpList.includes(choice)) {
    return true;
  } else {
    throw new Error('ERROR: Please select a valid account/group!');
  }
}

function validateName(choice) {
  const MAX_NAME_LEN = 50;
  const validName = /\w+/;
  if (choice.length > MAX_NAME_LEN) {
    throw new Error(`ERROR: Name should not exceed ${MAX_NAME_LEN} characters`);
  }
  if (validName.test(choice)) {
    return true;
  } else {
    throw new Error('ERROR: Please enter a valid name!');
  }
}

// Assume choice.length >= 1
function validateNote(choice) {
  const MAX_NOTE_LEN = 256;
  const validNote = /\S.*/;
  if (choice.length > MAX_NOTE_LEN) {
    throw new Error(`ERROR: Note should not exceed ${MAX_NOTE_LEN} characters`);
  }
  if (/(\n|\r)/.test(choice)) {
    throw new Error('ERROR: Note should not contain any newlines');
  }
  if (/[,&"']/.test(choice)) {
    throw new Error('ERROR: Note should not contain any commas, ampersands, or quotes');
  }
  if (validNote.test(choice)) {
    return true;
  } else {
    console.error('validateNote: Unexpected error validating note!');
  }
}

function validateTransNum(choice) {
  const validTransNum = /^(\d{1,5})$/;
  if (validTransNum.test(choice)) {
    return true;
  } else {
    throw new Error('ERROR: Please enter a valid transaction number!');
  }
}

module.exports = {
  validateDate,
  validatePositiveAmt,
  validateAmt,
  validateAcc,
  validateAccGrp,
  validateName,
  validateNote,
  validateTransNum
};
