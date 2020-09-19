const express = require("express");

const route = express.Router();

route.get("/", (req, res, next) =>
  res.json({ message: "Hello I'm Product Route" })
);

module.exports = route;
