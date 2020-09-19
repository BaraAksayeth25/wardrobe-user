const { raw } = require("body-parser");
const express = require("express");

const route = express.Router();

route.get("/", (req, res, next) => {
  res.json({ message: "Hello I'm User Route" });
});

module.exports = route;
