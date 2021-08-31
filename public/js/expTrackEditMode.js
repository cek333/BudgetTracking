// VALIDATE ALL FORM FIELDS
function validateInsertForm(form) {
  var msgField = document.getElementById("msg");
  msgField.innerHTML = "";
  msgField.className = "error";
  if (form["op"][0].checked || form["op"][2].checked) { // Update/Move
    return (validateDate(form["date"], msgField) &&
            validateAmt(form["amt"], msgField) &&
            validateNote(form["note"], msgField));
  } else {
    return true;
  }
}

function validateAddTransaction(form) {
  var msgField = document.getElementById("msg");
  msgField.innerHTML = "";
  msgField.className = "error";
  return (validateDate(form["date"], msgField) && 
          validateAccGrp(form["grp"], msgField) &&
          validateAmt(form["amt"], msgField) &&
          validateNote(form["note"], msgField));
}
