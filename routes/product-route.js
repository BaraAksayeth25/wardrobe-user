const express = require("express");
const route = express.Router();

const {
  getAllProduct,
  getProductById,
  getProductByCategory,
  createProduct,
} = require("../controllers/product-controller");

route.get("/id/:id", getProductById);
route.get("/pages/:pages", getAllProduct);
route.get("/ct/:ct/pages/:pages", getProductByCategory);
route.get("/add", createProduct);

module.exports = route;
