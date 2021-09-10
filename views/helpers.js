module.exports = {
  containsError: (text) => {
    return text.indexOf('ERROR') >= 0;
  },
  join: (text1, text2) => {
    return `${text1}${text2}`;
  },
  lowercase: (text) => {
    return text.toLowerCase();
  },
  uppercase: (text) => {
    return text.toUpperCase();
  },
  toDollars: (num) => {
    // num could be null if cached lastTransaction value is null
    return num === null ? null : num.toFixed(2);
  },
  fourDigit: (num) => {
    const numStr = num.toString();
    return numStr.length >= 4 ? numStr : ('0'.repeat(4 - numStr.length) + numStr);
  },
  toEdit: (id, editId) => {
    return editId !== null && id === editId;
  },
  matches: (text1, text2) => {
    return text1 === text2;
  },
  matchesGrp: (accGrp, grp) => {
    return accGrp.indexOf(`/${grp}`) >= 0;
  }
};
