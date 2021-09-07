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

module.exports = {
  roundToDecimalPlaces,
  currencyRound
};
