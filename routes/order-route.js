const express = require("express");
const authentication = require("../middlewares/authenticate");
const adminAuthenticate = require("../middlewares/authenticate-admin");

const route = express.Router();

const { roleCashier, roleAdmin } = require("../middlewares/role-check");

const {
  getOrderFinished,
  getOrderOnGoing,
} = require("../controllers/user/order-controller");

const {
  getOrderByBookingCodeAdmin,
  getOrderFinishedAdmin,
  getOrderOnGoingAdmin,
  finishingOrderAdmin,
} = require("../controllers/admin/order-controller");

route.get("/user/ongoing", authentication, getOrderOnGoing);

route.get("/user/finished", authentication, getOrderFinished);

route.use(adminAuthenticate);

route.get("/admin/finished/pages/:pages", roleAdmin, getOrderFinishedAdmin);

route.get("/admin/ongoing/pages/:pages", roleAdmin, getOrderOnGoingAdmin);

route.get("/admin/code/:code", roleCashier, getOrderByBookingCodeAdmin);

route.patch("/admin/code/:code", roleCashier, finishingOrderAdmin);

module.exports = route;
