const express = require("express");
const { check } = require("express-validator");
const route = express.Router();

const {
  signup,
  login,
  getAdmin,
} = require("../controllers/admin/admin-controller");
const adminAuthenticate = require("../middlewares/authenticate-admin");

route.post("/login", check("email").isEmail(), login);

route.post(
  "/signup",
  [check("email").isEmail(), check("name").not().isEmpty()],
  signup
);

route.use(adminAuthenticate);

route.get("/admin", getAdmin);

module.exports = route;
