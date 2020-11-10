const randomString = require("crypto-random-string");

const OrderModel = require("../../models/order-model");
const TransactionModel = require("../../models/transaction-model");
const HttpError = require("../../models/http-error");

const getOrderOnGoing = async (req, res, next) => {
  const email = req.userData.email;
  let order;
  try {
    order = await OrderModel.find(
      { email, status: "On Going" },
      {},
      { sort: { createdAt: -1 } }
    );
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: order });
};

const getOrderFinished = async (req, res, next) => {
  const email = req.userData.email;

  let order;
  try {
    order = await OrderModel.find(
      { email, status: "Finished" },
      {},
      { sort: { createdAt: -1 } }
    );
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: order });
};

const createOrder = async (req, res, next) => {
  const { bookingCode } = req.body;
  let transaction;
  try {
    transaction = await TransactionModel.findOneAndDelete({ bookingCode });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!transaction) {
    return next(new HttpError("Transaction Not Found", 404));
  }
  const { email, days, products, totalPrice, date, overDue } = transaction;

  const newOrder = new OrderModel({
    email,
    bookingCode: transaction.bookingCode,
    totalPrice,
    products,
    date,
    days,
    overDue,
  });

  try {
    await newOrder.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK", data: newOrder });
};

module.exports = { createOrder, getOrderOnGoing, getOrderFinished };
