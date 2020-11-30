module.exports.addDays = (date, days) => {
  const copy = new Date(+date);
  copy.setDate(date.getDate() + days);
  return copy;
};

module.exports.countDays = (overDue, date) => {
  const diffTime = date.getTime() - overDue.getTime();
  const dateInDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return dateInDiff < 0 ? 0 : dateInDiff;
};
