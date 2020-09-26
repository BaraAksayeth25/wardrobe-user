const express = require("express");
const route = express.Router();

const {
  getAllProduct,
  getProductById,
} = require("../controllers/product-controller");

route.get("/:pages", getAllProduct);
route.get("/id/:id", getProductById);

module.exports = route;
