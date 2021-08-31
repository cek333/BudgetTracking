const express = require('express');
const router = express.Router();

const transactions = [
  { date: '2010-10-10', transNum: 1000, group: 'mbna', comments: 'paid balance', amt: 10, balance: 100 },
  { date: '2010-11-10', transNum: 1010, group: 'visa', comments: 'paid balance', amt: 20, balance: 80 },
  { date: '2010-12-10', transNum: 1020, group: 'food', comments: 'groceries', amt: 30, balance: 50 }
];
const accList = ['bank_2020', 'cash_2020', 'charity_2020'];
const accGrpList = [
  'bank_2020/mbna', 'bank_2020/visa', 'bank_2020/food',
  'cash_2020/food', 'cash_2020/charity',
  'charity_2020/africa', 'charity_2020/haiti'
];
const data = {
  msg: 'test',
  todaysDate: '2021-05-26',
  priAcc: 'bank_2020',
  priAccUrl: '/edit?edit_priacc=bank_2020',
  transactions,
  accList,
  accGrpList
};

// Home page route
router.get('/edit', function (req, res) {
  console.log('get /edit');
  res.render('edit', { layout: 'edit', ...data });
/*
  # print out raw data in edit mode
  open (ACC, '$priAcc.acc') or 
    endPage('editMode: ERROR opening account $priAcc', 1);

  # File format:
  # date, trans #, group, comments, amt, balance

  #<table rules=\'all\' border=\'3\'>\n';
  <div class='table fullwidth'>\n';
  <ACC>; # remove line with transaction number
  while(<ACC>) {
    s/\s*$//;
    encode_entities($_);
    @rgTrans = split /,/;
    $transNum = $rgTrans[1];
    print qq(<div class='row' id='trans_$transNum'>) .
      qq(<div class='colDate'>$rgTrans[0]</div>\n) .
      qq(  <div class='colTrans'><input type='button' onclick='insertForm('$priAcc','$rgTrans[0]','$rgTrans[1]','$rgTrans[2]','$rgTrans[3]','$rgTrans[4]','$rgTrans[5]')' value='Edit $transNum' /></div>\n) .
      qq(  <div class='colGrp'>) . lc($rgTrans[2]) . qq(</div>) . 
      qq(<div class='colAmt'>$rgTrans[4]</div>\n) . 
      qq(  <div class='colBal'>$rgTrans[5]</div>) . 
      qq(<div class='colNote'>&nbsp; $rgTrans[3]</div></div>\n);
  }
  close(ACC);
*/
});

router.post('/edit', function(req, res) {
  console.log(req.body);
  res.redirect('/edit');
});

module.exports = router;
