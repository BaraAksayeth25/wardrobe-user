const express = require("express");
const { check } = require("express-validator");
const route = express.Router();

const { getAllCategory } = require("../controllers/user/category-controller");
const { roleAdmin, roleCashier } = require("../middlewares/role-check");

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} = require("../controllers/admin/category-controller");
const adminAuthenticate = require("../middlewares/authenticate-admin");

route.get("/", getAllCategory);

route.use(adminAuthenticate, roleAdmin);

route.get("/:id", check("id").isMongoId(), getCategoryById);

route.post("/add", check("name").trim().isString(), createCategory);

route.patch(
  "/edit/:id",
  [check("id").isMongoId(), check("name").trim().isString()],
  updateCategory
);

route.delete("/delete/:id", check("id").isMongoId(), deleteCategory);

module.exports = route;
