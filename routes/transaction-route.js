const express = require("express");
const { check } = require("express-validator");
const authenticate = require("../middlewares/authenticate");
const adminAuthenticate = require("../middlewares/authenticate-admin");

const route = express.Router();

const {
  createTransaction,
  getTransactionByBookingCode,
  getTransactionByUser,
} = require("../controllers/user/transaction-controller");
const {
  getTransactionAdmin,
  verifyTransaction,
} = require("../controllers/admin/transaction-controller");

route.get("/user", authenticate, getTransactionByUser);

route.get(
  "/code/:bookingCode",
  authenticate,
  check("bookingCode").isString().isLength({ min: 16, max: 16 }),
  getTransactionByBookingCode
);

route.post("/create", authenticate, createTransaction);

route.get("/");

// Admin route
route.use(adminAuthenticate);

route.get(
  "/admin/code/:code",
  check("code").isString().isLength({ min: 16, max: 16 }),
  getTransactionAdmin
);

route.patch("/admin/verify/:id", check("id").isMongoId(), verifyTransaction);

module.exports = route;
