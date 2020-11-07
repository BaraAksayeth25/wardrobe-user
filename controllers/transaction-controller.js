const randomString = require("crypto-random-string");
const { validationResult } = require("express-validator");
const addDays = require("../helpers/date");

const TransactionModel = require("../models/transaction-model");
const HttpError = require("../models/http-error");

const createTransaction = async (req, res, next) => {
  const bookingCode = randomString({ length: 16, type: "distinguishable" });

  const { email, products, totalPrice, days } = req.body;

  if (email !== req.userData.email) {
    return next(new HttpError("Access Forbidden", 403));
  }

  const now = new Date();
  const overDue = addDays(now, days);

  const doc = new TransactionModel({
    bookingCode,
    email,
    totalPrice,
    products,
    date: now,
    overDue,
    days,
  });

  let newTransaction;
  try {
    newTransaction = await TransactionModel.populate(doc, {
      path: "products._id",
    });
  } catch (err) {
    return next(new HttpError(err.message));
  }

  let stockExceed = false;

  const productTransaction = newTransaction.products;

  productTransaction.forEach((productOfTransaction) => {
    const stockOfProduct = productOfTransaction._id.stocks.filter(
      (stock) => stock.size === productOfTransaction.size
    );
    // Cek jika stok yang dibeli melebihi stok yang tersedia
    if (
      stockOfProduct.length === 0 ||
      productOfTransaction.stock >= stockOfProduct[0].stock
    ) {
      return (stockExceed = true);
    }
  });

  let error;
  const totalPriceProduct = productTransaction.reduce((accProd, curProd) => {
    try {
      return (
        accProd.stock * accProd._id.price + curProd.stock * curProd._id.price
      );
    } catch (err) {
      error = err;
    }
  });

  //   Cek jika stok melebihi bata dan harga total tidak sama
  if (error || stockExceed || totalPriceProduct !== totalPrice) {
    return next(
      new HttpError(
        error ||
          "Stock not available or Stock Exceeds Limit or unknown TotalPrice",
        error ? 500 : 400
      )
    );
  }

  try {
    await newTransaction.save();
  } catch (err) {
    return next(new HttpError(err.message));
  }

  res
    .json({
      message: "OK",
      data: newTransaction,
    })
    .status(201);
};

const getTransactionByBookingCode = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `${errors.errors[0].msg} in ${errors.errors[0].param} `,
        400
      )
    );
  }

  const { email } = req.userData;

  const bookingCode = req.params.bookingCode;
  let transaction;
  try {
    transaction = await TransactionModel.findOne({ bookingCode }).populate(
      "products._id"
    );
  } catch (err) {
    return next(new HttpError(err.message));
  }
  if (email !== transaction.email) {
    return next(new HttpError("Access Forbidden", 403));
  }
  res.json({ message: "OK", data: transaction });
};

const getTransactionByUser = async (req, res, next) => {
  const { email } = req.userData;

  let transactions;
  try {
    transactions = await TransactionModel.find({ email }).populate(
      "products._id"
    );
  } catch (err) {
    return next(new HttpError(err.message));
  }
  res.json({ message: "OK", data: transactions });
};

module.exports = {
  createTransaction,
  getTransactionByBookingCode,
  getTransactionByUser,
};
