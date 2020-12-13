const express = require("express");
const route = express.Router();

const authenticateAdmin = require("../middlewares/authenticate-admin");
const { roleAdmin } = require("../middlewares/role-check");
const {
  getFiveYearsLatest,
  getMonthsInYear,
  getWeeksOfMonth,
} = require("../controllers/admin/report-controller");

route.use(authenticateAdmin, roleAdmin);
route.get("/year", getFiveYearsLatest);
route.get("/year/:year", getMonthsInYear);
route.get("/year/:year/month/:month", getWeeksOfMonth);

module.exports = route;
