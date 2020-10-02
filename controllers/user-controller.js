const bcrypt = require("bcryptjs");
const HttpError = require("../models/http-error");
const UserModel = require("../models/user-model");
const RegistModel = require("../models/registation-model");
const randomString = require("crypto-random-string");
const sendEmail = require("../helpers/email-verification");
const { validationResult } = require("express-validator");

const signup = async (req, res, next) => {
  // validation body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors.msg, 400));
  }

  const { email, name, password } = req.body;

  // Check if email already in database and hash the password
  let alreadyAccount, hashPassword, alreadyVerify;
  try {
    [alreadyAccount, alreadyVerify, hashPassword] = await Promise.all([
      UserModel.findOne({ email: email }),
      RegistModel.findOne({ email: email }),
      bcrypt.hash(password, 12),
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (alreadyAccount || alreadyVerify) {
    return next(new HttpError("Email has already", 400));
  }

  const token = randomString({ length: 20, type: "url-safe" });

  const newRegist = new RegistModel({
    email,
    name,
    password: hashPassword,
    tokenActivate: token,
  });

  // Save to regist
  try {
    await newRegist.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  // Send email verification
  try {
    await sendEmail(email, "Activate your Account in 1 Day", token);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK", token: token }).status(201);
};

module.exports = { signup };
