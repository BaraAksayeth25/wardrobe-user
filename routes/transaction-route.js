const express = require("express");
const { check } = require("express-validator");
const Authentication = require("../middlewares/authenticate");
const route = express.Router();

const {
  createTransaction,
  getTransactionByBookingCode,
  getTransactionByUser,
} = require("../controllers/user/transaction-controller");

route.use(Authentication);

route.get("/user", getTransactionByUser);

route.get(
  "/code/:bookingCode",
  [check("bookingCode").isString().isLength({ min: 16, max: 16 })],
  getTransactionByBookingCode
);

route.post("/create", createTransaction);

module.exports = route;
