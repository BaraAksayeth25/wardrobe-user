const express = require("express");
const route = express.Router();

const {
  getAllCategory,
  createCategory,
} = require("../controllers/category-controller");

route.get("/", getAllCategory);
route.get("/add", createCategory);

module.exports = route;
