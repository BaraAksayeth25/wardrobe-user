const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");

const ProductModel = require("../../models/product-model");
const HttpError = require("../../models/http-error");

const createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`, 400)
    );
  }

  const { name, description, category, price } = req.body;
  let stocks = req.body.stocks;
  stocks = JSON.parse(stocks);
  
  try {
    await ProductModel.create({
      name,
      category,
      description,
      stocks,
      price,
      image: req.file && req.file.filename,
    });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK" });
};

const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`, 400)
    );
  }

  const id = req.params.id;
  const { name, description, category, price } = req.body;
  let stocks = req.body.stocks;
  stocks = JSON.parse(stocks)

  let product;
  try {
    product = await ProductModel.findById(id);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!product) {
    return next(new HttpError("Product Not Found", 404));
  }
  if (req.file && product.image !== process.env.DEFAULT_IMAGE_PRODUCT) {
    try {
      fs.unlinkSync(path.resolve("uploads", "images", product.image));
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.category = category || product.category;
  product.price = price || product.price;
  product.stocks = stocks || product.stocks;

  if (req.file) {
    product.image = req.file.filename;
  }

  try {
    await product.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK" });
};

const deleteProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`)
    );
  }

  const id = req.params.id;

  let product;
  try {
    product = await ProductModel.findByIdAndDelete(id);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!product) {
    return next(new HttpError("Product not found", 404));
  }
  if (product.image !== process.env.DEFAULT_IMAGE_PRODUCT) {
    try {
      fs.unlinkSync(path.resolve("uploads", "images", product.image));
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  }
  res.json({ message: "OK" });
};

const getAllProducts = async (req, res, next) => {
  let products;
  try {
    products = await ProductModel.find(
      {},
      { __v: 0 },
      { sort: { createdAt: -1 } }
    ).populate("category");
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: products });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
