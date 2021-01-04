const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const HttpError = require("../../models/http-error");
const AdminModel = require("../../models/admin-model");

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `${errors.errors[0].msg} in ${errors.errors[0].param} `,
        400
      )
    );
  }

  const { email, password, name, role } = req.body;

  let alreadyAdmin;
  let hashPassword;
  try {
    [alreadyAdmin, hashPassword] = await Promise.all([
      AdminModel.findOne({ email }),
      bcrypt.hash(password, 12),
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  if (alreadyAdmin) {
    return next(new HttpError("Email has already", 400));
  }

  const newAdmin = new AdminModel({
    email,
    name,
    password: hashPassword,
    role:
      role.toLowerCase() === "admin"
        ? "Admin"
        : role.toLowerCase() === "cashier"
        ? "Cashier"
        : "Admin",
  });

  try {
    await newAdmin.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK" });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `${errors.errors[0].msg} in ${errors.errors[0].param} `,
        400
      )
    );
  }
  const { email, password } = req.body;

  let admin;
  try {
    admin = await AdminModel.findOne({ email });
  } catch (err) {
    return next(new HttpError(err.message));
  }
  if (!admin) {
    return next(new HttpError("Email or and Password has wrong", 400));
  }

  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, admin.password);
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!isValid) {
    return next(new HttpError("Email or and Password has wrong", 400));
  }

  let token;
  try {
    token = jwt.sign(
      { email: admin.email, id: admin.id, role: admin.role, name: admin.name },
      process.env.JWT_KEY_ACCESS_ADMIN,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.json({ message: "OK", token, role: admin.role });
};

const getAdmin = async (req, res, next) => {
  const id = req.userData.id;

  let admin;
  try {
    admin = await AdminModel.findById(id, { password: 0, __v: 0 });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: admin });
};

module.exports = { signup, login, getAdmin };
