const express = require("express");
const { check } = require("express-validator");

const adminAuthenticate = require("../middlewares/authenticate-admin");
const imageUpload = require("../middlewares/image-upload");

const { roleAdmin } = require("../middlewares/role-check");

const route = express.Router();

const {
  getAllProduct,
  getProductById,
  getLatestProduct,
  getProductByCategory,
  getTopProduct,
  getProductByName,
  checkAvailableStock,
} = require("../controllers/user/product-controller");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} = require("../controllers/admin/product-controller");

route.get("/id/:id", getProductById);
route.get("/pages/:pages", getAllProduct);
route.get("/ct/:ct/pages/:pages", getProductByCategory);
route.get("/name/:name/pages/:pages", getProductByName);
route.get("/latest", getLatestProduct);
route.get("/top", getTopProduct);
route.post("/check", checkAvailableStock);

route.use(adminAuthenticate, roleAdmin);

route.get("/all", getAllProducts);

route.post(
  "/add",
  [
    check("name").notEmpty().isLength({ min: 1 }),
    check("description").isString().notEmpty(),
    check("price").isInt({ min: 0 }),
    check("category").isMongoId(),
  ],
  imageUpload.single("image"),
  createProduct
);

route.patch(
  "/edit/:id",
  [
    check("name").optional().notEmpty().isLength({ min: 1 }),
    check("description").optional().isString().notEmpty(),
    check("price").optional().isInt({ min: 0 }),
    check("category").optional().isMongoId(),
  ],
  imageUpload.single("image"),
  updateProduct
);

route.delete("/delete/:id", check("id").isMongoId(), deleteProduct);

module.exports = route;
