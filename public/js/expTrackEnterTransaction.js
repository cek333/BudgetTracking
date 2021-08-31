// VALIDATE ALL FORM FIELDS
function validateEnterTransaction(form) {
  var msgField = document.getElementById("msg");
  return (validateDate(form["date"], msgField) && 
          validatePositiveAmt(form["amt"], msgField) &&
          validateAccGrp(form["pri_acc"], msgField) &&
          validateNote(form["comments"], msgField));
}

function validateGenReport(form) {
  var msgField = document.getElementById("msg");
  return (validateZeroDate(form["start_date"], msgField) &&
          validateZeroDate(form["end_date"], msgField) &&
          validateAcc(form["rpt_acc"], msgField));
}

function validateEditMode(form) {
  var msgField = document.getElementById("msg");
  return validateAcc(form["edit_priacc"], msgField);
}

function validateMergeAccounts(form) {
  var msgField = document.getElementById("msg");
  return (validateAcc(form["base_acc"], msgField) &&
          validateAcc(form["sec_acc"], msgField));
}

function validateAddAccount(form) {
  var msgField = document.getElementById("msg");
  return validateName(form["new_acc"], msgField);
}

function validateRemoveAccount(form) {
  var msgField = document.getElementById("msg");
  return validateAcc(form["rmv_acc"], msgField);
}

function validateAddGroup(form) {
  var msgField = document.getElementById("msg");
  return (validateAcc(form["grp_acc"], msgField) &&
          validateName(form["new_grp"], msgField));
}

function validateRemoveGroup(form) {
  var msgField = document.getElementById("msg");
  return validateAccGrp(form["rmv_grp"], msgField);
}

function validateRemoveTransaction(form) {
  var msgField = document.getElementById("msg");
  return (validateAcc(form["trans_acc"], msgField) &&
          validateTransNum(form["trans_num"], msgField));
}

function validateCopyAccount(form) {
  var msgField = document.getElementById("msg");
  return (validateAcc(form["old_acc"], msgField) &&
          validateName(form["duplicate_acc"], msgField));
}

window.onload = function(evt) {
  var msgField = document.getElementById("msg");
  // Hook up event handlers
  // ENTER TRANSACTION form
  document.getElementById("date").onblur = function(evt) {
    validateDate(this, msgField);
  };
  document.getElementById("amt").onblur = function(evt) { 
    validatePositiveAmt(this, msgField);
  };
  document.getElementById("pri_acc").onblur = function(evt) {
    validateAccGrp(this, msgField);
  };
  document.getElementById("comments").onblur = function(evt) {
    validateNote(this, msgField);
  };
  document.getElementById("link_acc").onblur = function(evt) {
    validateAccGrp(this, msgField);
  };
  // CREATE A REPORT form
  document.getElementById("start_date").onblur = function(evt) {
    validateZeroDate(this, msgField);
  };
  document.getElementById("end_date").onblur = function(evt) {
    validateZeroDate(this, msgField);
  };
  document.getElementById("rpt_acc").onblur = function(evt) {
    validateAcc(this, msgField);
  };
  // EDIT MODE form
  document.getElementById("edit_priacc").onblur = function(evt) {
    validateAcc(this, msgField);
  };
  // MERGE ACCOUNTS form
  document.getElementById("base_acc").onblur = function(evt) {
    validateAcc(this, msgField);
  };
  document.getElementById("sec_acc").onblur = function(evt) {
    validateAcc(this, msgField);
  };
  // ADD AN ACCOUNT form
  document.getElementById("new_acc").onblur = function(evt) {
    validateName(this, msgField);
  };
  // REMOVE AN ACCOUNT form
  document.getElementById("rmv_acc").onblur = function(evt) {
    validateAcc(this, msgField);
  };
  // ADD A GROUP form
  document.getElementById("grp_acc").onblur = function(evt) {
    validateAcc(this, msgField);
  }; 
  document.getElementById("new_grp").onblur = function(evt) {
    validateName(this, msgField);
  };
  // REMOVE GROUP form
  document.getElementById("rmv_grp").onblur = function(evt) {
    validateAccGrp(this, msgField);
  };
  // REMOVE TRANSACTION form
  document.getElementById("trans_acc").onblur = function(evt) {
    validateAcc(this, msgField);
  };
  document.getElementById("trans_num").onblur = function(evt) {
    validateTransNum(this, msgField);
  };
  // COPY ACCOUNT form
  document.getElementById("old_acc").onblur = function(evt) {
    validateAcc(this, msgField);
  };
  document.getElementById("duplicate_acc").onblur = function(evt) {
    validateName(this, msgField);
  };
  // ONSUBMIT EVENTS
  document.getElementById("f_add_trans").onsubmit = function(evt) {
    return validateEnterTransaction(this);
  };
  document.getElementById("f_rpt").onsubmit = function(evt) {
    return validateGenReport(this);
  };
  document.getElementById("f_edit").onsubmit = function(evt) {
    return validateEditMode(this);
  };
  document.getElementById("f_merge").onsubmit = function(evt) {
    return validateMergeAccounts(this);
  };
  document.getElementById("f_add_acc").onsubmit = function(evt) {
    return validateAddAccount(this);
  };
  document.getElementById("f_rmv_acc").onsubmit = function(evt) {
    return validateRemoveAccount(this);
  };
  document.getElementById("f_add_grp").onsubmit = function(evt) {
    return validateAddGroup(this);
  };
  document.getElementById("f_rmv_grp").onsubmit = function(evt) {
    return validateRemoveGroup(this);
  };
  document.getElementById("f_rmv_trans").onsubmit = function(evt) {
    return validateRemoveTransaction(this);
  };
  document.getElementById("f_copy").onsubmit = function(evt) {
    return validateCopyAccount(this);
  };
}
