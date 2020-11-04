const express = require("express");
const { check } = require("express-validator");
const {
  signup,
  activateAccount,
  getUser,
  updateProfilePict,
  login,
} = require("../controllers/user-controller");
const ImageUploader = require("../middlewares/image-upload");
const Authentication = require("../middlewares/authenticate");
const route = express.Router();

route.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("name").not().isEmpty(),
    check("password").trim().isLength({ min: 6 }),
  ],
  signup
);

route.post("/login", check("email").normalizeEmail().isEmail(), login);

route.patch("/activate/:tokenActivate", activateAccount);

route.use(Authentication);

route.patch(
  "/profile/picture",
  ImageUploader.single("image"),
  updateProfilePict
);

route.get("/user", getUser);

module.exports = route;
