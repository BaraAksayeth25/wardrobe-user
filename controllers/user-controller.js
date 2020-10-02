const bcrypt = require("bcryptjs");
const HttpError = require("../models/http-error");
const UserModel = require("../models/user-model");
const RegistModel = require("../models/registation-model");
const randomString = require("crypto-random-string");
const sendEmail = require("../helpers/email-verification");
const { validationResult } = require("express-validator");
const { async } = require("crypto-random-string");

const signup = async (req, res, next) => {
  // validation body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `${errors.errors[0].msg} in ${errors.errors[0].param} `,
        400
      )
    );
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

  const token = randomString({ length: 32, type: "url-safe" });

  const newRegist = new RegistModel({
    email,
    name,
    password: hashPassword,
    tokenActivation: token,
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

  res.json({ message: "OK", token, email }).status(201);
};

const activateAccount = async (req, res, next) => {
  const token = req.params.tokenActivate;

  // Check in database
  let dataRegist;
  try {
    dataRegist = await RegistModel.findOne({ tokenActivation: token });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!dataRegist) {
    return next(new HttpError("Data Not Found", 404));
  }

  // Desctructuring
  const { name, email, password, tokenExpired } = dataRegist;

  if (tokenExpired < Date.now()) {
    try {
      await RegistModel.deleteOne({ tokenActivation: token });
    } catch (err) {
      return next(new HttpError(err.message, 500));
    }
    return next(new HttpError("Token has Expired, please try again", 403));
  }

  const newUser = new UserModel({
    email,
    name,
    password,
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK" });
};

module.exports = { signup, activateAccount };
