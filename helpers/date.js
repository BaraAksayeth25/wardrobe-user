module.exports = (date, days) => {
  const copy = new Date(+date);
  copy.setDate(date.getDate() + days);
  return copy;
};
