const convertReport = (arrOfReport, type, initial, min) => {
  const resultOfReport = [];
  for (let i = initial; i >= min; i -= 1) {
    const report = arrOfReport.find((rprt) => +rprt._id === i);
    if (report) {
      const objectReport = {
        [type]: +report._id,
        count: report.count,
      };
      resultOfReport.push(objectReport);
    } else {
      const nullObject = { [type]: i, count: 0 };
      resultOfReport.push(nullObject);
    }
  }

  return resultOfReport;
};

module.exports = convertReport;
