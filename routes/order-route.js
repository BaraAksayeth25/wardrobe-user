const express = require("express");
const Authentication = require("../middlewares/authenticate");

const route = express.Router();

const {
  createOrder,
  getOrderFinished,
  getOrderOnGoing,
} = require("../controllers/order-controller");

route.post("/add", createOrder);
route.use(Authentication);

route.get("/user/ongoing", getOrderOnGoing);

route.get("/user/finished", getOrderFinished);

module.exports = route;
