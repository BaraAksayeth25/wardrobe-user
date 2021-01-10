const randomString = require("crypto-random-string");
const { validationResult } = require("express-validator");
const TransactionModel = require("../../models/transaction-model");
const ProductModel = require("../../models/product-model");
const HttpError = require("../../models/http-error");

const { addDays } = require("../../helpers/date");
const reduceSameStock = require("../../helpers/reduce-stock");

const createTransaction = async (req, res, next) => {
  const bookingCode = randomString({ length: 16, type: "distinguishable" });

  const { email, totalPrice, days } = req.body;
  let products = req.body.products;
  products = reduceSameStock(products);

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

  if (!newTransaction) {
    return next(new HttpError("Product Not Found", 404));
  }

  const productTransaction = newTransaction.products;

  let setStockProducts = [];
  let priceProducts = 0;
  for (const productOfTransaction of productTransaction) {
    const stockOfProduct = productOfTransaction._id.stocks.find(
      (stock) => stock.size === productOfTransaction.size
    );
    if (productOfTransaction.stock === 0) {
      return next(new HttpError("Minimal stock is One", 400));
    }

    // Cek jika stok yang dibeli melebihi stok yang tersedia
    if (!stockOfProduct || productOfTransaction.stock > stockOfProduct.stock) {
      return next(new HttpError("Stock not avaliable", 400));
    }
    try {
      // Mengambil total harga dari produk yang dipesan
      priceProducts +=
        productOfTransaction.stock * productOfTransaction._id.price;

      let productInTransaction = await ProductModel.findById(
        productOfTransaction._id._id
      );
      // Mencari stock yang sudah di kurang
      const existStock = setStockProducts.findIndex(
        (product) =>
          product._id.toString() == productInTransaction._id.toString()
      );

      // Jika product tidak terdaftar di existStock
      if (existStock < 0) {
        // Update stock dari findById products
        productInTransaction.stocks = productInTransaction.stocks.map((stock) =>
          stock.size === productOfTransaction.size
            ? {
                size: stock.size,
                stock: stock.stock - productOfTransaction.stock,
              }
            : stock
        );
        // Masukkan ke existStocks
        setStockProducts.push(productInTransaction);
      } else {
        // Update stocks dari existStock
        setStockProducts[existStock].stocks = setStockProducts[
          existStock
        ].stocks.map((stock) =>
          stock.size === productOfTransaction.size
            ? {
                size: stock.size,
                stock: stock.stock - productOfTransaction.stock,
              }
            : stock
        );
      }
    } catch (err) {
      return next(new HttpError(err.message, 500));
    }
  }

  try {
    priceProducts *= days; // Mengalikan total harga dengan hari pemesanan
    if (priceProducts !== totalPrice) {
      return next(new HttpError("Price Not Same", 400));
    }

    // Update stock
    for (const newStock of setStockProducts) {
      await newStock.save();
    }
  } catch (err) {
    return next(new HttpError(err.message, 500));
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
  if (!transaction) {
    return next(new HttpError("Transaction Not Found", 404));
  }
  if (email !== transaction.email) {
    return next(new HttpError("Access Forbidden", 403));
  }
  // if(!transaction)
  res.json({ message: "OK", data: transaction });
};

const getTransactionByUser = async (req, res, next) => {
  const { email } = req.userData;

  let transactions;
  try {
    transactions = await TransactionModel.find(
      { email },
      {},
      { sort: { createdAt: -1 } }
    ).populate("products._id");
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
