const { validationResult } = require("express-validator");

const CategoryModel = require("../../models/category-model");
const HttpError = require("../../models/http-error");

const getCategoryById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`, 400)
    );
  }
  const id = req.params.id;
  let category;
  try {
    category = await CategoryModel.findById(id);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!category) {
    return next(new HttpError("Category not found", 404));
  }
  res.json({ message: "OK", data: category });
};

const createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`, 400)
    );
  }

  const newCategory = new CategoryModel({
    name: req.body.name,
  });

  try {
    await newCategory.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK" });
};

const updateCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`, 400)
    );
  }
  const id = req.params.id;
  const name = req.body.name;

  let category;
  try {
    category = await CategoryModel.findByIdAndUpdate(id, { $set: { name } });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!category) {
    return next(new HttpError("Category Not Found", 404));
  }

  res.json({ message: "OK" });
};

const deleteCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`, 400)
    );
  }
  const id = req.params.id;
  let category;
  try {
    category = await CategoryModel.findByIdAndDelete(id);
  } catch (err) {
    return next(new HttpError(err.message));
  }
  if (!category) {
    return next(new HttpError("category Not Found", 404));
  }
  res.json({ message: "OK" });
};

module.exports = {
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
