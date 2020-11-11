const CategoryModel = require("../../models/category-model");
const HttpError = require("../../models/http-error");

const getAllCategory = async (req, res, next) => {
  let category;
  try {
    category = await CategoryModel.find();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: category });
};

module.exports = { getAllCategory };
