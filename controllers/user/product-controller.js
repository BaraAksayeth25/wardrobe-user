const mongoose = require("mongoose");
const escapeStringRegexp = require("escape-string-regexp");
const ProductModel = require("../../models/product-model");
const HttpError = require("../../models/http-error");
const reduceSameSize = require("../../helpers/reduce-stock");

const getAllProduct = async (req, res, next) => {
  const pages = parseInt(req.params.pages) || 1;
  const limitDocument = 8;
  const skipDocument = pages <= 1 ? 0 : (pages - 1) * limitDocument;
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
      { __v: 0 },
      { sort: { createdAt: -1 } }
    ).limit(4);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: product });
};

const getTopProduct = async (req, res, next) => {
  let product;
  try {
    product = await ProductModel.find(
      {},
      { __v: 0 },
      { sort: { createdAt: 1 } }
    ).limit(4);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: product });
};

const getProductByName = async (req, res, next) => {
  const pages = parseInt(req.params.pages) || 1;
  const skipDocument = pages <= 1 ? 0 : pages * 10 - 10;
  const limitDocument = 10;
  const name = req.params.name;
  if (!name) {
    return next(new HttpError("Name was invalid", 403));
  }

  const escapedRegex = escapeStringRegexp(name);
  const regex = new RegExp(`.*${escapedRegex}.*`, "gi");
  let product;
  try {
    product = await ProductModel.find({ name: { $regex: regex } })
      .skip(skipDocument)
      .limit(limitDocument);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: product, name });
};

const checkAvailableStock = async (req, res, next) => {
  const products = reduceSameSize(req.body.products);

  for (let i = 0; i < products.length; i++) {
    let product;
    try {
      product = await ProductModel.findById(products[i]._id);
    } catch (err) {
      return next(new HttpError(err.message, 500));
    }
    const indexOfStock = product.stocks.findIndex(
      (stock) => stock.size === products[i].size
    );
    products[i].maxStock = product.stocks[indexOfStock]?.stock || 0;
    products[i].available =
      product.stocks[indexOfStock]?.stock >= products[i].stock &&
      product.stocks[indexOfStock]?.stock !== 0
        ? true
        : false;
  }
  res.json({ message: "OK", data: products });
};

module.exports = {
  getAllProduct,
  getProductById,
  getProductByCategory,
  getLatestProduct,
  getTopProduct,
  getProductByName,
  checkAvailableStock,
};
