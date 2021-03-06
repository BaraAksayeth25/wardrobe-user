const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../../models/http-error");
const UserModel = require("../../models/user-model");
const RegistationModel = require("../../models/registation-model");
const randomString = require("crypto-random-string");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../../helpers/email-verification");
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
      { expiresIn: "1h" }
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
      RegistationModel.findOne({ email: email }),
      bcrypt.hash(password, 12),
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (alreadyAccount || alreadyVerify) {
    return next(new HttpError("Email has already", 400));
  }

  const token = randomString({ length: 32, type: "url-safe" });

  const newRegist = new RegistationModel({
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

  res.json({ message: "OK", token: token }).status(201);
};

const activateAccount = async (req, res, next) => {
  const token = req.params.tokenActivate;

  // Check in database
  let dataRegist;
  try {
    dataRegist = await RegistationModel.findOneAndDelete({
      tokenActivation: token,
    });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!dataRegist) {
    return next(new HttpError("Data Not Found", 404));
  }

  // Desctructuring
  const { name, email, password, tokenExpired, phone } = dataRegist;

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
      { id: newUser.id, email: newUser.email },
      process.env.JWT_KEY_ACCESS,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK", token: newToken }).status(201);
};

const updateProfilePict = async (req, res, next) => {
  const email = req.userData.email;
  try {
    let user = await UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          profilePict: req.file.filename,
        },
      }
    );
    user.profilePict !== process.env.DEFAULT_PROFILE_PICT &&
      fs.unlinkSync(path.resolve("uploads", "images", `${user.profilePict}`));
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
  const { name, phone } = req.body;

  let user;
  try {
    user = await UserModel.findById(userId);
  } catch (err) {
    return next(new HttpError(err.message));
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError(err.message));
  }
  return res.json({ message: "OK" });
};

const changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return next(
      new HttpError(`${errors.errors[0].msg} in ${errors.errors[0].param}`, 400)
    );
  }

  const {
    password,
    confirmPassword,
    newPassword,
    confirmNewPassword,
  } = req.body;

  if (password !== confirmPassword || newPassword !== confirmNewPassword) {
    return next(new HttpError("Bad confirmation password", 400));
  }

  const email = req.userData.email;
  let user;
  let hashPassword;
  try {
    [user, hashPassword] = await Promise.all([
      UserModel.findOne({ email }),
      bcrypt.hash(newPassword, 12),
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  let isValid = true;
  try {
    isValid = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!isValid) {
    return next(new HttpError("Password is invalid", 403));
  }

  user.password = hashPassword;
  try {
    await Promise.all([
      user.save(),
      sendEmail(email, "Change Password Account"),
    ]);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json({ message: "OK" });
};

module.exports = {
  signup,
  activateAccount,
  updateProfilePict,
  getUser,
  login,
  updateBiodata,
  changePassword,
};
