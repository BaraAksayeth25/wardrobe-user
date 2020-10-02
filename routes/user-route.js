const express = require("express");
const { check } = require("express-validator");
const { signup, activateAccount } = require("../controllers/user-controller");
const route = express.Router();

route.get("/", (req, res, next) => {
  res.json({ message: "Hello I'm User Route" });
});

route.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("name").not().isEmpty(),
    check("password").trim().isLength({ min: 6 }),
  ],
  signup
);

route.patch("/activate/:tokenActivate", activateAccount);

module.exports = route;
