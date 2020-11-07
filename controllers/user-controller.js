const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const UserModel = require("../models/user-model");
const RegistModel = require("../models/registation-model");
const randomString = require("crypto-random-string");
const sendEmail = require("../helpers/email-verification");
const { validationResult } = require("express-validator");

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

  // Search by email
  let user;
  try {
    user = await UserModel.findOne({ email });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  if (!user) {
    return next(new HttpError("Email or and password is wrong", 400));
  }

  // Compare password
  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  if (!isValid) {
    return next(new HttpError("Email or and password is wrong", 400));
  }

  // Generate token
  let token;
  try {
    token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY_ACCESS,
      { expiresIn: "15min" }
    );
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.json({ message: "OK", token: token });
};

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

  const { email, name, password, phone } = req.body;

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
    phone,
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
  const { name, email, password, tokenExpired, phone } = dataRegist;

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
    phone,
  });

  let newToken;
  try {
    await newUser.save();
    newToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY_ACCESS,
      { expiresIn: "15min" }
    );
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK", token: newToken }).status(201);
};

const updateProfilePict = async (req, res, next) => {
  const email = req.userData.email;
  try {
    await UserModel.updateOne(
      { email },
      {
        $set: {
          profilePict: req.file.path,
        },
      }
    );
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK" });
};

const getUser = async (req, res, next) => {
  const id = req.userData.id;
  if (!id) return next(new HttpError("Access Denied", 401));
  let user;
  try {
    user = await UserModel.findById(id, { password: 0, __v: 0 });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!user) return next(new HttpError("User Not Found", 404));
  res.json({ message: "OK", data: user });
};

const updateBiodata = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `${errors.errors[0].msg} in ${errors.errors[0].param} `,
        400
      )
    );
  }

  const userId = req.userData.id;
  const { name, phone, email } = req.body;

  let user;
  try {
    user = await UserModel.findById(userId);
  } catch (err) {
    return next(new HttpError(err.message));
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.email = email || user.email;

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError(err.message));
  }
  return res.json({ message: "OK" });
};

module.exports = {
  signup,
  activateAccount,
  updateProfilePict,
  getUser,
  login,
  updateBiodata,
};
