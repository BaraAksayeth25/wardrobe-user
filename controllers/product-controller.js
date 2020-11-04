const ProductModel = require("../models/product-model");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const getAllProduct = async (req, res, next) => {
  const pages = parseInt(req.params.pages) || 1;
  const skipDocument = pages <= 1 ? 0 : pages * 10 - 10;
  const limitDocument = 10;
  let product;
  try {
    product = await ProductModel.find()
      .populate("category")
      .skip(skipDocument)
      .limit(limitDocument);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK", data: product });
};

const getProductById = async (req, res, next) => {
  const productId = req.params.id;
  if (!productId) {
    return next(new HttpError("Invalid Id Product", 403));
  }
  let product;
  try {
    product = await ProductModel.findById(productId).populate("category");
  } catch (err) {
    return next(new HttpError(err, 500));
  }
  res.json({ message: "OK", data: product });
};

const getProductByCategory = async (req, res, next) => {
  const pages = parseInt(req.params.pages) || 1;
  const skipDocument = pages <= 1 ? 0 : pages * 10 - 10;
  const limitDocument = 10;
  const categoryId = req.params.ct;
  if (!categoryId) {
    return next(new HttpError("Invalid Id Product", 403));
  }
  let product;
  try {
    product = await ProductModel.find({ category: categoryId })
      .populate("category")
      .skip(skipDocument)
      .limit(limitDocument);
  } catch (err) {
    return next(new HttpError(err, 500));
  }
  res.json({ message: "OK", data: product });
};

const getLatestProduct = async (req, res, next) => {
  let product;
  try {
    product = await ProductModel.find(
      {},
      {},
      { sort: { createdAt: -1 } }
    ).limit(4);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: product });
};

const createProduct = async (req, res, next) => {
  const newProduct = new ProductModel({
    name: "Jaz Thigao Kin",
    category: new mongoose.Types.ObjectId("5f70179d45eba01ad085d495"),
    description: "Event formal with the team",
    stocks: [{ size: "L", stock: 12 }],
    price: 120000,
  });
  try {
    await newProduct.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "Success" });
};

module.exports = {
  getAllProduct,
  getProductById,
  getProductByCategory,
  getLatestProduct,
  createProduct,
};
