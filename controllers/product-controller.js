const ProductModel = require("../models/product-model");
const HttpError = require("../models/http-error");

const getAllProduct = async (req, res, next) => {
  const skipDocument = parseInt(req.params.pages);
  const limitDocument = 10;
  let product;
  try {
    product = await ProductModel.find().skip(skipDocument).limit(limitDocument);
  } catch (err) {
    return next(new HttpError(err, 500));
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
    product = await ProductModel.findById(productId);
  } catch (err) {
    return next(new HttpError(err, 500));
  }
  res.json({ message: "OK", data: product });
};

module.exports = { getAllProduct, getProductById };
