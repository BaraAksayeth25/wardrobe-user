const express = require("express");
const route = express.Router();

const {
  getAllProduct,
  getProductById,
  getLatestProduct,
  getProductByCategory,
  getTopProduct,
  getProductByName,
  createProduct,
} = require("../controllers/product-controller");

route.get("/id/:id", getProductById);
route.get("/pages/:pages", getAllProduct);
route.get("/ct/:ct/pages/:pages", getProductByCategory);
route.get("/name/:name/pages/:pages", getProductByName);
route.get("/latest", getLatestProduct);
route.get("/top", getTopProduct);
route.post("/add", createProduct);

module.exports = route;
