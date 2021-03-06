const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  if (!req.headers.authorization)
    return next(new HttpError("Un Authorized", 401));

  const token = req.headers.authorization.split(" ")[1];

  if (!token) return next(new HttpError("Access Denied", 403));

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_KEY_ACCESS);

    req.userData = decodeToken;

    next();
  } catch (err) {
    return next(new HttpError(err, 500));
  }
};
