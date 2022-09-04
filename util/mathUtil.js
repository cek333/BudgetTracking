// Src: https://medium.com/swlh/how-to-round-to-a-certain-number-of-decimal-places-in-javascript-ed74c471c1b8
const roundToDecimalPlaces = (num, decimalPlaces) => {
  const sign = Math.sign(num);
  const unsignedNum = num * sign;
  const rounded = Number(Math.round(unsignedNum + 'e' + decimalPlaces) + 'e-' + decimalPlaces);
  return rounded * sign;
};

const currencyRound = (num) => {
  return roundToDecimalPlaces(num, 2);
};

const getDateYYYYMMDD = () => {
  // Src: https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
  const curDate = new Date();
  const timezoneOffset = curDate.getTimezoneOffset();
  const timezoneDate = new Date(curDate.getTime() - (timezoneOffset * 60 * 1000));
  return timezoneDate.toISOString().split('T')[0];
};

module.exports = {
  roundToDecimalPlaces,
  currencyRound,
  getDateYYYYMMDD
};
