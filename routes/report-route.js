const express = require("express");
const route = express.Router();

const authenticate = require("../middlewares/authenticate");
const { roleAdmin } = require("../middlewares/role-check");
const {
  getFiveYearsLatest,
  getMonthsInYear,
  getWeeksOfMonth,
} = require("../controllers/admin/report-controller");

route.use(authenticate, roleAdmin);
route.get("/year", getFiveYearsLatest);
route.get("/year/:year", getMonthsInYear);
route.get("/year/:year/month/:month", getWeeksOfMonth);

module.exports = route;
