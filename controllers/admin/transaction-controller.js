const { validationResult } = require("express-validator");
const TransactionModel = require("../../models/transaction-model");
const ProductModel = require("../../models/product-model");
const OrderModel = require("../../models/order-model");
const HttpError = require("../../models/http-error");

const getTransactionAdmin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `${errors.errors[0].msg} in ${errors.errors[0].param} `,
        400
      )
    );
  }
  const bookingCode = req.params.code;

  let transaction;
  try {
    transaction = await TransactionModel.findOne({ bookingCode }).populate(
      "products._id"
    );
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  if (!transaction) {
    return next(new HttpError("Transaction Not Found", 404));
  }
  res.json({ message: "OK", data: transaction });
};

const verifyTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `${errors.errors[0].msg} in ${errors.errors[0].param} `,
        400
      )
    );
  }

  const id = req.params.id;

  let transaction;
  try {
    transaction = await TransactionModel.findById(id);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!transaction) {
    return next(new HttpError("Transaction not found", 404));
  }

  const {
    products: productsTransaction,
    email,
    bookingCode,
    totalPrice,
    date,
    overDue,
    days,
  } = transaction;

  let order, deleteTransaction;
  try {
    [order, deleteTransaction] = await Promise.all([
      OrderModel.create({
        email,
        bookingCode,
        totalPrice,
        products: productsTransaction,
        date,
        days,
        overDue,
        cashier: req.userData.name,
      }),
      TransactionModel.findByIdAndDelete(id),
    ]);
    order = await order.populate("products._id").execPopulate();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK", invoice: order });
};

module.exports = {
  getTransactionAdmin,
  verifyTransaction,
};
