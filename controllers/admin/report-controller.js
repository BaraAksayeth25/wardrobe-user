const OrderModel = require("../../models/order-model");
const HttpError = require("../../models/http-error");
const convertReport = require("../../helpers/report-convert");

const getFiveYearsLatest = async (req, res, next) => {
  let report;
  const now = new Date();
  const year = now.getFullYear();
  try {
    report = await OrderModel.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(year - 5, 1, 1),
            $lte: new Date(year, 12, 31),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$date" } },
          count: { $sum: 1 },
        },
      },
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  const finishReport = convertReport(report, "year", year, year - 4);

  res.json({ message: "OK", data: finishReport });
};

const getMonthsInYear = async (req, res, next) => {
  let report;
  const year = +req.params.year;
  try {
    report = await OrderModel.aggregate([
      {
        $project: {
          date: 1,
          year: { $year: "$date" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$date" } },
          count: { $sum: 1 },
        },
      },
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  const finishReport = convertReport(report, "month", 12, 1);
  const result = { year: year, report: finishReport };
  res.json({ message: "OK", data: result });
};

const getWeeksOfMonth = async (req, res, next) => {
  const { year, month } = req.params;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let report;
  try {
    report = await OrderModel.aggregate([
      {
        $project: {
          date: 1,
          year: { $year: "$date" },
          month: { $month: "$date" },
          weekOfMonth: {
            $ceil: {
              $divide: [{ $dayOfMonth: "$date" }, 7],
            },
          },
        },
      },
      {
        $match: {
          month: +month,
          year: +year,
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $gte: ["$weekOfMonth", 5] }, 4, "$weekOfMonth"],
          },
          count: { $sum: 1 },
        },
      },
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  const finishReport = convertReport(report, "week", 4, 1);
  const result = {
    year: +year,
    month: months[month - 1],
    report: finishReport,
  };
  res.json({ message: "OK", data: result });
};

module.exports = { getFiveYearsLatest, getMonthsInYear, getWeeksOfMonth };
