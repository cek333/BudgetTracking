function validateRegEx(regex, inputStr, helpField, helpMsg) {
  // FROM: Headfirst Javascript
  // see if inputStr data validates OK
  if (!regex.test(inputStr)) {
    if (helpField != null) {
      helpField.innerHTML = helpMsg;
    }
    return false;
  } else {
    if (helpField != null) {
      helpField.innerHTML = "";
    }
    return true;
  }
}

function validateDate(formField, msgField) {
  setMsgClass(msgField);
  return validateRegEx(/^\d{4}(-\d{2}(-\d{2})?)?$/, formField.value, 
                       msgField, "ERROR: Enter a valid date!");
}

function validateZeroDate(formField, msgField) {
  setMsgClass(msgField);
  // Date can be 0, otherwise it should be a valid date
  if ((formField.value.length==1) && (parseInt(formField.value)==0)) {
    msgField.innerHTML = "";
    return true;
  } else {
    return validateDate(formField, msgField);
  }
}

function validatePositiveAmt(formField, msgField) {
  setMsgClass(msgField);
  if (formField.value.indexOf("-")==0) {
    msgField.innerHTML = 
        "ERROR: Don't enter sign with amt, please use checkbox!";
    return false;
  } else {
    return validateAmt(formField, msgField);
  }
}

function validateAmt(formField, msgField) {
  setMsgClass(msgField);
  return validateRegEx(/^((-?)((\d+)|(\d*\.\d{1,2})))$/, formField.value, 
             msgField, "ERROR: Please enter a valid amount!");
}

function validateAccGrp(formField, msgField) {
  setMsgClass(msgField);
  if (formField.value == "--/--") {
    msgField.innerHTML = "ERROR: Please select a valid account/group!";
    return false;
  } else {
    msgField.innerHTML = "";
    return true;
  }
}

function validateNote(formField, msgField) {
  setMsgClass(msgField);
  if (formField.value.length>256) {
    msgField.innerHTML = "ERROR: Please enter a shorter comment!";
    return false;
  } else if (formField.value.indexOf(",")>=0) {
    msgField.innerHTML = "ERROR: Please avoid commas in the comment field!";
    return false;
  } else if (formField.value.indexOf("'")>=0) {
    msgField.innerHTML = "ERROR: Please avoid quotes in the comment field!";
    return false;
  } else if (formField.value.indexOf("\"")>=0) {
    msgField.innerHTML = "ERROR: Please avoid quotes in the comment field!";
    return false;
  } else if (formField.value.indexOf("&")>=0) {
    msgField.innerHTML = "ERROR: Please avoid '&' in the comment field!";
    return false;
  } else {
    msgField.innerHTML = "";
    return true;
  }
}

function validateAcc(formField, msgField) {
  setMsgClass(msgField);
  if (formField.value == "--") {
    msgField.innerHTML = "ERROR: Please select a valid account!";
    return false;
  } else {
    msgField.innerHTML = "";
    return true;
  }
}

function validateName(formField, msgField) {
  setMsgClass(msgField);
  if (formField.value.length > 50) {
    msgField.innerHTML = "ERROR: Please enter a shorter name!";
    return false;
  } else {
    return validateRegEx(/^\w+$/, formField.value, 
                         msgField, "ERROR: Please enter a valid name!");
  }
}

function validateTransNum(formField, msgField) {
  setMsgClass(msgField);
  return validateRegEx(/^\d{4,5}$/, formField.value,
    msgField, "ERROR: Please enter a valid transaction number!");
}

function setMsgClass(msgField) {
  msgField.className = "error";
}