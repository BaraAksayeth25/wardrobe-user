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

const createCategory = async (req, res, next) => {
  const newCategory = new CategoryModel({
    name: req.params.ct,
  });
  try {
    newCategory.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "Success" }).status(201);
};

module.exports = { getAllCategory, createCategory };
