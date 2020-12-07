const express = require("express");
const route = express.Router();

const authenticate = require("../middlewares/authenticate");
const { roleAdmin } = require("../middlewares/role-check");
const {
  getFiveYearsLatest,
  getMonthsInYear,
} = require("../controllers/admin/report-controller");

// route.use(authenticate, roleAdmin);
route.get("/years", getFiveYearsLatest);
route.get("/years/:year", getMonthsInYear);

module.exports = route;
